#!/usr/bin/env python3
"""
NeuroCode AI - Code Analyzer
Uses the ConfusionDetectorModel from sagemaker-training to analyse code.

Provides end-to-end code analysis:
  1. Segment source code into logical blocks
  2. Extract 50-dimensional features per segment
  3. Run inference with the trained ConfusionDetectorModel
  4. Return structured analysis results (complexity, confusion scores)

Usage:
  # Analyse a file
  python code_analyzer.py analyse --file path/to/source.py

  # Analyse inline code
  python code_analyzer.py analyse --code "def foo(): return 1"

  # Analyse with a trained model
  python code_analyzer.py analyse --file source.py --model confusion_detector.pth
"""

import os
import re
import json
import math
import argparse
from datetime import datetime
from typing import List, Dict, Any, Optional

import numpy as np

from feature_extractor import extract_features, _cyclomatic_complexity
from train_confusion_model import ConfusionDetectorModel

try:
    import torch
    TORCH_AVAILABLE = True
except ImportError:
    TORCH_AVAILABLE = False


# ---------------------------------------------------------------------------
# Code Segmentation
# ---------------------------------------------------------------------------

# Patterns that identify the start of a new code segment
_SEGMENT_PATTERNS = [
    ('function', re.compile(
        r'^([ \t]*)(def\s+\w+|function\s+\w+|'
        r'(?:const|let|var)\s+\w+\s*=\s*(?:async\s*)?\()',
        re.MULTILINE,
    )),
    ('class', re.compile(r'^([ \t]*)(class\s+\w+)', re.MULTILINE)),
    ('conditional', re.compile(
        r'^([ \t]*)(if\s+.+:|if\s*\(.+\)\s*\{)', re.MULTILINE
    )),
    ('loop', re.compile(
        r'^([ \t]*)(for\s+.+:|while\s+.+:|for\s*\(.+\)\s*\{|while\s*\(.+\)\s*\{)',
        re.MULTILINE,
    )),
    ('try_block', re.compile(r'^([ \t]*)(try\s*[:{])', re.MULTILINE)),
]


def _find_block_end(lines, start_idx, base_indent):
    """Find the end of an indented block starting at start_idx."""
    idx = start_idx + 1
    found_body = False
    last_content_idx = start_idx
    while idx < len(lines):
        line = lines[idx]
        stripped = line.strip()
        if not stripped:
            idx += 1
            continue
        current_indent = len(line) - len(line.lstrip())
        if current_indent > base_indent:
            found_body = True
            last_content_idx = idx
        elif found_body:
            # We left the indented body
            break
        else:
            # No indented body found; treat as single-line segment
            break
        idx += 1
    return last_content_idx


def segment_code(code: str) -> List[Dict[str, Any]]:
    """
    Split source code into logical segments (functions, classes, loops, etc.).

    Each segment is a dict with:
      - id: unique segment identifier
      - type: segment type (function, class, conditional, loop, try_block, module)
      - code: the source text of the segment
      - line_start: 1-based start line
      - line_end: 1-based end line
    """
    lines = code.split('\n')
    segments: List[Dict[str, Any]] = []
    covered = set()
    seg_counter = 0

    for seg_type, pattern in _SEGMENT_PATTERNS:
        for match in pattern.finditer(code):
            start_line_0 = code[:match.start()].count('\n')
            indent_str = match.group(1)
            base_indent = len(indent_str.replace('\t', '    '))

            end_line_0 = _find_block_end(lines, start_line_0, base_indent)

            # Ensure the segment is at least the matched line
            end_line_0 = max(end_line_0, start_line_0)

            segment_code_text = '\n'.join(lines[start_line_0:end_line_0 + 1])

            # Skip segments with no meaningful code content
            if not segment_code_text.strip():
                continue

            seg_counter += 1
            segments.append({
                'id': f'seg_{seg_counter}',
                'type': seg_type,
                'code': segment_code_text,
                'line_start': start_line_0 + 1,
                'line_end': end_line_0 + 1,
            })
            covered.update(range(start_line_0, end_line_0 + 1))

    # If no segments found or there are uncovered lines, add a 'module' segment
    if not segments:
        segments.append({
            'id': 'seg_1',
            'type': 'module',
            'code': code,
            'line_start': 1,
            'line_end': len(lines),
        })

    # Sort by start line
    segments.sort(key=lambda s: s['line_start'])

    # Re-number ids after sorting
    for i, seg in enumerate(segments, 1):
        seg['id'] = f'seg_{i}'

    return segments


# ---------------------------------------------------------------------------
# Complexity Scoring
# ---------------------------------------------------------------------------

def compute_complexity(code: str) -> float:
    """
    Compute a normalised complexity score (0-10) for a code snippet.

    Combines cyclomatic complexity, nesting depth, line count, and
    identifier density into a single score.
    """
    lines = code.split('\n')
    non_blank = [l for l in lines if l.strip()]
    line_count = max(len(non_blank), 1)

    cc = _cyclomatic_complexity(code)

    # Nesting depth
    depths = []
    for line in lines:
        stripped = line.lstrip()
        if stripped:
            leading = len(line) - len(stripped)
            depths.append(leading)
    max_depth = max(depths) if depths else 0
    depth_norm = min(max_depth / 20.0, 1.0)

    # Length factor
    length_factor = min(math.log1p(line_count) / 5.0, 1.0)

    # Combine
    score = (
        min(cc / 15.0, 1.0) * 4.0   # cyclomatic weight
        + depth_norm * 3.0            # nesting weight
        + length_factor * 3.0         # length weight
    )
    return round(min(score, 10.0), 1)


# ---------------------------------------------------------------------------
# Model Inference
# ---------------------------------------------------------------------------

def _load_model(model_path: str) -> 'torch.nn.Module':
    """Load a trained ConfusionDetectorModel from disk."""
    if not TORCH_AVAILABLE:
        raise RuntimeError('PyTorch is required for model inference')

    checkpoint = torch.load(model_path, map_location='cpu', weights_only=True)
    arch = checkpoint.get('model_architecture', {})
    model = ConfusionDetectorModel(
        input_dim=arch.get('input_dim', 50),
        hidden_dims=arch.get('hidden_dims', [128, 64]),
    )
    model.load_state_dict(checkpoint['model_state_dict'])
    model.eval()
    return model


def predict_confusion(model, features_list: List[List[float]]) -> List[float]:
    """
    Run the ConfusionDetectorModel on a batch of feature vectors.

    Returns a list of confusion probabilities (0-1).
    """
    if not TORCH_AVAILABLE:
        raise RuntimeError('PyTorch is required for model inference')

    tensor = torch.FloatTensor(features_list)
    with torch.no_grad():
        outputs = model(tensor).squeeze(-1)
    return outputs.tolist() if outputs.dim() > 0 else [outputs.item()]


def heuristic_confusion_score(features: List[float]) -> float:
    """
    Fallback heuristic confusion score when no trained model is available.

    Uses a weighted combination of key features as a proxy for how
    confusing a code segment is likely to be.
    """
    # Feature indices (0-based) with weights
    weights = {
        6: 0.15,   # max_indentation_depth
        17: 0.15,  # nested_depth
        19: 0.20,  # cyclomatic_complexity
        26: 0.10,  # has_recursion
        10: 0.05,  # if_count
        13: 0.05,  # while_loop_count
        23: 0.05,  # lambda_count
        41: 0.05,  # single_char_vars
        44: 0.05,  # magic_number_count
        36: 0.05,  # list_comprehension_count
        38: 0.05,  # bitwise_op_count
        45: 0.05,  # duplicate_line_ratio
    }
    score = sum(features[i] * w for i, w in weights.items() if i < len(features))
    return round(min(max(score, 0.0), 1.0), 4)


# ---------------------------------------------------------------------------
# Confusion Type Classification
# ---------------------------------------------------------------------------

def classify_confusion_type(features: List[float]) -> str:
    """Classify the dominant source of confusion from the feature vector."""
    indicators = {
        'logic': features[19] if len(features) > 19 else 0,        # cyclomatic
        'recursion': features[26] if len(features) > 26 else 0,    # has_recursion
        'nesting': features[17] if len(features) > 17 else 0,      # nested_depth
        'naming': features[41] if len(features) > 41 else 0,       # single_char_vars
        'complexity': features[6] if len(features) > 6 else 0,     # max_indent
    }
    return max(indicators, key=indicators.get)


# ---------------------------------------------------------------------------
# Main Analysis Pipeline
# ---------------------------------------------------------------------------

def analyse_code(
    code: str,
    language: str = 'auto',
    model_path: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Analyse source code using the sagemaker-training model pipeline.

    Args:
        code: Source code string to analyse.
        language: Programming language hint (default: auto-detect).
        model_path: Path to a trained confusion_detector.pth file.
                    If None, uses heuristic scoring.

    Returns:
        A dict with analysis_id, status, summary, and per-segment results.
    """
    analysis_id = f'ana_{int(datetime.now().timestamp() * 1000)}'

    # Try loading a trained model
    model = None
    if model_path and os.path.isfile(model_path):
        try:
            model = _load_model(model_path)
        except (FileNotFoundError, RuntimeError, KeyError) as exc:
            print(f'Warning: could not load model from {model_path}: {exc}')
            model = None

    # Segment the code
    segments = segment_code(code)

    # Extract features and score each segment
    all_features: List[List[float]] = []
    for seg in segments:
        feats = extract_features(seg['code'])
        all_features.append(feats)

    # Predict confusion scores
    if model is not None:
        confusion_scores = predict_confusion(model, all_features)
    else:
        confusion_scores = [heuristic_confusion_score(f) for f in all_features]

    # Build results
    results = []
    for seg, feats, conf_score in zip(segments, all_features, confusion_scores):
        complexity = compute_complexity(seg['code'])
        conf_type = classify_confusion_type(feats)
        results.append({
            'id': seg['id'],
            'type': seg['type'],
            'code': seg['code'],
            'line_start': seg['line_start'],
            'line_end': seg['line_end'],
            'complexity': complexity,
            'confusion_score': round(float(conf_score), 4),
            'confusion_type': conf_type,
            'confidence': 0.95 if model is not None else 0.60,
            'features': feats,
        })

    # Summary metrics
    scores = [r['confusion_score'] for r in results]
    complexities = [r['complexity'] for r in results]
    overall_confusion = round(float(np.mean(scores)), 4) if scores else 0.0
    overall_complexity = round(float(np.mean(complexities)), 1) if complexities else 0.0

    return {
        'analysis_id': analysis_id,
        'status': 'completed',
        'language': language,
        'model_used': model_path if model is not None else 'heuristic',
        'timestamp': datetime.now().isoformat(),
        'summary': {
            'total_segments': len(results),
            'overall_confusion_score': overall_confusion,
            'overall_complexity': overall_complexity,
            'highest_confusion_segment': max(results, key=lambda r: r['confusion_score'])['id'] if results else None,
        },
        'segments': results,
    }


# ---------------------------------------------------------------------------
# CLI Entry Point
# ---------------------------------------------------------------------------

def main():
    parser = argparse.ArgumentParser(
        description='NeuroCode AI - Code Analyzer (uses sagemaker-training model)'
    )
    sub = parser.add_subparsers(dest='command')

    analyse_parser = sub.add_parser('analyse', help='Analyse source code')
    analyse_parser.add_argument('--file', type=str, help='Path to source file')
    analyse_parser.add_argument('--code', type=str, help='Inline code string')
    analyse_parser.add_argument('--language', type=str, default='auto',
                                help='Programming language (default: auto)')
    analyse_parser.add_argument('--model', type=str, default=None,
                                help='Path to trained confusion_detector.pth')
    analyse_parser.add_argument('--output', type=str, default=None,
                                help='Path to write JSON results')

    args = parser.parse_args()

    if args.command != 'analyse':
        parser.print_help()
        return

    # Read code
    if args.file:
        with open(args.file, 'r') as f:
            code = f.read()
    elif args.code:
        code = args.code
    else:
        print('Error: provide --file or --code')
        return

    result = analyse_code(code, language=args.language, model_path=args.model)

    output_json = json.dumps(result, indent=2, default=str)

    if args.output:
        with open(args.output, 'w') as f:
            f.write(output_json)
        print(f'Results written to {args.output}')
    else:
        print(output_json)


if __name__ == '__main__':
    main()

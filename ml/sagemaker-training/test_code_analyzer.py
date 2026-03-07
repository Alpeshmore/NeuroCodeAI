#!/usr/bin/env python3
"""
Tests for NeuroCode AI Code Analyzer and Feature Extractor.
"""

import json
import os
import sys
import unittest

# Ensure local imports work
sys.path.insert(0, os.path.dirname(__file__))

from feature_extractor import extract_features, _cyclomatic_complexity
from code_analyzer import (
    segment_code,
    compute_complexity,
    heuristic_confusion_score,
    classify_confusion_type,
    analyse_code,
)


# ---- Sample code snippets for testing ----

SIMPLE_FUNCTION = """\
def greet(name):
    return f"Hello, {name}!"
"""

COMPLEX_FUNCTION = """\
def merge_sort(arr):
    if len(arr) <= 1:
        return arr
    mid = len(arr) // 2
    left = merge_sort(arr[:mid])
    right = merge_sort(arr[mid:])
    result = []
    i = j = 0
    while i < len(left) and j < len(right):
        if left[i] <= right[j]:
            result.append(left[i])
            i += 1
        else:
            result.append(right[j])
            j += 1
    result.extend(left[i:])
    result.extend(right[j:])
    return result
"""

JAVASCRIPT_CODE = """\
const fetchData = async (url) => {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Network error');
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Fetch failed:', error);
        return null;
    }
};
"""

CLASS_CODE = """\
class Calculator:
    def __init__(self):
        self.history = []

    def add(self, a, b):
        result = a + b
        self.history.append(('add', a, b, result))
        return result

    def divide(self, a, b):
        if b == 0:
            raise ValueError("Cannot divide by zero")
        result = a / b
        self.history.append(('divide', a, b, result))
        return result
"""

EMPTY_CODE = ""

SINGLE_LINE = "x = 42"

NESTED_CODE = """\
def process(data):
    for item in data:
        if item.is_valid():
            for sub in item.children:
                if sub.type == 'special':
                    try:
                        result = transform(sub)
                    except Exception:
                        pass
"""


class TestFeatureExtractor(unittest.TestCase):
    """Tests for feature_extractor.extract_features"""

    def test_feature_vector_length(self):
        """Feature vector must always be 50 elements."""
        for code in [SIMPLE_FUNCTION, COMPLEX_FUNCTION, JAVASCRIPT_CODE,
                     CLASS_CODE, EMPTY_CODE, SINGLE_LINE, NESTED_CODE]:
            features = extract_features(code)
            self.assertEqual(len(features), 50,
                             f"Expected 50 features, got {len(features)} "
                             f"for code: {code[:40]}...")

    def test_features_are_numeric(self):
        """All features must be float or int."""
        features = extract_features(COMPLEX_FUNCTION)
        for i, f in enumerate(features):
            self.assertIsInstance(f, (int, float),
                                 f"Feature {i} is {type(f)}, expected numeric")

    def test_features_non_negative(self):
        """All features should be non-negative."""
        features = extract_features(COMPLEX_FUNCTION)
        for i, f in enumerate(features):
            self.assertGreaterEqual(f, 0.0, f"Feature {i} is negative: {f}")

    def test_empty_code(self):
        """Empty string should produce a valid 50-dim vector of zeros/small values."""
        features = extract_features(EMPTY_CODE)
        self.assertEqual(len(features), 50)

    def test_complex_code_higher_complexity(self):
        """Complex code should have higher cyclomatic complexity than simple code."""
        simple_cc = _cyclomatic_complexity(SIMPLE_FUNCTION)
        complex_cc = _cyclomatic_complexity(COMPLEX_FUNCTION)
        self.assertGreater(complex_cc, simple_cc)

    def test_nested_code_higher_depth(self):
        """Nested code should have higher depth features."""
        simple_feats = extract_features(SIMPLE_FUNCTION)
        nested_feats = extract_features(NESTED_CODE)
        # Feature 17 is nested_depth (normalized)
        self.assertGreater(nested_feats[17], simple_feats[17])


class TestCodeSegmentation(unittest.TestCase):
    """Tests for code_analyzer.segment_code"""

    def test_simple_function_segments(self):
        """A single function should produce at least one segment."""
        segments = segment_code(SIMPLE_FUNCTION)
        self.assertGreaterEqual(len(segments), 1)
        types = [s['type'] for s in segments]
        self.assertIn('function', types)

    def test_class_segments(self):
        """Class code should produce class and function segments."""
        segments = segment_code(CLASS_CODE)
        types = [s['type'] for s in segments]
        self.assertIn('class', types)
        self.assertIn('function', types)

    def test_segment_has_required_keys(self):
        """Each segment must have id, type, code, line_start, line_end."""
        segments = segment_code(COMPLEX_FUNCTION)
        required = {'id', 'type', 'code', 'line_start', 'line_end'}
        for seg in segments:
            self.assertTrue(required.issubset(seg.keys()),
                            f"Segment missing keys: {required - seg.keys()}")

    def test_segment_lines_are_positive(self):
        """Segment line numbers must be positive integers."""
        segments = segment_code(COMPLEX_FUNCTION)
        for seg in segments:
            self.assertGreater(seg['line_start'], 0)
            self.assertGreater(seg['line_end'], 0)
            self.assertGreaterEqual(seg['line_end'], seg['line_start'])

    def test_empty_code_produces_module_segment(self):
        """Empty code should produce a module-level segment."""
        segments = segment_code(EMPTY_CODE)
        self.assertEqual(len(segments), 1)
        self.assertEqual(segments[0]['type'], 'module')

    def test_javascript_segments(self):
        """JavaScript code should be segmented."""
        segments = segment_code(JAVASCRIPT_CODE)
        self.assertGreaterEqual(len(segments), 1)


class TestComplexity(unittest.TestCase):
    """Tests for code_analyzer.compute_complexity"""

    def test_complexity_range(self):
        """Complexity score must be between 0 and 10."""
        for code in [SIMPLE_FUNCTION, COMPLEX_FUNCTION, NESTED_CODE,
                     EMPTY_CODE, SINGLE_LINE]:
            score = compute_complexity(code)
            self.assertGreaterEqual(score, 0.0)
            self.assertLessEqual(score, 10.0)

    def test_complex_higher_than_simple(self):
        """Merge sort should be more complex than a simple greeting."""
        simple = compute_complexity(SIMPLE_FUNCTION)
        complex_ = compute_complexity(COMPLEX_FUNCTION)
        self.assertGreater(complex_, simple)


class TestConfusionScoring(unittest.TestCase):
    """Tests for confusion scoring (heuristic)."""

    def test_heuristic_range(self):
        """Heuristic score must be between 0 and 1."""
        for code in [SIMPLE_FUNCTION, COMPLEX_FUNCTION, NESTED_CODE]:
            feats = extract_features(code)
            score = heuristic_confusion_score(feats)
            self.assertGreaterEqual(score, 0.0)
            self.assertLessEqual(score, 1.0)

    def test_nested_higher_confusion(self):
        """Deeply nested code should have higher confusion than simple code."""
        simple = heuristic_confusion_score(extract_features(SIMPLE_FUNCTION))
        nested = heuristic_confusion_score(extract_features(NESTED_CODE))
        self.assertGreater(nested, simple)


class TestConfusionTypeClassification(unittest.TestCase):
    """Tests for classify_confusion_type."""

    def test_returns_valid_type(self):
        """Must return one of the known confusion types."""
        valid_types = {'logic', 'recursion', 'nesting', 'naming', 'complexity'}
        for code in [SIMPLE_FUNCTION, COMPLEX_FUNCTION, NESTED_CODE]:
            feats = extract_features(code)
            ctype = classify_confusion_type(feats)
            self.assertIn(ctype, valid_types)


class TestAnalyseCode(unittest.TestCase):
    """Tests for the full analyse_code pipeline."""

    def test_analyse_returns_required_keys(self):
        """Result must contain analysis_id, status, summary, segments."""
        result = analyse_code(COMPLEX_FUNCTION)
        self.assertIn('analysis_id', result)
        self.assertIn('status', result)
        self.assertIn('summary', result)
        self.assertIn('segments', result)
        self.assertEqual(result['status'], 'completed')

    def test_analyse_summary_fields(self):
        """Summary must contain key aggregated metrics."""
        result = analyse_code(COMPLEX_FUNCTION)
        summary = result['summary']
        self.assertIn('total_segments', summary)
        self.assertIn('overall_confusion_score', summary)
        self.assertIn('overall_complexity', summary)
        self.assertGreater(summary['total_segments'], 0)

    def test_analyse_segment_fields(self):
        """Each segment in results must have scoring fields."""
        result = analyse_code(COMPLEX_FUNCTION)
        for seg in result['segments']:
            self.assertIn('complexity', seg)
            self.assertIn('confusion_score', seg)
            self.assertIn('confusion_type', seg)
            self.assertIn('confidence', seg)
            self.assertIn('features', seg)
            self.assertEqual(len(seg['features']), 50)

    def test_analyse_empty_code(self):
        """Empty code should still return a valid result."""
        result = analyse_code(EMPTY_CODE)
        self.assertEqual(result['status'], 'completed')
        self.assertGreater(len(result['segments']), 0)

    def test_analyse_javascript(self):
        """JavaScript code should be analysable."""
        result = analyse_code(JAVASCRIPT_CODE, language='javascript')
        self.assertEqual(result['status'], 'completed')
        self.assertEqual(result['language'], 'javascript')

    def test_output_is_json_serialisable(self):
        """Full result must be JSON-serialisable."""
        result = analyse_code(COMPLEX_FUNCTION)
        try:
            json.dumps(result, default=str)
        except (TypeError, ValueError) as e:
            self.fail(f"Result is not JSON-serialisable: {e}")

    def test_heuristic_mode_when_no_model(self):
        """Without a model file, should use heuristic mode."""
        result = analyse_code(SIMPLE_FUNCTION, model_path='/nonexistent.pth')
        self.assertEqual(result['model_used'], 'heuristic')

    def test_confusion_scores_bounded(self):
        """All confusion scores must be between 0 and 1."""
        result = analyse_code(NESTED_CODE)
        for seg in result['segments']:
            self.assertGreaterEqual(seg['confusion_score'], 0.0)
            self.assertLessEqual(seg['confusion_score'], 1.0)


if __name__ == '__main__':
    unittest.main()

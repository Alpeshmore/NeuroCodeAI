#!/usr/bin/env python3
"""
NeuroCode AI - Code Feature Extractor
Extracts a 50-dimensional feature vector from source code
to feed into the ConfusionDetectorModel for confusion scoring.
"""

import re
import math
from collections import Counter


# Patterns for multi-language code analysis
PATTERNS = {
    'if': re.compile(r'\b(if|elif|else\s+if)\b'),
    'else': re.compile(r'\belse\b'),
    'for_loop': re.compile(r'\b(for)\b'),
    'while_loop': re.compile(r'\b(while)\b'),
    'try_except': re.compile(r'\b(try|catch|except|finally)\b'),
    'return': re.compile(r'\breturn\b'),
    'break_continue': re.compile(r'\b(break|continue)\b'),
    'function_def': re.compile(
        r'\b(def|function|func|fn)\b|'
        r'(?:const|let|var)\s+\w+\s*=\s*(?:async\s*)?\(|'
        r'=>'
    ),
    'class_def': re.compile(r'\b(class|struct|interface)\b'),
    'lambda': re.compile(r'\b(lambda)\b|=>\s*\{?'),
    'decorator': re.compile(r'^\s*@\w+', re.MULTILINE),
    'import': re.compile(r'\b(import|require|from\s+\S+\s+import|include)\b'),
    'arithmetic_op': re.compile(r'[+\-*/%](?!=)'),
    'comparison_op': re.compile(r'[<>!=]=|[<>]'),
    'logical_op': re.compile(r'\b(and|or|not|&&|\|\|)\b'),
    'assignment': re.compile(r'(?<![<>!=])=(?!=)'),
    'string_literal': re.compile(r'(?:"[^"]*"|\'[^\']*\'|`[^`]*`)'),
    'numeric_literal': re.compile(r'\b\d+\.?\d*\b'),
    'list_comprehension': re.compile(r'\[.*\bfor\b.*\bin\b.*\]'),
    'ternary': re.compile(r'\bif\b.+\belse\b|\?.+:'),
    'bitwise_op': re.compile(r'[&|^~](?!=)|<<|>>'),
    'comment_single': re.compile(r'(#|//).*$', re.MULTILINE),
    'comment_block': re.compile(r'/\*[\s\S]*?\*/|"""[\s\S]*?"""|\'\'\'[\s\S]*?\'\'\''),
    'identifier': re.compile(r'\b[a-zA-Z_]\w*\b'),
    'function_call': re.compile(r'\b[a-zA-Z_]\w*\s*\('),
    'method_chain': re.compile(r'\.\w+\('),
    'type_hint': re.compile(r':\s*[A-Z]\w+|:\s*(int|str|float|bool|list|dict|tuple|set)'),
    'docstring': re.compile(r'"""[\s\S]*?"""|\'\'\'[\s\S]*?\'\'\''),
    'magic_number': re.compile(r'(?<!["\'\w])\b(?!0\b|1\b|2\b)\d{2,}\b(?!["\'])'),
    'recursion_hint': re.compile(r''),  # placeholder, detected separately
}

# Keywords to exclude from identifier analysis
KEYWORDS = {
    'if', 'else', 'elif', 'for', 'while', 'do', 'switch', 'case',
    'def', 'return', 'class', 'import', 'from', 'try', 'except',
    'catch', 'finally', 'raise', 'throw', 'with', 'as', 'pass',
    'break', 'continue', 'and', 'or', 'not', 'in', 'is', 'True',
    'False', 'None', 'null', 'undefined', 'const', 'let', 'var',
    'function', 'async', 'await', 'new', 'this', 'self', 'super',
    'yield', 'lambda', 'print', 'type', 'int', 'str', 'float',
    'bool', 'list', 'dict', 'tuple', 'set', 'void', 'static',
    'public', 'private', 'protected', 'interface', 'struct', 'enum',
    'require', 'export', 'default', 'extends', 'implements',
    'abstract', 'final', 'override', 'virtual', 'include',
}


def _count_pattern(pattern, text):
    """Count occurrences of a regex pattern in text."""
    return len(pattern.findall(text))


def _get_indentation_depths(lines):
    """Calculate indentation depths for each non-blank line."""
    depths = []
    for line in lines:
        stripped = line.lstrip()
        if stripped:
            leading = len(line) - len(stripped)
            # Normalize tabs to 4 spaces
            leading = line[:leading].replace('\t', '    ')
            depths.append(len(leading))
    return depths


def _estimate_nesting_depth(lines):
    """Estimate maximum nesting depth from indentation."""
    depths = _get_indentation_depths(lines)
    if not depths:
        return 0
    # Use median indentation unit (often 2 or 4 spaces)
    non_zero = [d for d in depths if d > 0]
    if not non_zero:
        return 0
    indent_unit = min(non_zero) if non_zero else 4
    indent_unit = max(indent_unit, 1)
    return max(d // indent_unit for d in depths)


def _detect_recursion(code, lines):
    """Detect if code contains recursive function calls."""
    func_names = re.findall(r'\bdef\s+(\w+)', code)
    func_names += re.findall(r'\bfunction\s+(\w+)', code)
    # Arrow / const function definitions
    func_names += re.findall(r'\b(?:const|let|var)\s+(\w+)\s*=\s*(?:async\s*)?\(', code)

    for name in func_names:
        # Check if the function name appears inside its own body
        pattern = re.compile(r'\b' + re.escape(name) + r'\s*\(')
        # Find definition and body
        matches = list(pattern.finditer(code))
        if len(matches) >= 2:
            return 1
    return 0


def _get_identifiers(code):
    """Extract non-keyword identifiers from code."""
    all_ids = PATTERNS['identifier'].findall(code)
    return [i for i in all_ids if i not in KEYWORDS]


def _count_function_params(code):
    """Estimate average parameters per function definition."""
    # Match function signatures
    signatures = re.findall(
        r'(?:def|function)\s+\w+\s*\(([^)]*)\)', code
    )
    signatures += re.findall(
        r'(?:const|let|var)\s+\w+\s*=\s*(?:async\s*)?\(([^)]*)\)', code
    )
    if not signatures:
        return 0.0
    param_counts = []
    for sig in signatures:
        params = [p.strip() for p in sig.split(',') if p.strip()]
        param_counts.append(len(params))
    return sum(param_counts) / len(param_counts)


def _duplicate_line_ratio(lines):
    """Calculate the ratio of duplicate non-blank lines."""
    non_blank = [line.strip() for line in lines if line.strip()]
    if not non_blank:
        return 0.0
    counts = Counter(non_blank)
    duplicates = sum(c - 1 for c in counts.values() if c > 1)
    return duplicates / len(non_blank)


def _camel_snake_ratios(identifiers):
    """Calculate ratio of camelCase and snake_case identifiers."""
    if not identifiers:
        return 0.0, 0.0
    camel = sum(1 for i in identifiers if re.match(r'^[a-z]+[A-Z]', i))
    snake = sum(1 for i in identifiers if '_' in i and i == i.lower())
    total = len(identifiers)
    return camel / total, snake / total


def _comment_lines(code, lines):
    """Count lines that are comments."""
    single = _count_pattern(PATTERNS['comment_single'], code)
    block_matches = PATTERNS['comment_block'].findall(code)
    block_lines = sum(m.count('\n') + 1 for m in block_matches)
    return single + block_lines


def _docstring_function_ratio(code):
    """Ratio of functions that have docstrings."""
    func_count = len(re.findall(r'\bdef\s+\w+', code))
    func_count += len(re.findall(r'\bfunction\s+\w+', code))
    if func_count == 0:
        return 0.0
    docstrings = _count_pattern(PATTERNS['docstring'], code)
    return min(docstrings / func_count, 1.0)


def _cyclomatic_complexity(code):
    """Estimate cyclomatic complexity (M = E - N + 2P simplified)."""
    cc = 1  # base complexity
    cc += _count_pattern(PATTERNS['if'], code)
    cc += _count_pattern(PATTERNS['for_loop'], code)
    cc += _count_pattern(PATTERNS['while_loop'], code)
    cc += len(re.findall(r'\b(and|or|&&|\|\|)\b', code))
    cc += len(re.findall(r'\bcase\b', code))
    cc += len(re.findall(r'\bcatch\b|\bexcept\b', code))
    return cc


def extract_features(code):
    """
    Extract a 50-dimensional feature vector from source code.

    Returns a list of 50 float values, normalized where possible,
    matching the input_dim=50 of the ConfusionDetectorModel.
    """
    lines = code.split('\n')
    total_lines = len(lines)
    non_blank_lines = [l for l in lines if l.strip()]
    non_blank_count = len(non_blank_lines)
    identifiers = _get_identifiers(code)
    indent_depths = _get_indentation_depths(lines)

    # Avoid division by zero
    safe_lines = max(total_lines, 1)
    safe_non_blank = max(non_blank_count, 1)
    safe_ids = max(len(identifiers), 1)

    features = []

    # --- Code Structure Features (1-10) ---
    # 1. line_count (log-scaled)
    features.append(math.log1p(total_lines))
    # 2. blank_line_ratio
    features.append((total_lines - non_blank_count) / safe_lines)
    # 3. comment_ratio
    features.append(_comment_lines(code, lines) / safe_lines)
    # 4. avg_line_length (normalized)
    line_lengths = [len(l) for l in lines]
    features.append(min(sum(line_lengths) / safe_lines / 80.0, 2.0))
    # 5. max_line_length (normalized)
    features.append(min(max(line_lengths) / 120.0, 2.0) if line_lengths else 0.0)
    # 6. avg_indentation_depth (normalized)
    features.append(
        (sum(indent_depths) / len(indent_depths) / 4.0) if indent_depths else 0.0
    )
    # 7. max_indentation_depth (normalized)
    features.append(
        (max(indent_depths) / 20.0) if indent_depths else 0.0
    )
    # 8. char_count (log-scaled)
    features.append(math.log1p(len(code)))
    # 9. token_count (log-scaled, approximate)
    features.append(math.log1p(len(code.split())))
    # 10. unique_identifier_count (log-scaled)
    features.append(math.log1p(len(set(identifiers))))

    # --- Control Flow Features (11-20) ---
    # 11. if_count (normalized)
    features.append(min(_count_pattern(PATTERNS['if'], code) / safe_non_blank, 1.0))
    # 12. else_count (normalized)
    features.append(min(_count_pattern(PATTERNS['else'], code) / safe_non_blank, 1.0))
    # 13. for_loop_count (normalized)
    features.append(
        min(_count_pattern(PATTERNS['for_loop'], code) / safe_non_blank, 1.0)
    )
    # 14. while_loop_count (normalized)
    features.append(
        min(_count_pattern(PATTERNS['while_loop'], code) / safe_non_blank, 1.0)
    )
    # 15. try_except_count (normalized)
    features.append(
        min(_count_pattern(PATTERNS['try_except'], code) / safe_non_blank, 1.0)
    )
    # 16. return_count (normalized)
    features.append(
        min(_count_pattern(PATTERNS['return'], code) / safe_non_blank, 1.0)
    )
    # 17. break_continue_count (normalized)
    features.append(
        min(_count_pattern(PATTERNS['break_continue'], code) / safe_non_blank, 1.0)
    )
    # 18. nested_depth (normalized)
    features.append(min(_estimate_nesting_depth(lines) / 10.0, 1.0))
    # 19. branch_count (normalized)
    branch_count = (
        _count_pattern(PATTERNS['if'], code)
        + _count_pattern(PATTERNS['else'], code)
    )
    features.append(min(branch_count / safe_non_blank, 1.0))
    # 20. cyclomatic_complexity (log-scaled, normalized)
    features.append(min(math.log1p(_cyclomatic_complexity(code)) / 4.0, 2.0))

    # --- Function/Class Features (21-30) ---
    # 21. function_count (normalized)
    func_count = _count_pattern(PATTERNS['function_def'], code)
    features.append(min(func_count / safe_non_blank, 1.0))
    # 22. class_count (normalized)
    features.append(
        min(_count_pattern(PATTERNS['class_def'], code) / safe_non_blank, 1.0)
    )
    # 23. method_count (approximated as functions inside classes)
    features.append(min(func_count / max(safe_non_blank, 1), 1.0))
    # 24. lambda_count (normalized)
    features.append(
        min(_count_pattern(PATTERNS['lambda'], code) / safe_non_blank, 1.0)
    )
    # 25. decorator_count (normalized)
    features.append(
        min(_count_pattern(PATTERNS['decorator'], code) / safe_non_blank, 1.0)
    )
    # 26. avg_parameter_count (normalized)
    features.append(min(_count_function_params(code) / 5.0, 1.0))
    # 27. has_recursion (binary)
    features.append(float(_detect_recursion(code, lines)))
    # 28. function_call_count (normalized)
    features.append(
        min(_count_pattern(PATTERNS['function_call'], code) / safe_non_blank, 1.0)
    )
    # 29. import_count (normalized)
    features.append(
        min(_count_pattern(PATTERNS['import'], code) / safe_non_blank, 1.0)
    )
    # 30. global_variable_count (estimated, normalized)
    top_level_assignments = len(
        re.findall(r'^[a-zA-Z_]\w*\s*=', code, re.MULTILINE)
    )
    features.append(min(top_level_assignments / safe_non_blank, 1.0))

    # --- Operator/Expression Features (31-40) ---
    # 31. arithmetic_op_count (normalized)
    features.append(
        min(_count_pattern(PATTERNS['arithmetic_op'], code) / safe_non_blank, 1.0)
    )
    # 32. comparison_op_count (normalized)
    features.append(
        min(_count_pattern(PATTERNS['comparison_op'], code) / safe_non_blank, 1.0)
    )
    # 33. logical_op_count (normalized)
    features.append(
        min(_count_pattern(PATTERNS['logical_op'], code) / safe_non_blank, 1.0)
    )
    # 34. assignment_count (normalized)
    features.append(
        min(_count_pattern(PATTERNS['assignment'], code) / safe_non_blank, 1.0)
    )
    # 35. string_literal_count (normalized)
    features.append(
        min(_count_pattern(PATTERNS['string_literal'], code) / safe_non_blank, 1.0)
    )
    # 36. numeric_literal_count (normalized)
    features.append(
        min(_count_pattern(PATTERNS['numeric_literal'], code) / safe_non_blank, 1.0)
    )
    # 37. list_comprehension_count (normalized)
    features.append(
        min(
            _count_pattern(PATTERNS['list_comprehension'], code) / safe_non_blank, 1.0
        )
    )
    # 38. ternary_count (normalized)
    features.append(
        min(_count_pattern(PATTERNS['ternary'], code) / safe_non_blank, 1.0)
    )
    # 39. bitwise_op_count (normalized)
    features.append(
        min(_count_pattern(PATTERNS['bitwise_op'], code) / safe_non_blank, 1.0)
    )
    # 40. method_chain_count (normalized)
    features.append(
        min(_count_pattern(PATTERNS['method_chain'], code) / safe_non_blank, 1.0)
    )

    # --- Readability/Quality Features (41-50) ---
    # 41. avg_identifier_length (normalized)
    avg_id_len = (
        sum(len(i) for i in identifiers) / safe_ids if identifiers else 0
    )
    features.append(min(avg_id_len / 15.0, 1.0))
    # 42. single_char_vars count (normalized)
    single_char = sum(1 for i in identifiers if len(i) == 1)
    features.append(min(single_char / safe_ids, 1.0))
    # 43. camelCase ratio
    camel_r, snake_r = _camel_snake_ratios(identifiers)
    features.append(camel_r)
    # 44. snake_case ratio
    features.append(snake_r)
    # 45. magic_number_count (normalized)
    features.append(
        min(_count_pattern(PATTERNS['magic_number'], code) / safe_non_blank, 1.0)
    )
    # 46. duplicate_line_ratio
    features.append(_duplicate_line_ratio(lines))
    # 47. has_type_hints (normalized)
    features.append(
        min(_count_pattern(PATTERNS['type_hint'], code) / safe_non_blank, 1.0)
    )
    # 48. docstring_function_ratio
    features.append(_docstring_function_ratio(code))
    # 49. error_handling_ratio (try/except per function)
    try_count = _count_pattern(PATTERNS['try_except'], code)
    features.append(min(try_count / max(func_count, 1), 1.0))
    # 50. code_to_comment_ratio
    comment_count = _comment_lines(code, lines)
    code_lines = non_blank_count - comment_count
    features.append(
        min(code_lines / max(comment_count, 1) / 10.0, 1.0)
    )

    return features

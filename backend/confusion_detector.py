"""
confusion_detector.py
Detects confusing code patterns and returns per-line confusion flags.
"""
import re
import ast
from typing import Dict, List


class ConfusionDetector:
    """Detects code patterns that commonly confuse beginner programmers."""

    CONFUSION_PATTERNS = {
        "nested_loop": re.compile(r"^\s{8,}(for|while)\s"),
        "lambda": re.compile(r"\blambda\b"),
        "list_comprehension": re.compile(r"\[.*\bfor\b.*\bin\b.*\]"),
        "dict_comprehension": re.compile(r"\{.*\bfor\b.*\bin\b.*\}"),
        "ternary": re.compile(r"\bif\b.+\belse\b"),
        "walrus": re.compile(r":="),
        "decorator": re.compile(r"^\s*@\w+"),
        "yield": re.compile(r"\byield\b"),
        "async_await": re.compile(r"\b(async|await)\b"),
        "star_args": re.compile(r"\*args|\*\*kwargs"),
        "complex_slice": re.compile(r"\[.+:.+:.+\]"),
        "chained_comparison": re.compile(r"\w+\s*[<>]=?\s*\w+\s*[<>]=?\s*\w+"),
        "multiple_assignment": re.compile(r"\w+\s*,\s*\w+\s*="),
        "global_nonlocal": re.compile(r"^\s*(global|nonlocal)\s"),
        "try_except": re.compile(r"^\s*except\s+\w+\s+as\s"),
    }

    DIFFICULTY_WEIGHTS = {
        "nested_loop": 3,
        "lambda": 2,
        "list_comprehension": 2,
        "dict_comprehension": 2,
        "ternary": 2,
        "walrus": 3,
        "decorator": 2,
        "yield": 3,
        "async_await": 3,
        "star_args": 2,
        "complex_slice": 2,
        "chained_comparison": 1,
        "multiple_assignment": 1,
        "global_nonlocal": 2,
        "try_except": 1,
    }

    def detect(self, code: str, language: str = "python") -> Dict[int, bool]:
        """
        Analyze code and return a dict mapping line numbers to confusion flags.
        Returns: {line_number: is_confusing}
        """
        lines = code.split("\n")
        flags: Dict[int, bool] = {}

        nesting_depth = self._compute_nesting(lines)

        for i, line in enumerate(lines):
            line_num = i + 1
            stripped = line.strip()

            if not stripped or stripped.startswith("#"):
                flags[line_num] = False
                continue

            line_score = 0
            matched_patterns = []

            for pattern_name, pattern in self.CONFUSION_PATTERNS.items():
                if pattern.search(line):
                    line_score += self.DIFFICULTY_WEIGHTS.get(pattern_name, 1)
                    matched_patterns.append(pattern_name)

            # Extra weight for deep nesting
            depth = nesting_depth.get(i, 0)
            if depth >= 3:
                line_score += depth - 2

            # Long lines are confusing
            if len(stripped) > 80:
                line_score += 1

            flags[line_num] = line_score >= 2

        return flags

    def detect_detailed(self, code: str, language: str = "python") -> Dict[int, dict]:
        """Returns detailed confusion info per line."""
        lines = code.split("\n")
        result: Dict[int, dict] = {}
        nesting_depth = self._compute_nesting(lines)

        for i, line in enumerate(lines):
            line_num = i + 1
            stripped = line.strip()

            if not stripped or stripped.startswith("#"):
                result[line_num] = {"confused": False, "score": 0, "patterns": [], "depth": 0}
                continue

            line_score = 0
            matched_patterns = []

            for pattern_name, pattern in self.CONFUSION_PATTERNS.items():
                if pattern.search(line):
                    line_score += self.DIFFICULTY_WEIGHTS.get(pattern_name, 1)
                    matched_patterns.append(pattern_name)

            depth = nesting_depth.get(i, 0)
            if depth >= 3:
                line_score += depth - 2

            if len(stripped) > 80:
                line_score += 1

            result[line_num] = {
                "confused": line_score >= 2,
                "score": line_score,
                "patterns": matched_patterns,
                "depth": depth,
            }

        return result

    def score(self, flags: Dict[int, bool], lines: List[str]) -> float:
        """
        Compute overall confusion score (0-10).
        """
        if not lines:
            return 0.0

        code_lines = [l for l in lines if l.strip() and not l.strip().startswith("#")]
        if not code_lines:
            return 0.0

        confused_count = sum(1 for v in flags.values() if v)
        base_score = (confused_count / len(code_lines)) * 10

        # Check for recursive functions (extra confusion penalty)
        full_code = "\n".join(lines)
        if self._has_recursion(full_code):
            base_score = min(10, base_score + 1.5)

        # Deeply nested code
        max_depth = self._max_nesting_depth(lines)
        if max_depth >= 4:
            base_score = min(10, base_score + 1.0)

        return round(min(10.0, base_score), 1)

    def _compute_nesting(self, lines: List[str]) -> Dict[int, int]:
        """Compute nesting depth per line."""
        depth_map = {}
        for i, line in enumerate(lines):
            if line.strip():
                indent = len(line) - len(line.lstrip())
                depth_map[i] = indent // 4  # assume 4-space indentation
            else:
                depth_map[i] = 0
        return depth_map

    def _max_nesting_depth(self, lines: List[str]) -> int:
        depths = [len(l) - len(l.lstrip()) for l in lines if l.strip()]
        return max(depths, default=0) // 4

    def _has_recursion(self, code: str) -> bool:
        """Detect if a function calls itself (recursion)."""
        try:
            tree = ast.parse(code)
            for node in ast.walk(tree):
                if isinstance(node, ast.FunctionDef):
                    func_name = node.name
                    for child in ast.walk(node):
                        if isinstance(child, ast.Call):
                            if isinstance(child.func, ast.Name) and child.func.id == func_name:
                                return True
        except SyntaxError:
            pass
        return False

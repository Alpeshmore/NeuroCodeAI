"""
recursive_engine.py
Parses code into hierarchical blocks and produces structured explanations.
"""
import ast
import re
from typing import Dict, List, Optional


class RecursiveReasoningEngine:
    """
    Recursively decomposes code into logical blocks and generates
    hierarchical explanations.
    """

    def parse_blocks(self, code: str, language: str = "python") -> List[dict]:
        """Break code into logical blocks recursively."""
        if language == "python":
            return self._parse_python(code)
        else:
            return self._parse_generic(code, language)

    def _parse_python(self, code: str) -> List[dict]:
        """Use Python AST for accurate block detection."""
        blocks = []
        try:
            tree = ast.parse(code)
            lines = code.split("\n")

            for node in ast.walk(tree):
                if isinstance(node, ast.FunctionDef):
                    is_recursive = self._check_recursion(node)
                    children = self._extract_children(node, lines)
                    blocks.append({
                        "type": "recursive_function" if is_recursive else "function",
                        "name": node.name,
                        "start_line": node.lineno,
                        "end_line": node.end_lineno,
                        "complexity": self._node_complexity(node),
                        "children": children,
                        "description": f"{'Recursive f' if is_recursive else 'F'}unction '{node.name}' with {len(node.args.args)} parameters",
                    })
                elif isinstance(node, ast.ClassDef):
                    methods = [n.name for n in ast.walk(node) if isinstance(n, ast.FunctionDef)]
                    blocks.append({
                        "type": "class",
                        "name": node.name,
                        "start_line": node.lineno,
                        "end_line": node.end_lineno,
                        "complexity": len(methods),
                        "children": [],
                        "description": f"Class '{node.name}' with {len(methods)} method(s): {', '.join(methods[:3])}",
                    })
                elif isinstance(node, (ast.For, ast.While)):
                    block_type = "for_loop" if isinstance(node, ast.For) else "while_loop"
                    nested = self._count_nested_loops(node)
                    blocks.append({
                        "type": block_type,
                        "start_line": node.lineno,
                        "end_line": node.end_lineno,
                        "complexity": 1 + nested,
                        "nested_depth": nested,
                        "children": [],
                        "description": f"{'Nested ' if nested > 0 else ''}{'For' if isinstance(node, ast.For) else 'While'} loop{'(nesting depth: ' + str(nested) + ')' if nested else ''}",
                    })
                elif isinstance(node, ast.If):
                    else_branches = self._count_else_branches(node)
                    blocks.append({
                        "type": "conditional",
                        "start_line": node.lineno,
                        "end_line": node.end_lineno,
                        "complexity": 1 + else_branches,
                        "children": [],
                        "description": f"Conditional block with {else_branches} else/elif branch(es)",
                    })
                elif isinstance(node, ast.Try):
                    handlers = len(node.handlers)
                    blocks.append({
                        "type": "try_except",
                        "start_line": node.lineno,
                        "end_line": node.end_lineno,
                        "complexity": 1 + handlers,
                        "children": [],
                        "description": f"Error handling block with {handlers} exception handler(s)",
                    })

        except SyntaxError as e:
            blocks.append({
                "type": "syntax_error",
                "message": str(e),
                "start_line": e.lineno or 1,
                "end_line": e.lineno or 1,
                "complexity": 0,
                "children": [],
                "description": f"Syntax error: {str(e)}",
            })

        # Deduplicate overlapping blocks — keep most specific
        blocks = self._deduplicate(blocks)
        return sorted(blocks, key=lambda b: b["start_line"])

    def _parse_generic(self, code: str, language: str) -> List[dict]:
        """Regex-based generic block detection for JS, Java, C++."""
        blocks = []
        lines = code.split("\n")

        func_patterns = {
            "javascript": re.compile(r"(?:function\s+(\w+)|const\s+(\w+)\s*=.*=>|(\w+)\s*:\s*function)"),
            "java": re.compile(r"(?:public|private|protected)?\s+\w+\s+(\w+)\s*\("),
            "c++": re.compile(r"\w+\s+(\w+)\s*\([^)]*\)\s*\{"),
        }

        loop_pattern = re.compile(r"^\s*(for|while|do)\s*[\(\{]")
        condition_pattern = re.compile(r"^\s*(if|else\s+if|switch)\s*[\(\{]")
        class_pattern = re.compile(r"^\s*(class|struct)\s+(\w+)")

        open_braces = 0
        block_start = None
        block_type = None

        for i, line in enumerate(lines):
            line_num = i + 1

            if class_match := class_pattern.match(line):
                blocks.append({
                    "type": "class",
                    "name": class_match.group(2),
                    "start_line": line_num,
                    "end_line": line_num,
                    "complexity": 2,
                    "children": [],
                    "description": f"Class definition: {class_match.group(2)}",
                })
            elif func_pat := func_patterns.get(language):
                if func_match := func_pat.search(line):
                    name = next((g for g in func_match.groups() if g), "anonymous")
                    blocks.append({
                        "type": "function",
                        "name": name,
                        "start_line": line_num,
                        "end_line": min(line_num + 20, len(lines)),
                        "complexity": 2,
                        "children": [],
                        "description": f"Function definition: {name}",
                    })
            elif loop_pattern.match(line):
                kw = loop_pattern.match(line).group(1)
                blocks.append({
                    "type": f"{kw}_loop",
                    "start_line": line_num,
                    "end_line": min(line_num + 10, len(lines)),
                    "complexity": 2,
                    "children": [],
                    "description": f"{kw.capitalize()} loop",
                })
            elif condition_pattern.match(line):
                kw = condition_pattern.match(line).group(1)
                blocks.append({
                    "type": "conditional",
                    "start_line": line_num,
                    "end_line": min(line_num + 5, len(lines)),
                    "complexity": 1,
                    "children": [],
                    "description": f"{kw} conditional",
                })

        return blocks[:20]  # Cap for performance

    def get_block_context(self, blocks: List[dict], line_num: int) -> dict:
        """Find which block a line belongs to."""
        best = {"type": "statement", "name": None}
        for block in blocks:
            if block["start_line"] <= line_num <= block["end_line"]:
                if block["type"] in ("function", "recursive_function", "class"):
                    best = block
                    break
                elif best["type"] == "statement":
                    best = block
        return best

    def complexity_score(self, blocks: List[dict], lines: List[str]) -> float:
        """Compute overall complexity score 0–10."""
        if not lines:
            return 0.0

        code_lines = [l for l in lines if l.strip() and not l.strip().startswith("#")]
        if not code_lines:
            return 0.0

        total_complexity = sum(b.get("complexity", 1) for b in blocks)
        num_blocks = len(blocks) or 1
        avg_complexity = total_complexity / num_blocks

        length_factor = min(len(code_lines) / 50, 1.0)
        has_recursion = any(b["type"] == "recursive_function" for b in blocks)
        recursion_bonus = 2.0 if has_recursion else 0.0

        score = (avg_complexity * 2) + (length_factor * 3) + recursion_bonus
        return round(min(10.0, score), 1)

    def _extract_children(self, node: ast.AST, lines: List[str]) -> List[dict]:
        """Extract direct child blocks of a function."""
        children = []
        for child in ast.iter_child_nodes(node):
            if isinstance(child, (ast.For, ast.While)):
                children.append({
                    "type": "for_loop" if isinstance(child, ast.For) else "while_loop",
                    "line": child.lineno,
                })
            elif isinstance(child, ast.If):
                children.append({"type": "conditional", "line": child.lineno})
            elif isinstance(child, ast.FunctionDef):
                children.append({"type": "nested_function", "name": child.name, "line": child.lineno})
        return children

    def _check_recursion(self, node: ast.FunctionDef) -> bool:
        func_name = node.name
        for child in ast.walk(node):
            if isinstance(child, ast.Call):
                if isinstance(child.func, ast.Name) and child.func.id == func_name:
                    return True
        return False

    def _count_nested_loops(self, node: ast.AST) -> int:
        count = 0
        for child in ast.walk(node):
            if child is not node and isinstance(child, (ast.For, ast.While)):
                count += 1
        return count

    def _count_else_branches(self, node: ast.If) -> int:
        count = 0
        current = node
        while hasattr(current, "orelse") and current.orelse:
            count += 1
            if current.orelse and isinstance(current.orelse[0], ast.If):
                current = current.orelse[0]
            else:
                break
        return count

    def _node_complexity(self, node: ast.AST) -> int:
        """McCabe-style cyclomatic complexity for a node."""
        complexity = 1
        for child in ast.walk(node):
            if isinstance(child, (ast.If, ast.For, ast.While, ast.ExceptHandler,
                                  ast.With, ast.Assert, ast.comprehension)):
                complexity += 1
            elif isinstance(child, ast.BoolOp):
                complexity += len(child.values) - 1
        return complexity

    def _deduplicate(self, blocks: List[dict]) -> List[dict]:
        """Remove fully-contained duplicate blocks keeping the most specific."""
        if len(blocks) <= 1:
            return blocks
        seen = set()
        result = []
        for block in sorted(blocks, key=lambda b: (b["start_line"], -(b["end_line"] - b["start_line"]))):
            key = (block["start_line"], block.get("type"))
            if key not in seen:
                seen.add(key)
                result.append(block)
        return result

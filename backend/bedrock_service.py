"""
bedrock_service.py
AWS Bedrock integration for AI-powered code explanations.
Falls back to local engine if Bedrock is unavailable.
"""
import os
import json
import re
import asyncio
from typing import Dict, List, Optional


class BedrockService:
    """
    Calls AWS Bedrock (Claude 3 Haiku) to generate code explanations.
    Falls back to local explanations if AWS is not configured.
    """

    def __init__(self):
        self.client = None
        self.model_id = "anthropic.claude-3-haiku-20240307-v1:0"
        self._init_client()

    def _init_client(self):
        """Initialize boto3 Bedrock client using shared AWS config."""
        try:
            from aws_config import get_client, is_aws_configured
            if not is_aws_configured():
                print("[Bedrock] AWS not configured — using local fallback")
                return
            self.client = get_client("bedrock-runtime")
            print("[Bedrock] Client initialized successfully")
        except ImportError:
            print("[Bedrock] boto3 not installed — using local fallback")
        except Exception as e:
            print(f"[Bedrock] Client init failed: {e} — using local fallback")

    async def explain_code(
        self, code: str, language: str, blocks: List[dict]
    ) -> Dict:
        """
        Get AI explanations for code.
        Returns dict: {line_number: {explanation, difficulty, concepts}, summary: str}
        """
        if self.client:
            try:
                return await self._bedrock_explain(code, language, blocks)
            except Exception as e:
                print(f"[Bedrock] API call failed: {e} — using fallback")

        return self._local_explain(code, language, blocks)

    async def _bedrock_explain(self, code: str, language: str, blocks: List[dict]) -> Dict:
        """Call AWS Bedrock for explanations."""
        lines = code.split("\n")
        numbered = "\n".join(f"{i+1}: {l}" for i, l in enumerate(lines))

        prompt = f"""You are an expert programming tutor. Analyze this {language} code and provide educational explanations.

CODE:
{numbered}

TASK: For each non-empty line, provide:
1. A clear beginner-friendly explanation
2. Difficulty level (easy/medium/hard)
3. Key programming concepts on that line

Also provide a 2-sentence overall summary of what the code does.

Respond ONLY with valid JSON in this exact format:
{{
  "summary": "Brief summary of what the code does",
  "lines": {{
    "1": {{
      "explanation": "explanation here",
      "difficulty": "easy|medium|hard",
      "concepts": ["concept1", "concept2"]
    }}
  }}
}}"""

        loop = asyncio.get_event_loop()
        response = await loop.run_in_executor(
            None,
            lambda: self.client.invoke_model(
                modelId=self.model_id,
                body=json.dumps({
                    "anthropic_version": "bedrock-2023-05-31",
                    "max_tokens": 4000,
                    "messages": [{"role": "user", "content": prompt}],
                }),
                contentType="application/json",
                accept="application/json",
            )
        )

        body = json.loads(response["body"].read())
        text = body["content"][0]["text"]

        # Extract JSON from response
        json_match = re.search(r'\{.*\}', text, re.DOTALL)
        if not json_match:
            raise ValueError("No JSON in Bedrock response")

        data = json.loads(json_match.group())
        result = {"summary": data.get("summary", "")}

        for line_str, info in data.get("lines", {}).items():
            try:
                line_num = int(line_str)
                result[line_num] = {
                    "explanation": info.get("explanation", ""),
                    "difficulty": info.get("difficulty", "easy"),
                    "concepts": info.get("concepts", []),
                }
            except (ValueError, KeyError):
                continue

        return result

    def _local_explain(self, code: str, language: str, blocks: List[dict]) -> Dict:
        """Local fallback explanation engine."""
        lines = code.split("\n")
        result = {}
        block_map = {b["start_line"]: b for b in blocks}

        for i, line in enumerate(lines):
            line_num = i + 1
            stripped = line.strip()

            if not stripped or stripped.startswith("#"):
                result[line_num] = {
                    "explanation": "Comment or blank line" if stripped else "Empty line",
                    "difficulty": "easy",
                    "concepts": [],
                }
                continue

            explanation, difficulty, concepts = self._classify_line(stripped, language)

            # Enhance with block context
            if line_num in block_map:
                block = block_map[line_num]
                explanation = f"{block['description']}. {explanation}"

            result[line_num] = {
                "explanation": explanation,
                "difficulty": difficulty,
                "concepts": concepts,
            }

        # Generate summary from blocks
        if blocks:
            funcs = [b["name"] for b in blocks if "name" in b]
            has_loops = any(b["type"] in ("for_loop", "while_loop") for b in blocks)
            has_classes = any(b["type"] == "class" for b in blocks)

            summary_parts = []
            if funcs:
                summary_parts.append(f"Defines {len(funcs)} function(s): {', '.join(funcs[:3])}")
            if has_loops:
                summary_parts.append("uses loops to iterate")
            if has_classes:
                summary_parts.append("defines object-oriented classes")

            result["summary"] = ". ".join(summary_parts) + "." if summary_parts else \
                f"A {language} code snippet with {len([l for l in lines if l.strip()])} lines of logic."
        else:
            result["summary"] = f"A {language} script with {len([l for l in lines if l.strip()])} active lines."

        return result

    def _classify_line(self, line: str, language: str):
        """Classify a single line and return (explanation, difficulty, concepts)."""
        lower = line.lower()

        # Python-specific
        if lower.startswith("def "):
            name = re.search(r"def\s+(\w+)", line)
            func_name = name.group(1) if name else "unknown"
            params = re.search(r"\((.*?)\)", line)
            param_str = params.group(1) if params else ""
            param_count = len([p for p in param_str.split(",") if p.strip()]) if param_str else 0
            return (
                f"Defines function '{func_name}' accepting {param_count} parameter(s). "
                f"Functions group reusable logic under a named block.",
                "easy",
                ["Functions", "Definitions"]
            )

        if lower.startswith("class "):
            name = re.search(r"class\s+(\w+)", line)
            class_name = name.group(1) if name else "unknown"
            inherits = re.search(r"\((\w+)\)", line)
            inheritance_str = f" inheriting from '{inherits.group(1)}'" if inherits else ""
            return (
                f"Defines class '{class_name}'{inheritance_str}. "
                f"Classes are blueprints for creating objects with shared attributes and behavior.",
                "medium",
                ["Classes", "OOP", "Inheritance"]
            )

        if lower.startswith("for "):
            var = re.search(r"for\s+(\w+)\s+in", line)
            iter_var = var.group(1) if var else "item"
            return (
                f"For loop: iterates over a collection, assigning each element to '{iter_var}'. "
                f"The loop body runs once per item.",
                "easy",
                ["Loops", "Iteration"]
            )

        if lower.startswith("while "):
            return (
                "While loop: repeatedly executes the indented block as long as the condition remains True. "
                "Be careful of infinite loops!",
                "medium",
                ["Loops", "Conditions", "Iteration"]
            )

        if lower.startswith("if "):
            return (
                "Conditional statement: the indented block only runs if this condition evaluates to True.",
                "easy",
                ["Conditionals", "Boolean Logic"]
            )

        if lower.startswith("elif "):
            return (
                "Else-if branch: checked only when the previous condition was False. "
                "Allows multiple conditions to be tested in sequence.",
                "easy",
                ["Conditionals"]
            )

        if lower.startswith("else:") or lower.startswith("else "):
            return (
                "Else block: executes when ALL previous if/elif conditions were False.",
                "easy",
                ["Conditionals"]
            )

        if lower.startswith("return "):
            val = line[7:].strip()
            return (
                f"Return statement: exits the function and sends '{val}' back to the caller.",
                "easy",
                ["Functions", "Return Values"]
            )

        if lower.startswith("import ") or lower.startswith("from "):
            return (
                f"Import statement: loads an external module or function so it can be used in this file.",
                "easy",
                ["Modules", "Imports"]
            )

        if "lambda" in lower:
            return (
                "Lambda: creates a small anonymous (unnamed) function in a single line. "
                "Useful for short operations but can be hard to read.",
                "hard",
                ["Lambda Functions", "Functional Programming"]
            )

        if "[" in line and "for" in lower and "in" in lower:
            return (
                "List comprehension: a compact way to create a list by transforming/filtering another iterable. "
                "Equivalent to a for-loop that builds a list.",
                "hard",
                ["List Comprehensions", "Loops", "Functional Programming"]
            )

        if "yield" in lower:
            return (
                "Yield: pauses function execution and returns a value to the caller. "
                "Makes this a generator — values are produced lazily on demand.",
                "hard",
                ["Generators", "Yield", "Lazy Evaluation"]
            )

        if lower.startswith("try:") or lower == "try:":
            return (
                "Try block: wraps code that might cause an error. "
                "If an error occurs, execution jumps to the 'except' block instead of crashing.",
                "medium",
                ["Error Handling", "Exceptions"]
            )

        if lower.startswith("except"):
            return (
                "Except block: catches and handles errors thrown in the try block. "
                "Prevents the program from crashing on expected errors.",
                "medium",
                ["Error Handling", "Exceptions"]
            )

        if "=" in line and "==" not in line and "+=" not in line:
            var = line.split("=")[0].strip()
            val = "=".join(line.split("=")[1:]).strip()
            return (
                f"Assignment: stores the value '{val[:30]}{'...' if len(val)>30 else ''}' "
                f"in variable '{var}'. Variables hold data for later use.",
                "easy",
                ["Variables", "Assignment"]
            )

        if lower.startswith("print("):
            return (
                "Print: outputs a value to the console. Useful for debugging and displaying results.",
                "easy",
                ["Output", "Debugging"]
            )

        if "async" in lower or "await" in lower:
            return (
                "Async/await: asynchronous programming — allows non-blocking operations. "
                "The program can do other work while waiting for slow operations like network requests.",
                "hard",
                ["Async Programming", "Concurrency"]
            )

        return (
            "Code statement: performs an operation or expression.",
            "easy",
            []
        )

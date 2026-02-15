import json
import re


def extract_json_from_text(text):
    """Extract JSON from text, handling code blocks and raw JSON."""
    code_block_match = re.search(r"```(?:json)?\s*([\s\S]*?)\s*```", text)
    if code_block_match:
        try:
            return json.loads(code_block_match.group(1))
        except json.JSONDecodeError:
            pass

    stack = []
    start_index = -1

    for i, char in enumerate(text):
        if char in "{[":
            if not stack:
                start_index = i
            stack.append(char)
        elif char in "}]":
            if stack:
                expected = "{" if char == "}" else "["
                if stack[-1] == expected:
                    stack.pop()
                    if not stack:
                        try:
                            return json.loads(text[start_index : i + 1])
                        except json.JSONDecodeError:
                            pass
                else:
                    stack = []
                    start_index = -1

    return None

import json
import re
from typing import Dict, Any


class StoryParseError(Exception):
    pass


class StoryParser:

    def __init__(self):
        self.nodes = {}

    def parse(self, text: str) -> Dict[str, Any]:
        blocks = re.split(r'#NODE\s+', text)

        for block in blocks:
            block = block.strip()
            if not block:
                continue

            self._parse_node(block)

        return self._build_output()

    def _parse_node(self, block: str):
        # ===== NODE ID =====
        node_id_match = re.match(r'([\d\-A-Za-z]+)', block)
        if not node_id_match:
            raise StoryParseError("❌ 节点ID解析失败")

        node_id = node_id_match.group(1)

        # ===== TITLE（可选）=====
        title_match = re.search(r'#TITLE\s+(.+)', block)
        title = title_match.group(1).strip() if title_match else ""

        # ===== TEXT =====
        text_match = re.search(r'#TEXT\s+([\s\S]*?)#CHOICES', block)
        if not text_match:
            raise StoryParseError(f"❌ 节点 {node_id} 缺少 #TEXT")

        text = text_match.group(1).strip()

        # ===== CHOICES =====
        choices_match = re.search(r'#CHOICES\s+([\s\S]*?)(#RESULT|$)', block)
        if not choices_match:
            raise StoryParseError(f"❌ 节点 {node_id} 缺少 #CHOICES")

        choices_block = choices_match.group(1).strip()
        choices = self._parse_choices(choices_block, node_id)

        # ===== RESULT =====
        results = self._parse_results(block, node_id)

        # ===== 合并 =====
        for key in choices:
            if key not in results:
                raise StoryParseError(f"❌ 节点 {node_id} 缺少 RESULT {key}")

            choices[key]["resultText"] = results[key]

        self.nodes[node_id] = {
            "text": text,
            "choices": choices
        }

    def _parse_choices(self, block: str, node_id: str) -> Dict[str, Any]:
        lines = block.splitlines()
        choices = {}

        for line in lines:
            line = line.strip()
            if not line:
                continue

            parts = line.split('|')

            if len(parts) != 4:
                raise StoryParseError(
                    f"❌ 节点 {node_id} 选项格式错误：{line}"
                )

            key, text, effect_str, next_part = parts

            key = key.strip()
            text = text.strip()
            effect = self._parse_effect(effect_str.strip(), node_id)
            next_node = self._parse_next(next_part.strip(), node_id)

            choices[key] = {
                "text": text,
                "effect": effect,
                "next": next_node
            }

        return choices

    def _parse_effect(self, effect_str: str, node_id: str) -> Dict[str, int]:
        if effect_str == "":
            return {}

        effects = {}
        parts = effect_str.split(',')

        for part in parts:
            part = part.strip()

            match = re.match(r'([a-zA-Z_]+)([+-]\d+)', part)
            if not match:
                raise StoryParseError(
                    f"❌ 节点 {node_id} effect格式错误：{part}"
                )

            key = match.group(1)
            value = int(match.group(2))

            effects[key] = value

        return effects

    def _parse_next(self, next_str: str, node_id: str) -> str:
        match = re.match(r'NEXT:(.+)', next_str)
        if not match:
            raise StoryParseError(
                f"❌ 节点 {node_id} NEXT格式错误：{next_str}"
            )

        return match.group(1).strip()

    def _parse_results(self, block: str, node_id: str) -> Dict[str, str]:
        results = {}

        matches = re.findall(
            r'#RESULT\s+([ABC])\s+([\s\S]*?)(?=#RESULT|$)',
            block
        )

        for key, content in matches:
            results[key] = content.strip()

        return results

    def _build_output(self) -> Dict[str, Any]:
        return {
            "meta": {
                "title": "三国·命运",
                "chapter": 1,
                "start_node": self._get_start_node()
            },
            "state_init": {
                "stats": {
                    "force": 0,
                    "intel": 0,
                    "loyalty": 0,
                    "ambition": 0
                },
                "flags": {},
                "relations": {}
            },
            "nodes": self.nodes,
            "endings": {
                "END": {
                    "text": "第一章结束"
                }
            }
        }

    def _get_start_node(self) -> str:
        if not self.nodes:
            return ""

        return sorted(self.nodes.keys())[0]


# ==========================
# 主程序入口
# ==========================
if __name__ == "__main__":
    with open("story.txt", "r", encoding="utf-8") as f:
        content = f.read()

    parser = StoryParser()

    try:
        data = parser.parse(content)

        with open("chapter1.json", "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)

        print("✅ JSON生成成功：chapter1.json")

    except StoryParseError as e:
        print(str(e))
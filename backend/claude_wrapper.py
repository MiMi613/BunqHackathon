from __future__ import annotations
import warnings
import os
from pathlib import Path

import anthropic
from dotenv import load_dotenv

load_dotenv(Path(__file__).with_name(".env"))


class ClaudeWrapper:
    """Small wrapper around Anthropic Claude API."""

    def __init__(self) -> None:
        api_key = os.getenv("ANTHROPIC_API_KEY")
        
        if not api_key:
            warnings.warn("ANTHROPIC_API_KEY is not set. Skipping API-dependent steps.")
            api_key = None  # keep as None and guard call sites with `if api_key:`

        # Prefer a dedicated parse model; fall back to the legacy variable.
        self.model_name = os.getenv(
            "ANTHROPIC_MODEL_PARSE",
            os.getenv("ANTHROPIC_MODEL", "claude-opus-4-7"),
        )
        self.client = anthropic.Anthropic(api_key=api_key)

    def generate(
        self,
        prompt: str,
        system_prompt: str | None = None,
        temperature: float | None = None,
        max_tokens: int = 1024,
    ) -> str:
        payload: dict[str, object] = {
            "model": self.model_name,
            "max_tokens": max_tokens,
            "messages": [{"role": "user", "content": prompt}],
        }

        if system_prompt:
            payload["system"] = system_prompt

        # Newer Claude models reject the deprecated temperature field.
        # Keep backward compatibility by only sending it when explicitly non-zero.
        if temperature not in (None, 0):
            payload["temperature"] = temperature

        message = self.client.messages.create(**payload)

        if not message.content:
            return ""

        first_block = message.content[0]
        text_value = getattr(first_block, "text", "")
        return str(text_value)

from __future__ import annotations

import json
from pathlib import Path
from typing import Any

from claude_wrapper import ClaudeWrapper
from models import FoodItem, Info, Person


class ClaudeController:
    """Static controller entry points for Claude-related business logic."""

    _wrapper = ClaudeWrapper()

    @staticmethod
    def generate_response(prompt: str) -> str:
        """Generate a basic response using the wrapper."""
        return ClaudeController._wrapper.generate(prompt=prompt)

    @staticmethod
    def generate_with_context(
        prompt: str,
        system_prompt: str | None = None,
        temperature: float | None = None,
    ) -> str:
        """Generate a Claude response with optional system context.

        Purpose:
        Use this helper when business logic needs a plain text LLM response,
        but you still want to influence behavior through a system prompt.

        Parameters:
        - prompt: The user/task message sent to Claude.
        - system_prompt: Optional high-level instructions (role, rules, format).
        - temperature: Optional randomness control. Lower values are more
          deterministic; higher values are more creative.

        Returns:
        - The first text response from Claude as a string.

        Example:
        ClaudeController.generate_with_context(
            prompt="Summarize this receipt.",
            system_prompt="Respond in one short paragraph.",
            temperature=0,
        )
        """
        return ClaudeController._wrapper.generate(
            prompt=prompt,
            system_prompt=system_prompt,
            temperature=temperature,
        )

    @staticmethod
    def parse_people_from_receipt(
        receipt_text: str,
        user_prompt: str,
    ) -> tuple[Info, list[Person]]:
        """Convert receipt text plus user allocation notes into Info and Person objects.

        Purpose:
        This method is the structured parsing entry point for bill-splitting logic.
        It asks Claude to map receipt items to people, then validates and converts
        the model output into typed domain objects.

        Parameters:
        - receipt_text: OCR/extracted receipt text containing items and prices.
        - user_prompt: User guidance that explains who ate what.

        Behavior:
        - Builds a strict system prompt from PromptForInitialInformation.txt.
        - Calls Claude with deterministic settings (temperature=0).
        - Retries indefinitely until a valid JSON payload is returned.
        - Handles two retry cases:
          1) Model returns ERROR (user context was invalid/unrelated).
          2) Model returns invalid JSON or schema.

        Returns:
                - A tuple of (Info, list[Person]).
                - Info contains meal metadata (location, time, total_price).
                - Each Person contains a name and a list of FoodItem entries assigned to
                    that person.

        Example:
        ClaudeController.parse_people_from_receipt(
            receipt_text="Burger 8.50\nFries 3.00\nCola 2.50",
            user_prompt="Alice had burger and cola, Bob had fries",
        )
        """
        system_prompt = ClaudeController._build_system_prompt(user_prompt)
        retry_note = ""

        while True:
            response = ClaudeController._wrapper.generate(
                prompt=(
                    "Receipt text:\n"
                    f"{receipt_text}\n\n"
                    "User context:\n"
                    f"{user_prompt}\n\n"
                    f"{retry_note}"
                ),
                system_prompt=system_prompt,
                temperature=0,
            ).strip()

            if response.upper() == "ERROR":
                retry_note = (
                    "The user context was invalid or unrelated. Ask for a response "
                    "that describes who ate what from the receipt."
                )
                continue

            try:
                parsed_json = ClaudeController._extract_json_payload(response)
                info = ClaudeController._map_info(parsed_json)
                people = ClaudeController._map_people(parsed_json)
                return info, people
            except (json.JSONDecodeError, ValueError, TypeError):
                retry_note = (
                    "Previous output was not valid JSON for the required schema. "
                    "Return only valid JSON in the required format."
                )

    @staticmethod
    def _build_system_prompt(user_prompt: str) -> str:
        prompt_path = Path(__file__).with_name("PromptForInitialInformation.txt")
        base_prompt = prompt_path.read_text(encoding="utf-8").strip()
        return f"{base_prompt}\n\nAdditional user instructions:\n{user_prompt}"

    @staticmethod
    def _extract_json_payload(raw_response: str) -> dict[str, Any]:
        marker = "==="
        payload = raw_response

        if marker in raw_response:
            payload = raw_response.split(marker, 1)[1].strip()

        data = json.loads(payload)

        if not isinstance(data, dict):
            raise ValueError("Top-level JSON payload must be an object.")

        if "info" not in data or "people" not in data:
            raise ValueError("JSON payload must include 'info' and 'people' keys.")

        return data

    @staticmethod
    def _map_info(data: dict[str, Any]) -> Info:
        info_obj = data.get("info")

        if not isinstance(info_obj, dict):
            raise ValueError("info must be an object.")

        location = info_obj.get("location")
        time = info_obj.get("time")
        total_price = info_obj.get("total_price")

        if not isinstance(location, str):
            raise ValueError("Info location must be a string.")

        if not isinstance(time, str):
            raise ValueError("Info time must be a string.")

        if not isinstance(total_price, (float, int)):
            raise ValueError("Info total_price must be numeric.")

        return Info(location=location, time=time, total_price=float(total_price))

    @staticmethod
    def _map_people(data: dict[str, Any]) -> list[Person]:
        people: list[Person] = []
        people_raw = data.get("people")

        if not isinstance(people_raw, list):
            raise ValueError("people must be an array.")

        for person_obj in people_raw:
            if not isinstance(person_obj, dict):
                raise ValueError("Each person item must be an object.")

            person_name = person_obj.get("name")
            food_items_raw = person_obj.get("food_items", [])

            if not isinstance(person_name, str):
                raise ValueError("Person name must be a string.")

            if not isinstance(food_items_raw, list):
                raise ValueError("food_items must be an array.")

            food_items: list[FoodItem] = []
            for food in food_items_raw:
                if not isinstance(food, dict):
                    raise ValueError("Each food item must be an object.")

                food_name = food.get("name")
                food_price = food.get("price")

                if not isinstance(food_name, str):
                    raise ValueError("FoodItem name must be a string.")

                if not isinstance(food_price, (float, int)):
                    raise ValueError("FoodItem price must be numeric.")

                food_items.append(FoodItem(name=food_name, price=float(food_price)))

            people.append(Person(name=person_name, food_items=food_items))

        return people

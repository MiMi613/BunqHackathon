from __future__ import annotations

import json
from pathlib import Path

from claude_wrapper import ClaudeWrapper
from models import FoodItem, Person


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
        """Generate a response with optional system prompt and temperature."""
        return ClaudeController._wrapper.generate(
            prompt=prompt,
            system_prompt=system_prompt,
            temperature=temperature,
        )

    @staticmethod
    def parse_people_from_receipt(receipt_text: str, user_prompt: str) -> list[Person]:
        """Parse receipt + user context into Person objects with FoodItem arrays."""
        system_prompt = ClaudeController._build_system_prompt(user_prompt)
        response = ClaudeController._wrapper.generate(
            prompt=(
                "Receipt text:\n"
                f"{receipt_text}\n\n"
                "User context:\n"
                f"{user_prompt}"
            ),
            system_prompt=system_prompt,
            temperature=0,
        ).strip()

        if response.upper() == "ERROR":
            raise ValueError(
                "Please describe who ate what from the receipt. "
                "Example: 'Alice ate burger and cola, Bob ate fries'."
            )

        parsed_json = ClaudeController._extract_json_payload(response)
        return ClaudeController._map_people(parsed_json)

    @staticmethod
    def _build_system_prompt(user_prompt: str) -> str:
        prompt_path = Path(__file__).with_name("PromptForInitialInformation.txt")
        base_prompt = prompt_path.read_text(encoding="utf-8").strip()
        return f"{base_prompt}\n\nAdditional user instructions:\n{user_prompt}"

    @staticmethod
    def _extract_json_payload(raw_response: str) -> list[dict[str, object]]:
        marker = "==="
        payload = raw_response

        if marker in raw_response:
            payload = raw_response.split(marker, 1)[1].strip()

        data = json.loads(payload)

        if not isinstance(data, list):
            raise ValueError("Top-level JSON payload must be an array.")

        return data

    @staticmethod
    def _map_people(data: list[dict[str, object]]) -> list[Person]:
        people: list[Person] = []

        for person_obj in data:
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

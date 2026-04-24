from __future__ import annotations

from dataclasses import dataclass, field


@dataclass
class FoodItem:
    name: str
    price: float


@dataclass
class Person:
    name: str
    food_items: list[FoodItem] = field(default_factory=list)

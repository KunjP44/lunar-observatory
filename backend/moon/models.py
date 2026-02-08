# backend/moon/models.py
from pydantic import BaseModel


class MoonResponse(BaseModel):
    date: str
    age: float
    phase: str
    illumination: float

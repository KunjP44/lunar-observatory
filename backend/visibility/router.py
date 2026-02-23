# backend/visibility/router.py

from fastapi import APIRouter
from .engine import compute_visibility

router = APIRouter()


@router.get("/")
def get_visibility(date: str):
    return compute_visibility(date)

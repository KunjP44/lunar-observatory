# backend/visibility/router.py

from fastapi import APIRouter
from backend.visibility.engine import compute_visibility, VISIBILITY_CACHE
from backend.database import get_visibility as db_get_visibility, save_visibility

router = APIRouter()


@router.get("/")
def get_visibility(date: str):

    # 1️⃣ Check RAM cache first
    if date in VISIBILITY_CACHE:
        return VISIBILITY_CACHE[date]

    # 2️⃣ Check SQLite persistent cache
    db_data = db_get_visibility(date)
    if db_data:
        VISIBILITY_CACHE[date] = db_data
        return db_data

    # 3️⃣ Compute if not cached anywhere
    result = compute_visibility(date)

    VISIBILITY_CACHE[date] = result
    save_visibility(date, result)

    return result

# Lunar_Observatory/backend/solar/router.py
from fastapi import APIRouter
from . import kepler

router = APIRouter()


# CHANGE 1: Route name changed from "/planets" to "/positions" to match frontend
@router.get("/positions")
async def get_planet_positions(date: str = None):
    data = kepler.get_positions(date)

    # CHANGE 2: Wrap the data in a "positions" key
    # The frontend expects: { "positions": { ... } }
    return {"positions": data}

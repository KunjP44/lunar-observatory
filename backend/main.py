from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.moon.calendar import get_ui_moon_data
from backend.solar.router import router as solar_router  # ✅ IMPORT ROUTER

api = FastAPI()

api.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ INCLUDE SOLAR ROUTER
api.include_router(solar_router, prefix="/api/solar")


@api.get("/moon")
def moon_endpoint(d: str, lat: float | None = None, lon: float | None = None):
    return get_ui_moon_data(d, lat, lon)

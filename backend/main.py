from backend.database import get_all_tokens
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi import Body
from pydantic import BaseModel
import datetime
import pytz

from backend.moon.calendar import get_ui_moon_data
from backend.solar.router import router as solar_router
from backend.events.router import router as events_router, init_event_cache
from backend.visibility.router import router as visibility_router
from backend.push import register_token, send_notification
from backend.database import init_db

api = FastAPI()
init_db()

api.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

api.include_router(solar_router, prefix="/api/solar")
api.include_router(events_router, prefix="/api/events")
api.include_router(visibility_router, prefix="/api/visibility")


@api.get("/moon")
def moon_endpoint(d: str, lat: float | None = None, lon: float | None = None):
    return get_ui_moon_data(d, lat, lon)


init_event_cache()


class TokenModel(BaseModel):
    token: str


@api.post("/api/push/register")
def push_register(data: TokenModel):
    register_token(data.token)
    return {"status": "registered"}


@api.get("/api/push/test")
def push_test():

    tokens = get_all_tokens()

    send_notification("Backend Test", "Push from FastAPI backend is working.")

    return {"status": "sent", "tokens": tokens}


@api.get("/api/push/morning")
def morning_brief():
    india = pytz.timezone("Asia/Kolkata")
    now = datetime.datetime.now(india)

    today_str = now.strftime("%Y-%m-%d")

    # Moon
    moon = get_ui_moon_data(today_str)

    # Planet visibility
    from backend.visibility.engine import compute_visibility

    visibility = compute_visibility(today_str)

    good_planets = []
    for name, data in visibility.items():
        if data["visibility_rating"] in ["Good", "Excellent"]:
            good_planets.append(name.capitalize())

    # Build structured message
    moon_line_1 = f"Moon: {moon['phase']}"
    moon_line_2 = f"Illumination: {moon['illumination']}%"

    if good_planets:
        planet_line = "Best Tonight:\n" + ", ".join(good_planets)
    else:
        planet_line = "No major planets well placed tonight"

    body = f"{moon_line_1}\n{moon_line_2}\n\n{planet_line}"

    send_notification("Lunar Observatory", body)

    return {
        "status": "morning sent",
        "date": today_str,
        "visible_planets": good_planets,
    }

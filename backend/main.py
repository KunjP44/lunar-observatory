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
from backend.facts import get_random_fact

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


class TokenModel(BaseModel):
    token: str


@api.post("/api/push/register")
def push_register(data: TokenModel):
    register_token(data.token)

    # Send welcome notification automatically
    send_notification(
        "Welcome to Lunar Observatory 🌌",
        "You're now subscribed to Morning Sky Updates.",
    )

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

    moon = get_ui_moon_data(today_str)
    fact = get_random_fact()

    body = f"🌌 {fact}\n\n" f"🌙 {moon['phase']} • {moon['illumination']}%"

    # send_notification("Lunar Observatory", body)
    send_notification("Morning Sky Update", body)

    return {"status": "morning sent"}


@api.get("/")
def health():
    return {"status": "ok"}

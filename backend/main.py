from backend.database import get_all_tokens
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi import Body
from pydantic import BaseModel
import datetime
import pytz
from contextlib import asynccontextmanager

from datetime import date, timedelta
from backend.visibility.engine import compute_visibility, VISIBILITY_CACHE
from backend.moon.calendar import get_ui_moon_data
from backend.solar.router import router as solar_router
from backend.events.router import router as events_router, init_event_cache
from backend.visibility.router import router as visibility_router
from backend.push import register_token, send_notification
from backend.database import (
    init_db,
    get_visibility as db_get_visibility,
    save_visibility,
    cleanup_old_visibility,
)
from backend.facts import get_random_fact
import asyncio


@asynccontextmanager
async def lifespan(app: FastAPI):

    async def preload_visibility_background():
        print("🔥 Background visibility preload started...")

        cleanup_old_visibility(30)

        today = date.today()

        for i in range(7):
            d = today + timedelta(days=i)
            date_str = d.isoformat()

            db_data = db_get_visibility(date_str)

            if db_data:
                VISIBILITY_CACHE[date_str] = db_data
                print("📦 Loaded from DB:", date_str)
            else:
                try:
                    # Run CPU-intensive task in a separate thread
                    result = await asyncio.to_thread(compute_visibility, date_str)
                    VISIBILITY_CACHE[date_str] = result
                    save_visibility(date_str, result)
                    print("✅ Computed & Saved:", date_str)
                except Exception as e:
                    print("❌ Preload error:", e)

        print("🚀 Background preload finished.")

    # 🔥 THIS LINE IS THE FIX
    asyncio.create_task(preload_visibility_background())

    yield

    print("🛑 Shutdown complete")


api = FastAPI(lifespan=lifespan)

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
    daily_brief: bool = False
    planet_brief: bool = False


@api.post("/api/push/register")
def push_register(data: TokenModel):
    register_token(data.token, data.daily_brief, data.planet_brief)

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
    send_notification("Morning Sky Update", body, category="daily")

    return {"status": "morning sent"}


@api.get("/api/push/debug")
def debug_tokens():
    from backend.database import get_all_tokens, get_daily_tokens, get_planet_tokens

    return {
        "all": get_all_tokens(),
        "daily": get_daily_tokens(),
        "planet": get_planet_tokens(),
    }


@api.api_route("/", methods=["GET", "HEAD"])
def health():
    return {"status": "ok"}

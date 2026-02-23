from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi import Body

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


@api.post("/api/push/register")
def push_register(token: str = Body(...)):
    register_token(token)
    return {"status": "registered"}


@api.post("/api/push/test")
def push_test():
    send_notification("Backend Test", "Push from FastAPI backend is working.")
    return {"status": "sent"}

from fastapi import APIRouter
from datetime import date, timedelta
from typing import List

from backend.events.engine import generate_events_for_year
from backend.events.models import Event

router = APIRouter()

# In-memory cache
EVENT_CACHE = {}


def init_event_cache():
    current_year = date.today().year
    for year in [current_year, current_year + 1, current_year + 2]:
        EVENT_CACHE[year] = generate_events_for_year(year)


@router.get("/upcoming", response_model=List[Event])
def get_upcoming_events(days: int = 60):
    today = date.today()
    end = today + timedelta(days=days)

    results = []

    for year in EVENT_CACHE:
        for event in EVENT_CACHE[year]:
            event_date = date.fromisoformat(event.date)
            if today <= event_date <= end:
                results.append(event)

    results.sort(key=lambda e: e.date)
    return results


@router.get("/next")
def get_next_major_event():
    today = date.today()
    limit = today + timedelta(days=3)

    for year in EVENT_CACHE:
        for event in EVENT_CACHE[year]:
            event_date = date.fromisoformat(event.date)
            if (
                today <= event_date <= limit
                and event.priority == "major"
                and event.visible_from_india
            ):
                return {
                    "has_major_within_3_days": True,
                    "next_event": event,
                }

    return {"has_major_within_3_days": False}


@router.get("/year/{year}", response_model=List[Event])
def get_events_for_year(year: int):

    # Lazy generation (no cold start)
    if year not in EVENT_CACHE:
        print(f"Generating events for {year}...")
        EVENT_CACHE[year] = generate_events_for_year(year)

    return sorted(EVENT_CACHE[year], key=lambda e: e.date)

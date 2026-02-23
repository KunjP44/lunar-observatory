from pydantic import BaseModel
from typing import List, Optional


class Event(BaseModel):
    id: str
    date: str
    type: str  # lunar_eclipse | solar_eclipse | supermoon | opposition
    title: str
    priority: str  # major | minor
    visible_from_india: bool
    visibility_regions: List[str]
    peak_time_ist: Optional[str] = None
    planet: Optional[str] = None

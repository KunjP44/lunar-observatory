# backend/moon/phases.py
from datetime import date
import math

# Reference new moon: Jan 6, 2000 18:14 UTC
NEW_MOON_JD = 2451550.1
SYNODIC_MONTH = 29.53058867  # days


def julian_day(d: date) -> float:
    """Convert date to Julian Day"""
    a = (14 - d.month) // 12
    y = d.year + 4800 - a
    m = d.month + 12 * a - 3

    jd = d.day + ((153 * m + 2) // 5) + 365 * y
    jd += y // 4 - y // 100 + y // 400 - 32045
    return float(jd)


def moon_age(d: date) -> float:
    jd = julian_day(d)
    days_since_new = jd - NEW_MOON_JD
    age = days_since_new % SYNODIC_MONTH
    return age


def illumination(age: float) -> float:
    """Percentage illumination"""
    return 50 * (1 - math.cos(2 * math.pi * age / SYNODIC_MONTH))


def phase_name(age: float) -> str:
    if age < 1.84566:
        return "New Moon"
    elif age < 5.53699:
        return "Waxing Crescent"
    elif age < 9.22831:
        return "First Quarter"
    elif age < 12.91963:
        return "Waxing Gibbous"
    elif age < 16.61096:
        return "Full Moon"
    elif age < 20.30228:
        return "Waning Gibbous"
    elif age < 23.99361:
        return "Last Quarter"
    elif age < 27.68493:
        return "Waning Crescent"
    else:
        return "New Moon"

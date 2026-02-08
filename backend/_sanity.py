from datetime import date
from moon.phases import moon_age, phase_name, illumination

d = date(2026, 2, 24)

print("Age:", moon_age(d))
print("Phase:", phase_name(moon_age(d)))
print("Illumination:", illumination(moon_age(d)))

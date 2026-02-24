import random

FACTS = [
    "A day on Venus is longer than a year on Venus.",
    "Neutron stars can spin 600 times per second.",
    "Jupiter protects Earth by absorbing many comets.",
    "The Moon is moving away from Earth by 3.8 cm per year.",
    "There are more trees on Earth than stars in the Milky Way.",
    "Saturn could float in water due to its low density.",
    "One million Earths could fit inside the Sun.",
    "The footprints on the Moon will last millions of years.",
    "Olympus Mons on Mars is the tallest volcano in the solar system.",
    "A teaspoon of neutron star weighs about a billion tons.",
]

last_fact = None


def get_random_fact():
    global last_fact

    fact = random.choice(FACTS)

    while fact == last_fact:
        fact = random.choice(FACTS)

    last_fact = fact
    return fact

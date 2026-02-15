import os

import google.generativeai as genai

ALLOWED_LEVELS = {
    "beginner": "Beginner",
    "intermediate": "Intermediate",
    "advanced": "Advanced",
}

ALLOWED_DIFFICULTIES = {"easy", "medium", "hard"}


def normalize_level(level):
    level_key = str(level or "Intermediate").strip().lower()
    return level_key if level_key in ALLOWED_LEVELS else "intermediate"


def normalize_difficulty(difficulty):
    diff = str(difficulty or "medium").strip().lower()
    return diff if diff in ALLOWED_DIFFICULTIES else "medium"


def init_gemini_model():
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        return None
    genai.configure(api_key=api_key)
    return genai.GenerativeModel("gemini-2.5-flash")

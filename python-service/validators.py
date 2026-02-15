from app_config import ALLOWED_DIFFICULTIES, ALLOWED_LEVELS


def _is_non_empty_string(value):
    return isinstance(value, str) and bool(value.strip())


def validate_roadmap_response(parsed_json, level_key):
    if not isinstance(parsed_json, dict):
        return None, "Roadmap response is not a JSON object"

    title = parsed_json.get("title")
    description = parsed_json.get("description")
    if not _is_non_empty_string(title):
        return None, "Roadmap title is missing or empty"
    if not _is_non_empty_string(description):
        return None, "Roadmap description is missing or empty"

    chapters = parsed_json.get(level_key)
    if not isinstance(chapters, list):
        chapters = parsed_json.get("modules")
    if not isinstance(chapters, list):
        chapters = parsed_json.get("topics")
    if not isinstance(chapters, list):
        return None, f"Roadmap chapters are missing for key '{level_key}'"

    if len(chapters) < 3:
        return None, "Roadmap must include at least 3 modules"

    normalized_chapters = []
    for idx, chapter in enumerate(chapters):
        if not isinstance(chapter, dict):
            return None, f"Module at index {idx} is not an object"

        chapter_title = chapter.get("title")
        chapter_description = chapter.get("description")
        subtopics = chapter.get("subtopics")
        quiz_recommended = chapter.get("quiz_recommended")

        if not _is_non_empty_string(chapter_title):
            return None, f"Module {idx + 1} title is missing or empty"
        if not _is_non_empty_string(chapter_description):
            return None, f"Module {idx + 1} description is missing or empty"
        if not isinstance(subtopics, list):
            return None, f"Module {idx + 1} subtopics must be an array"
        if len(subtopics) < 3 or len(subtopics) > 6:
            return None, f"Module {idx + 1} must include 3-6 subtopics"
        if not all(_is_non_empty_string(sub) for sub in subtopics):
            return None, f"Module {idx + 1} contains invalid subtopic titles"
        if not isinstance(quiz_recommended, bool):
            return None, f"Module {idx + 1} quiz_recommended must be boolean"

        normalized_chapters.append(
            {
                "title": chapter_title.strip(),
                "description": chapter_description.strip(),
                "subtopics": [sub.strip() for sub in subtopics],
                "quiz_recommended": quiz_recommended,
            }
        )

    normalized = {
        "title": title.strip(),
        "description": description.strip(),
        "level": ALLOWED_LEVELS[level_key],
        "modules": normalized_chapters,
        level_key: normalized_chapters,
    }
    return normalized, None


def validate_quiz_response(parsed_json):
    if not isinstance(parsed_json, dict):
        return None, "Quiz response is not a JSON object"

    title = parsed_json.get("title")
    description = parsed_json.get("description")
    topic = parsed_json.get("topic")
    difficulty = parsed_json.get("difficulty")
    qpa = parsed_json.get("questionsPerAttempt")
    questions = parsed_json.get("questions")

    if not _is_non_empty_string(title):
        return None, "Quiz title is missing or empty"
    if not _is_non_empty_string(description):
        return None, "Quiz description is missing or empty"
    if not _is_non_empty_string(topic):
        return None, "Quiz topic is missing or empty"
    if not isinstance(difficulty, str) or difficulty.lower() not in ALLOWED_DIFFICULTIES:
        return None, "Quiz difficulty must be one of easy|medium|hard"

    try:
        qpa = int(qpa)
    except (TypeError, ValueError):
        return None, "questionsPerAttempt must be an integer"
    if qpa < 3 or qpa > 10:
        return None, "questionsPerAttempt must be between 3 and 10"

    if not isinstance(questions, list):
        return None, "questions must be an array"
    if len(questions) < qpa:
        return None, "questions array has fewer items than questionsPerAttempt"

    normalized_questions = []
    for idx, q in enumerate(questions):
        if not isinstance(q, dict):
            return None, f"Question at index {idx} is not an object"

        question = q.get("question")
        q_type = q.get("type")
        options = q.get("options")
        correct_answer = q.get("correctAnswer")
        explanation = q.get("explanation")

        if not _is_non_empty_string(question):
            return None, f"Question {idx + 1} text is missing or empty"
        if q_type != "mcq":
            return None, f"Question {idx + 1} type must be 'mcq'"
        if not isinstance(options, list) or len(options) != 4:
            return None, f"Question {idx + 1} options must be exactly 4"
        if not all(_is_non_empty_string(opt) for opt in options):
            return None, f"Question {idx + 1} has invalid options"
        try:
            correct_answer = int(correct_answer)
        except (TypeError, ValueError):
            return None, f"Question {idx + 1} correctAnswer must be an integer"
        if correct_answer < 0 or correct_answer > 3:
            return None, f"Question {idx + 1} correctAnswer must be 0-3"
        if not _is_non_empty_string(explanation):
            return None, f"Question {idx + 1} explanation is missing or empty"

        normalized_questions.append(
            {
                "question": question.strip(),
                "type": "mcq",
                "options": [opt.strip() for opt in options],
                "correctAnswer": correct_answer,
                "explanation": explanation.strip(),
            }
        )

    normalized = {
        "title": title.strip(),
        "description": description.strip(),
        "topic": topic.strip(),
        "difficulty": difficulty.lower(),
        "questionsPerAttempt": qpa,
        "questions": normalized_questions,
    }
    return normalized, None

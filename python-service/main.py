import os

from dotenv import load_dotenv
from flask import Flask, jsonify, request
from flask_cors import CORS

from app_config import ALLOWED_LEVELS, init_gemini_model, normalize_difficulty, normalize_level
from json_parser import extract_json_from_text
from prompts import build_chat_prompt, build_quiz_prompt, build_roadmap_prompt, build_summarize_prompt
from validators import validate_quiz_response, validate_roadmap_response

load_dotenv()

app = Flask(__name__)
CORS(app)

model = init_gemini_model()
if model:
    print("Gemini API configured successfully")
else:
    print("Warning: GEMINI_API_KEY not found. AI features will not work.")


@app.route("/health", methods=["GET"])
def health_check():
    return jsonify({"status": "healthy", "gemini_configured": model is not None})


@app.route("/generate-roadmap", methods=["POST"])
def generate_roadmap():
    if not model:
        return jsonify({"success": False, "error": "Gemini API not configured"}), 500

    data = request.json or {}
    prompt = str(data.get("prompt", "")).strip()
    level_key = normalize_level(data.get("level", "Intermediate"))
    level_title = ALLOWED_LEVELS[level_key]

    if not prompt:
        return jsonify({"success": False, "error": "Prompt is required"}), 400

    try:
        generation_prompt = build_roadmap_prompt(prompt, level_key, level_title)
        response = model.generate_content(generation_prompt)
        parsed_json = extract_json_from_text(response.text)
        if not parsed_json:
            return jsonify({"success": False, "error": "Failed to parse roadmap response"}), 500

        normalized_roadmap, error = validate_roadmap_response(parsed_json, level_key)
        if error:
            print(f"Roadmap validation failed: {error}")
            return jsonify({"success": False, "error": "Invalid roadmap response from model"}), 500

        return jsonify({"success": True, "roadmap": normalized_roadmap})
    except Exception as e:
        print(f"Error generating roadmap: {e}")
        return jsonify({"success": False, "error": "Failed to generate roadmap. Please try again."}), 500


@app.route("/generate-quiz", methods=["POST"])
def generate_quiz():
    if not model:
        return jsonify({"success": False, "error": "Gemini API not configured"}), 500

    data = request.json or {}
    topic = str(data.get("topic", "")).strip()
    requested_difficulty = normalize_difficulty(data.get("difficulty", "medium"))
    num_questions = int(data.get("numQuestions", 15))
    num_questions = max(5, min(20, num_questions))  # clamp 5–20

    if not topic:
        return jsonify({"success": False, "error": "Topic is required"}), 400

    try:
        generation_prompt = build_quiz_prompt(topic, requested_difficulty, num_questions)
        response = model.generate_content(generation_prompt)
        parsed_json = extract_json_from_text(response.text)
        if not parsed_json:
            return jsonify({"success": False, "error": "Failed to parse quiz response"}), 500

        normalized_quiz, error = validate_quiz_response(parsed_json)
        if error:
            print(f"Quiz validation failed: {error}")
            return jsonify({"success": False, "error": "Invalid quiz response from model"}), 500

        return jsonify({"success": True, "quiz": normalized_quiz})
    except Exception as e:
        print(f"Error generating quiz: {e}")
        return jsonify({"success": False, "error": "Failed to generate quiz. Please try again."}), 500


@app.route("/chat", methods=["POST"])
def chat():
    if not model:
        return jsonify({"success": False, "error": "Gemini API not configured"}), 500

    data = request.json or {}
    message = str(data.get("message", "")).strip()
    history = data.get("history", [])
    roadmap_context = data.get("roadmapContext", {})

    if not message:
        return jsonify({"success": False, "error": "Message is required"}), 400

    try:
        # Build system prompt with roadmap context
        system_prompt = build_chat_prompt(roadmap_context)

        # Convert history to Gemini format
        gemini_history = []
        for msg in history:
            role = "user" if msg.get("role") == "user" else "model"
            text = msg.get("text", "")
            if text:
                gemini_history.append({"role": role, "parts": [text]})

        # Start a chat session with history
        chat_session = model.start_chat(history=gemini_history)

        # Prepend system prompt to the user message for context
        full_message = f"{system_prompt}\n\nStudent's question: {message}" if not gemini_history else message

        # For follow-up messages, the system prompt is already established via the first message
        # But if this is the first message in the session, we include the system prompt
        if not gemini_history:
            response = chat_session.send_message(f"{system_prompt}\n\nStudent's question: {message}")
        else:
            response = chat_session.send_message(message)

        reply = response.text.strip()
        return jsonify({"success": True, "reply": reply})
    except Exception as e:
        print(f"Error in chat: {e}")
        return jsonify({"success": False, "error": "Failed to generate response. Please try again."}), 500


@app.route("/summarize", methods=["POST"])
def summarize():
    if not model:
        return jsonify({"success": False, "error": "Gemini API not configured"}), 500

    data = request.json or {}
    content = str(data.get("content", "")).strip()

    if not content:
        return jsonify({"success": False, "error": "Content is required"}), 400

    # Limit content length to prevent excessive API usage
    max_content_length = 10000
    if len(content) > max_content_length:
        content = content[:max_content_length]

    try:
        generation_prompt = build_summarize_prompt(content)
        response = model.generate_content(generation_prompt)
        parsed_json = extract_json_from_text(response.text)
        
        if not parsed_json:
            return jsonify({"success": False, "error": "Failed to parse summary response"}), 500

        # Validate the response structure
        if "title" not in parsed_json or "sections" not in parsed_json or "keyPoints" not in parsed_json:
            return jsonify({"success": False, "error": "Invalid summary response structure"}), 500

        return jsonify({"success": True, "summary": parsed_json})
    except Exception as e:
        print(f"Error generating summary: {e}")
        return jsonify({"success": False, "error": "Failed to generate summary. Please try again."}), 500


if __name__ == "__main__":
    port = int(os.getenv("PORT", 5001))
    debug = os.getenv("DEBUG", "true").lower() == "true"
    print(f"Starting Gemini AI Service on port {port}")
    app.run(host="0.0.0.0", port=port, debug=debug)


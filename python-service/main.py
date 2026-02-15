import os

from dotenv import load_dotenv
from flask import Flask, jsonify, request
from flask_cors import CORS

from app_config import ALLOWED_LEVELS, init_gemini_model, normalize_difficulty, normalize_level
from json_parser import extract_json_from_text
from prompts import build_quiz_prompt, build_roadmap_prompt
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

    if not topic:
        return jsonify({"success": False, "error": "Topic is required"}), 400

    try:
        generation_prompt = build_quiz_prompt(topic, requested_difficulty)
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


if __name__ == "__main__":
    port = int(os.getenv("PORT", 5001))
    debug = os.getenv("DEBUG", "true").lower() == "true"
    print(f"Starting Gemini AI Service on port {port}")
    app.run(host="0.0.0.0", port=port, debug=debug)

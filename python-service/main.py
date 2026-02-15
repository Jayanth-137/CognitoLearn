import os
import json
import re
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import google.generativeai as genai

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)

# Configure Gemini API
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
    model = genai.GenerativeModel('gemini-2.5-flash')
    print("✓ Gemini API configured successfully!")
else:
    model = None
    print("✗ Warning: GEMINI_API_KEY not found. AI features will not work.")


def extract_json_from_text(text):
    """Extract JSON from text, handling code blocks and raw JSON."""
    # Try to find JSON in code blocks first
    code_block_match = re.search(r'```(?:json)?\s*([\s\S]*?)\s*```', text)
    if code_block_match:
        try:
            return json.loads(code_block_match.group(1))
        except json.JSONDecodeError:
            pass
    
    # Try to find raw JSON object or array
    stack = []
    start_index = -1
    
    for i, char in enumerate(text):
        if char in '{[':
            if not stack:
                start_index = i
            stack.append(char)
        elif char in '}]':
            if stack:
                expected = '{' if char == '}' else '['
                if stack[-1] == expected:
                    stack.pop()
                    if not stack:
                        try:
                            return json.loads(text[start_index:i+1])
                        except json.JSONDecodeError:
                            pass
                else:
                    stack = []
                    start_index = -1
    
    return None


@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint."""
    return jsonify({
        "status": "healthy",
        "gemini_configured": model is not None
    })


@app.route('/generate-roadmap', methods=['POST'])
def generate_roadmap():
    """Generate a learning roadmap using Gemini API."""
    if not model:
        return jsonify({"success": False, "error": "Gemini API not configured"}), 500
    
    data = request.json
    prompt = data.get('prompt', '')
    level = data.get('level', 'Intermediate')
    
    if not prompt:
        return jsonify({"success": False, "error": "Prompt is required"}), 400
    
    level_key = level.lower()
    
    generation_prompt = f"""You are an expert curriculum designer. Create a comprehensive learning roadmap for "{prompt}" at the {level} level.

Generate a roadmap with:
- title: A short compelling title for the learning path (e.g., "Master Python Programming", "Web Development Bootcamp")
- description: A brief description (1)
- Atleast 3 main topics/chapters. For each topic, include:
  - title: A clear, concise title
  - description: A brief description (1-2 sentences)
  - subtopics: An array of 3-6 subtopic titles (strings only, no descriptions)
  - quiz_recommended: Boolean indicating if this topic warrants a quiz (true for conceptual topics, false for purely practical topics)

Return ONLY valid JSON in this exact format:
{{
  "title": "Compelling Roadmap Title",
  "description": "Brief description of the roadmap",
  "{level_key}": [
    {{
      "title": "Topic Title",
      "description": "Brief topic description",
      "subtopics": ["Subtopic 1", "Subtopic 2", "Subtopic 3"],
      "quiz_recommended": true
    }}
  ]
}}

Generate the roadmap now for: {prompt}"""

    try:
        response = model.generate_content(generation_prompt)
        response_text = response.text
        
        parsed_json = extract_json_from_text(response_text)
        
        if parsed_json:
            return jsonify({"success": True, "roadmap": parsed_json})
        else:
            return jsonify({
                "success": False, 
                "error": "Failed to generate roadmap. Please try again."
            }), 500
            
    except Exception as e:
        print(f"Error generating roadmap: {e}")
        return jsonify({"success": False, "error": "Failed to generate roadmap. Please try again."}), 500


@app.route('/generate-quiz', methods=['POST'])
def generate_quiz():
    """Generate a quiz question pool for a specific topic using Gemini API."""
    if not model:
        return jsonify({"success": False, "error": "Gemini API not configured"}), 500
    
    data = request.json
    topic = data.get('topic', '')
    difficulty = data.get('difficulty', 'medium')
    
    if not topic:
        return jsonify({"success": False, "error": "Topic is required"}), 400
    
    generation_prompt = f"""You are an expert quiz creator. Generate a {difficulty} difficulty quiz about "{topic}".

First, analyze the topic's scope and complexity to determine how many questions are appropriate for ONE quiz attempt:
- Narrow/simple topics (e.g., "for loops", "CSS box model"): 3-4 questions per attempt
- Medium topics (e.g., "Binary Search Trees", "React Hooks"): 5-7 questions per attempt
- Broad/complex topics (e.g., "Data Structures", "Operating Systems"): 8-10 questions per attempt

Then generate a QUESTION POOL that is 2-3 times the per-attempt count. For example, if you decide 5 questions per attempt, generate 12-15 pool questions. This pool allows variety across multiple attempts.

Each question must have:
- question: The question text
- type: Always "mcq"
- options: Exactly 4 answer options as an array of strings
- correctAnswer: Index (0-3) of the correct option
- explanation: Brief explanation of why the answer is correct

Return ONLY valid JSON in this exact format:
{{
  "title": "{topic} Quiz",
  "description": "Test your knowledge of {topic}",
  "topic": "{topic}",
  "difficulty": "{difficulty}",
  "questionsPerAttempt": <number you decided, minimum 3, maximum 10>,
  "questions": [
    {{
      "question": "Question text here?",
      "type": "mcq",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0,
      "explanation": "Explanation of the correct answer"
    }}
  ]
}}

Generate the quiz now:"""

    try:
        response = model.generate_content(generation_prompt)
        response_text = response.text
        
        parsed_json = extract_json_from_text(response_text)
        
        if parsed_json:
            # Enforce minimum 3 questions per attempt
            qpa = parsed_json.get('questionsPerAttempt', 5)
            qpa = max(3, min(10, int(qpa)))
            parsed_json['questionsPerAttempt'] = qpa
            
            # Ensure pool has at least questionsPerAttempt questions
            questions = parsed_json.get('questions', [])
            if len(questions) < qpa:
                parsed_json['questionsPerAttempt'] = max(3, len(questions))
            
            return jsonify({"success": True, "quiz": parsed_json})
        else:
            return jsonify({
                "success": False, 
                "error": "Failed to parse quiz response"
            }), 500
            
    except Exception as e:
        print(f"Error generating quiz: {e}")
        return jsonify({"success": False, "error": str(e)}), 500


if __name__ == '__main__':
    port = int(os.getenv('PORT', 5001))
    debug = os.getenv('DEBUG', 'true').lower() == 'true'
    
    print(f"🚀 Starting Gemini AI Service on port {port}")
    app.run(host='0.0.0.0', port=port, debug=debug)

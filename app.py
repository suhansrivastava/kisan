import os
import uuid
from flask import Flask, render_template, request, jsonify, send_from_directory
from werkzeug.utils import secure_filename
from services import (
    analyze_crop_image,
    get_mandi_prices,
    get_govt_schemes,
    get_weather_forecast,
    hal_chatbot_response
)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
UPLOAD_FOLDER = os.path.join(BASE_DIR, "uploads")
ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "webp"}

os.makedirs(UPLOAD_FOLDER, exist_ok=True)

app = Flask(__name__)
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER
app.config["MAX_CONTENT_LENGTH"] = 16 * 1024 * 1024  # 16 MB max

def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route("/")
def index():
    initial_weather = get_weather_forecast("Delhi")
    initial_mandis = get_mandi_prices()[:8]
    initial_schemes = get_govt_schemes()
    return render_template(
        "index.html",
        weather=initial_weather,
        mandis=initial_mandis,
        schemes=initial_schemes
    )

@app.route("/api/detect", methods=["POST"])
def detect_disease():
    if "image" not in request.files:
        return jsonify({"success": False, "error": "No image file uploaded"}), 400
    
    file = request.files["image"]
    if file.filename == "":
        return jsonify({"success": False, "error": "No selected file"}), 400
        
    if file and allowed_file(file.filename):
        ext = file.filename.rsplit(".", 1)[1].lower()
        unique_name = f"{uuid.uuid4().hex}.{ext}"
        filepath = os.path.join(app.config["UPLOAD_FOLDER"], unique_name)
        file.save(filepath)
        
        crop_hint = request.form.get("crop_hint", "")
        analysis_result = analyze_crop_image(filepath, crop_hint)
        analysis_result["image_url"] = f"/uploads/{unique_name}"
        return jsonify(analysis_result)
        
    return jsonify({"success": False, "error": "Invalid image format. Allowed: PNG, JPG, JPEG, WEBP"}), 400

@app.route("/api/mandi", methods=["GET"])
def api_mandi():
    q = request.args.get("q", "")
    state = request.args.get("state", "")
    commodity = request.args.get("commodity", "")
    results = get_mandi_prices(search_query=q, state_filter=state, commodity_filter=commodity)
    return jsonify({"success": True, "mandis": results, "count": len(results)})

@app.route("/api/schemes", methods=["GET"])
def api_schemes():
    q = request.args.get("q", "")
    cat = request.args.get("category", "")
    results = get_govt_schemes(category_filter=cat, search_query=q)
    return jsonify({"success": True, "schemes": results, "count": len(results)})

@app.route("/api/weather", methods=["GET"])
def api_weather():
    city = request.args.get("city", "Delhi")
    wdata = get_weather_forecast(city)
    return jsonify({"success": True, "weather": wdata})

@app.route("/api/chat", methods=["POST"])
def api_chat():
    data = request.get_json() or {}
    message = data.get("message", "")
    if not message.strip():
        return jsonify({"success": False, "error": "Message cannot be empty"}), 400
        
    bot_resp = hal_chatbot_response(message)
    return jsonify({"success": True, **bot_resp})

@app.route("/uploads/<filename>")
def uploaded_file(filename):
    return send_from_directory(app.config["UPLOAD_FOLDER"], filename)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)

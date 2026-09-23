#!/usr/bin/env python3
# ============================================
# MANDIMART AI VEGETABLE COMPARISON API
# Flask backend that compares two vegetable images
# Endpoint: POST /compare  (multipart/form-data: image1, image2)
# ============================================

from flask import Flask, request, jsonify
from flask_cors import CORS
from PIL import Image
import numpy as np
import cv2
import io

app = Flask(__name__)
CORS(app)  # Allow requests from the PHP/HTML frontend (any origin)


# =====================================================
# IMAGE LOADER
# =====================================================

def load_image(file):
    """Read an uploaded file into an OpenCV (BGR) image array."""
    data = file.read()
    image = Image.open(io.BytesIO(data)).convert("RGB")
    image = np.array(image)
    image = cv2.cvtColor(image, cv2.COLOR_RGB2BGR)
    return image


# =====================================================
# COLOR ANALYSIS
# =====================================================

def analyze_color(image):
    hsv = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)
    saturation = np.mean(hsv[:, :, 1])
    brightness = np.mean(hsv[:, :, 2])

    saturation_score = min(100, max(0, saturation / 2.55))
    brightness_score = 100 - abs(brightness - 140) / 1.4
    brightness_score = min(100, max(0, brightness_score))

    color_score = (saturation_score * 0.6) + (brightness_score * 0.4)
    return round(color_score, 2)


# =====================================================
# TEXTURE ANALYSIS
# =====================================================

def analyze_texture(image):
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    variance = cv2.Laplacian(gray, cv2.CV_64F).var()
    texture_score = min(100, max(0, variance / 10))
    return round(texture_score, 2)


# =====================================================
# DEFECT ANALYSIS (dark spots / bruises)
# =====================================================

def analyze_defects(image):
    hsv = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)
    lower = np.array([0, 0, 0])
    upper = np.array([180, 255, 80])
    mask = cv2.inRange(hsv, lower, upper)

    total_pixels = mask.shape[0] * mask.shape[1]
    defect_pixels = np.count_nonzero(mask)
    defect_percentage = (defect_pixels / total_pixels) * 100

    defect_score = 100 - (defect_percentage * 4)
    defect_score = min(100, max(0, defect_score))
    return round(defect_score, 2)


# =====================================================
# SIZE / SHAPE ANALYSIS
# =====================================================

def analyze_shape(image):
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    blurred = cv2.GaussianBlur(gray, (5, 5), 0)
    _, threshold = cv2.threshold(blurred, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
    contours, _ = cv2.findContours(threshold, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

    if not contours:
        return 50

    largest = max(contours, key=cv2.contourArea)
    area = cv2.contourArea(largest)
    perimeter = cv2.arcLength(largest, True)

    if perimeter == 0:
        return 50

    circularity = (4 * np.pi * area) / (perimeter * perimeter)
    shape_score = min(100, circularity * 100)
    return round(shape_score, 2)


# =====================================================
# FRESHNESS + OVERALL QUALITY
# =====================================================

def calculate_freshness(color, texture, defects):
    freshness = (color * 0.40) + (texture * 0.25) + (defects * 0.35)
    return round(min(100, max(0, freshness)), 2)


def analyze_image(image):
    color = analyze_color(image)
    texture = analyze_texture(image)
    defects = analyze_defects(image)
    shape = analyze_shape(image)
    freshness = calculate_freshness(color, texture, defects)

    overall = (
        freshness * 0.35 +
        color * 0.20 +
        texture * 0.15 +
        defects * 0.20 +
        shape * 0.10
    )
    overall = round(min(100, max(0, overall)), 2)

    if overall >= 90:
        grade = "A+"
    elif overall >= 80:
        grade = "A"
    elif overall >= 70:
        grade = "B"
    elif overall >= 60:
        grade = "C"
    elif overall >= 50:
        grade = "D"
    else:
        grade = "F"

    shelf_life = max(1, round(overall / 14))

    return {
        "freshness_score": freshness,
        "color_score": color,
        "texture_score": texture,
        "defect_score": defects,
        "size_score": shape,
        "overall_score": overall,
        "quality_grade": grade,
        "estimated_shelf_life_days": shelf_life
    }


# =====================================================
# ROUTES
# =====================================================

@app.route("/")
def home():
    return jsonify({
        "success": True,
        "service": "MandiMart AI Vegetable Comparison API",
        "status": "running",
        "endpoints": {
            "compare": "POST /compare (form-data: image1, image2)",
            "health": "GET /health"
        }
    })


@app.route("/health", methods=["GET"])
def health_check():
    return jsonify({"status": "healthy"})


@app.route("/compare", methods=["POST"])
def compare():
    try:
        if "image1" not in request.files or "image2" not in request.files:
            return jsonify({
                "success": False,
                "message": "Please upload two images (image1 and image2)."
            }), 400

        file1 = request.files["image1"]
        file2 = request.files["image2"]

        image1 = load_image(file1)
        image2 = load_image(file2)

        vegetable1 = analyze_image(image1)
        vegetable2 = analyze_image(image2)

        score1 = vegetable1["overall_score"]
        score2 = vegetable2["overall_score"]

        if score1 > score2:
            winner, winner_name = 1, "Vegetable 1"
        elif score2 > score1:
            winner, winner_name = 2, "Vegetable 2"
        else:
            winner, winner_name = 0, "Tie"

        margin = round(abs(score1 - score2), 2)

        if winner == 1:
            recommendation = "Vegetable 1 is recommended because it has the higher overall quality score."
        elif winner == 2:
            recommendation = "Vegetable 2 is recommended because it has the higher overall quality score."
        else:
            recommendation = "Both vegetables have very similar quality scores."

        differences = []
        if vegetable1["freshness_score"] > vegetable2["freshness_score"]:
            differences.append("Vegetable 1 has better freshness.")
        elif vegetable2["freshness_score"] > vegetable1["freshness_score"]:
            differences.append("Vegetable 2 has better freshness.")

        if vegetable1["color_score"] > vegetable2["color_score"]:
            differences.append("Vegetable 1 has better color characteristics.")
        elif vegetable2["color_score"] > vegetable1["color_score"]:
            differences.append("Vegetable 2 has better color characteristics.")

        if vegetable1["defect_score"] > vegetable2["defect_score"]:
            differences.append("Vegetable 1 shows fewer visible defects.")
        elif vegetable2["defect_score"] > vegetable1["defect_score"]:
            differences.append("Vegetable 2 shows fewer visible defects.")

        if vegetable1["texture_score"] > vegetable2["texture_score"]:
            differences.append("Vegetable 1 has stronger texture/detail characteristics.")
        elif vegetable2["texture_score"] > vegetable1["texture_score"]:
            differences.append("Vegetable 2 has stronger texture/detail characteristics.")

        return jsonify({
            "success": True,
            "data": {
                "vegetable_1": vegetable1,
                "vegetable_2": vegetable2,
                "winner": winner,
                "winner_name": winner_name,
                "margin": margin,
                "recommendation": recommendation,
                "market_value": "Higher quality produce may receive a better market price.",
                "summary": {
                    "key_differences": differences,
                    "buyer_advice": recommendation
                },
                "note": "Scores are computer-vision estimates based on the uploaded images."
            }
        })

    except Exception as e:
        print("Comparison error:", str(e))
        return jsonify({
            "success": False,
            "message": "Image analysis failed: " + str(e)
        }), 500


@app.errorhandler(413)
def too_large(e):
    return jsonify({"success": False, "message": "File too large. Maximum size is 16MB."}), 413


if __name__ == "__main__":
    import os
    port = int(os.environ.get("PORT", 5000))
    print("=" * 50)
    print("MandiMart AI Vegetable Comparison API")
    print(f"Running on http://0.0.0.0:{port}")
    print("=" * 50)
    app.run(host="0.0.0.0", port=port, debug=True)

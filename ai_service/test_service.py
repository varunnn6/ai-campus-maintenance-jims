#!/usr/bin/env python3
"""
Unit and Integration Test for AI Service
Tests NLP classification, priority scoring, CV image processing, and predictive maintenance.
"""

import sys
import json
import base64
import numpy as np
from PIL import Image, ImageDraw
import io

# Import app directly to test without requiring port bind first
from app import app

client = app.test_client()

def test_ai_service():
    print(">>> Testing /health endpoint...")
    res = client.get("/health")
    assert res.status_code == 200
    data = res.get_json()
    print(f"Health response: {data['status']}, Model loaded: {data['modelLoaded']}")
    assert data["modelLoaded"] == True

    print("\n>>> Testing /api/ai/classify (NLP)...")
    test_queries = [
        ("Switchboard has burnt smell and spark visible near plug", "Electrical & Power"),
        ("Water leaking heavily from washroom sink pipe", "Plumbing & Water Supply"),
        ("Air conditioner in Computer Lab 1 not cooling properly", "HVAC & Climate Control"),
        ("Projector in Room 201 showing blurry image and red lamp error", "IT & Computer Labs"),
        ("Student bench desk leg broken and wobbling", "Civil & Furniture"),
        ("Garbage dustbins overflowing outside canteen with foul smell", "Sanitation & Hygiene"),
        ("Fire extinguisher pressure gauge needle in red recharge zone", "Fire & Safety Equipment")
    ]

    for text, expected in test_queries:
        res = client.post("/api/ai/classify", json={"text": text})
        assert res.status_code == 200
        result = res.get_json()
        print(f"Input: '{text[:40]}...' -> Predicted: '{result['category']}' (Confidence: {result['confidence']*100:.1f}%)")
        assert result["category"] == expected, f"Expected {expected}, got {result['category']}"

    print("\n>>> Testing /api/ai/priority...")
    res = client.post("/api/ai/priority", json={
        "description": "Short circuit and sparking from electrical box in exam hall",
        "category": "Electrical & Power",
        "location": {"building": "Block B", "room": "Exam Hall 1", "facilityType": "Exam"}
    })
    assert res.status_code == 200
    pri_data = res.get_json()
    print(f"Priority output: {pri_data['priority']}, Urgency Score: {pri_data['urgencyScore']}, SLA: {pri_data['slaHours']}h")
    assert pri_data["priority"] in ["Critical", "High"]

    print("\n>>> Testing /api/ai/cv-inspect with synthetic defect image...")
    # Generate synthetic image with simulated water puddle and edges
    img = Image.new("RGB", (300, 300), color=(120, 140, 160))
    draw = ImageDraw.Draw(img)
    # Draw blue puddle
    draw.ellipse([50, 100, 250, 220], fill=(40, 90, 180), outline=(20, 60, 140))
    # Draw dark shadow
    draw.rectangle([80, 210, 220, 240], fill=(20, 30, 40))

    buf = io.BytesIO()
    img.save(buf, format="JPEG")
    b64_str = base64.b64encode(buf.getvalue()).decode("utf-8")

    res = client.post("/api/ai/cv-inspect", json={"image": b64_str})
    assert res.status_code == 200
    cv_data = res.get_json()
    print(f"CV Detected: '{cv_data['detectedFault']}' (Confidence: {cv_data['confidence']*100:.1f}%)")
    print(f"Visual Features: {cv_data['visualFeatures']}")
    assert cv_data["success"] == True

    print("\n>>> Testing /api/ai/predictive-maintenance...")
    res = client.post("/api/ai/predictive-maintenance", json={
        "facilityName": "Computer Lab 2",
        "assetType": "HVAC Unit",
        "history": [
            {"date": "2026-08-10", "type": "leak"},
            {"date": "2026-09-02", "type": "cooling fail"},
            {"date": "2026-10-01", "type": "fan stopped"}
        ]
    })
    assert res.status_code == 200
    pm_data = res.get_json()
    print(f"Risk Level: {pm_data['riskLevel']}, Health Score: {pm_data['healthScore']}/100, Predicted Failure Window: {pm_data['predictedFailureWindow']}")
    print(f"Recommendation: {pm_data['recommendedPreventiveAction']}")

    print("\n========================================================")
    print("ALL AI/ML & COMPUTER VISION TESTS PASSED 100% SUCCESSFULLY!")
    print("========================================================")

if __name__ == "__main__":
    test_ai_service()

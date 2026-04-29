from pathlib import Path
import pickle

from flask import Flask, jsonify, request


BASE_DIR = Path(__file__).resolve().parent
MODEL_PATH = BASE_DIR / "criteria_model.pkl"

app = Flask(__name__)


def load_artifacts():
    with MODEL_PATH.open("rb") as model_file:
        return pickle.load(model_file)


def fallback_rules(decision_text):
    keyword_map = {
        "laptop": ["Price", "Battery", "Performance", "RAM", "Portability"],
        "smartphone": ["Price", "Camera", "Battery", "Storage", "Display"],
        "phone": ["Price", "Camera", "Battery", "Storage", "Display"],
        "car": ["Price", "Mileage", "Safety", "Maintenance", "Comfort"],
        "university": ["Ranking", "Fees", "Location", "Placement", "Faculty"],
        "job": ["Salary", "Location", "Growth", "Work-Life Balance", "Company Culture"],
        "restaurant": ["Price", "Taste", "Hygiene", "Service", "Location"],
    }

    lowered = decision_text.lower()

    for keyword, criteria in keyword_map.items():
        if keyword in lowered:
            return criteria

    return ["Price", "Quality", "Time", "Convenience", "Risk"]


@app.post("/predict")
def predict():
    payload = request.get_json(silent=True) or {}
    decision = (payload.get("decision") or "").strip()

    if not decision:
        return jsonify({"message": "Decision text is required."}), 400

    if not MODEL_PATH.exists():
        return jsonify({"criteria": fallback_rules(decision), "source": "fallback"}), 200

    artifacts = load_artifacts()
    probabilities = artifacts["pipeline"].predict_proba([decision])[0]
    labels = artifacts["label_binarizer"].classes_

    ranked = sorted(
        zip(labels, probabilities),
        key=lambda item: item[1],
        reverse=True
    )

    selected = [label for label, score in ranked[:5] if score > 0]

    if not selected:
        selected = fallback_rules(decision)

    return jsonify({"criteria": selected, "source": "model"})


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000, debug=True)

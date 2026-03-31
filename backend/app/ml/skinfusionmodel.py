import numpy as np
from typing import Dict, List

# Same disease order as skinmodel.py (alphabetical — matches CNN output)
SKIN_DISEASES = [
    "Actinic keratoses",
    "Basal cell carcinoma",
    "Benign keratosis-like lesions",
    "Dermatofibroma",
    "Melanocytic nevi",
    "Melanoma",
    "Normal",
    "Vascular lesions",
]

SEVERITY_MAP = {
    "Actinic keratoses":             "precancerous",
    "Basal cell carcinoma":          "malignant",
    "Benign keratosis-like lesions": "benign",
    "Dermatofibroma":                "benign",
    "Melanocytic nevi":              "benign",
    "Melanoma":                      "malignant",
    "Normal":                        "normal",
    "Vascular lesions":              "benign",
}

# Fusion weights
IMAGE_WEIGHT         = 0.70
QUESTIONNAIRE_WEIGHT = 0.30

# Confidence thresholds
HIGH_CONF      = 0.65
MEDIUM_HIGH    = 0.45
MEDIUM         = 0.30


def run_skin_fusion(image_prediction: Dict, questionnaire_result: Dict) -> Dict:
    """
    Fuse CNN image predictions with questionnaire ML predictions.

    Args:
        image_prediction:    output from predict_skin_from_image()
                             needs: all_predictions list [{disease, probability}]
        questionnaire_result: output from run_skin_questionnaire_pipeline()
                             needs: predictions list [{disease, probability}]

    Returns:
        Full fusion result dict
    """
    # ── Build probability arrays aligned to SKIN_DISEASES order
    img_probs   = np.zeros(len(SKIN_DISEASES), dtype=np.float32)
    quest_probs = np.zeros(len(SKIN_DISEASES), dtype=np.float32)

    for pred in image_prediction.get("all_predictions", []):
        if pred["disease"] in SKIN_DISEASES:
            idx = SKIN_DISEASES.index(pred["disease"])
            img_probs[idx] = pred["probability"]

    for pred in questionnaire_result.get("predictions", []):
        if pred["disease"] in SKIN_DISEASES:
            idx = SKIN_DISEASES.index(pred["disease"])
            quest_probs[idx] = pred["probability"]

    # ── Weighted fusion
    fused = IMAGE_WEIGHT * img_probs + QUESTIONNAIRE_WEIGHT * quest_probs

    # ── Normalize fused probs
    total = fused.sum() + 1e-8
    fused = fused / total

    # ── Primary diagnosis
    top_idx   = int(np.argmax(fused))
    top_class = SKIN_DISEASES[top_idx]
    top_prob  = float(fused[top_idx])

    # ── Confidence level
    if top_prob >= HIGH_CONF:
        confidence = "HIGH"
    elif top_prob >= MEDIUM_HIGH:
        confidence = "MEDIUM_HIGH"
    elif top_prob >= MEDIUM:
        confidence = "MEDIUM"
    else:
        confidence = "LOW"

    # ── Questionnaire role
    img_top   = max(image_prediction.get("all_predictions", []), key=lambda x: x["probability"], default={"disease": ""})
    quest_top = questionnaire_result["predictions"][0]

    if img_top["disease"] == quest_top["disease"]:
        questionnaire_role = "boost"        # both agree — higher confidence
    elif quest_top["disease"] == top_class:
        questionnaire_role = "alternative"  # questionnaire differs but influenced result
    else:
        questionnaire_role = "weak_support" # image drove the result

    # ── All fused predictions sorted
    all_fused = sorted([
        {
            "disease":   SKIN_DISEASES[i],
            "probability": float(fused[i]),
            "severity":  SEVERITY_MAP.get(SKIN_DISEASES[i], "benign"),
        }
        for i in range(len(SKIN_DISEASES))
    ], key=lambda x: x["probability"], reverse=True)

    # ── Clinical summary
    severity = SEVERITY_MAP.get(top_class, "benign")
    summary  = _generate_clinical_summary(top_class, severity, top_prob, confidence, questionnaire_role)

    return {
        "primary_diagnosis": {
            "disease":                    top_class,
            "probability":                top_prob,
            "severity":                   severity,
            "confidence":                 confidence,
            "image_contribution":         float(img_probs[top_idx]) * IMAGE_WEIGHT,
            "questionnaire_contribution": float(quest_probs[top_idx]) * QUESTIONNAIRE_WEIGHT,
        },
        "questionnaire_role":    questionnaire_role,
        "all_fused_predictions": all_fused,
        "clinical_summary":      summary,
        "model_details": {
            "image_weight":          IMAGE_WEIGHT,
            "questionnaire_weight":  QUESTIONNAIRE_WEIGHT,
            "image_top_prediction":  img_top,
            "questionnaire_top_prediction": quest_top,
        }
    }


def _generate_clinical_summary(disease: str, severity: str, prob: float, confidence: str, q_role: str) -> str:
    """Generate a human-readable clinical summary for the skin fusion result."""

    conf_text = {
        "HIGH":        "high confidence",
        "MEDIUM_HIGH": "moderate-to-high confidence",
        "MEDIUM":      "moderate confidence",
        "LOW":         "low confidence — further evaluation recommended",
    }.get(confidence, "moderate confidence")

    role_text = {
        "boost":        "The patient's reported risk factors strongly align with the image analysis, increasing diagnostic confidence.",
        "alternative":  "The patient's reported symptoms suggest a possible alternative condition. Clinical correlation is advised.",
        "weak_support": "The image analysis was the primary driver of this result. Questionnaire data provided supplementary context.",
    }.get(q_role, "")

    urgency = {
        "malignant":    "⚠ This result indicates a potentially malignant condition. Urgent referral to a dermatologist is strongly recommended.",
        "precancerous": "⚠ This result indicates a precancerous lesion. Prompt medical evaluation is advised to prevent progression.",
        "benign":       "This condition appears benign based on the analysis. Routine follow-up with a dermatologist is still recommended.",
        "normal":       "No significant skin condition was detected. Continue regular skin self-examination.",
    }.get(severity, "")

    return (
        f"The multimodal skin analysis detected {disease} with {conf_text} "
        f"({prob*100:.1f}% fused probability). {role_text} {urgency}"
    )


# ==============================
# Example Usage
# ==============================
if __name__ == "__main__":
    # Simulated CNN output
    mock_image_pred = {
        "predicted_class": "Melanoma",
        "confidence": 0.72,
        "all_predictions": [
            {"disease": "Melanoma",                      "probability": 0.72},
            {"disease": "Melanocytic nevi",              "probability": 0.10},
            {"disease": "Basal cell carcinoma",          "probability": 0.08},
            {"disease": "Actinic keratoses",             "probability": 0.04},
            {"disease": "Benign keratosis-like lesions", "probability": 0.03},
            {"disease": "Dermatofibroma",                "probability": 0.01},
            {"disease": "Vascular lesions",              "probability": 0.01},
            {"disease": "Normal",                        "probability": 0.01},
        ]
    }
    # Simulated questionnaire output
    mock_quest_result = {
        "predictions": [
            {"disease": "Melanoma",                      "probability": 0.35},
            {"disease": "Actinic keratoses",             "probability": 0.25},
            {"disease": "Basal cell carcinoma",          "probability": 0.18},
            {"disease": "Melanocytic nevi",              "probability": 0.10},
            {"disease": "Benign keratosis-like lesions", "probability": 0.06},
            {"disease": "Dermatofibroma",                "probability": 0.03},
            {"disease": "Vascular lesions",              "probability": 0.02},
            {"disease": "Normal",                        "probability": 0.01},
        ]
    }

    result = run_skin_fusion(mock_image_pred, mock_quest_result)
    print("\n=== SKIN FUSION RESULT ===")
    pd = result["primary_diagnosis"]
    print(f"Condition   : {pd['disease']}")
    print(f"Severity    : {pd['severity'].upper()}")
    print(f"Probability : {pd['probability']*100:.1f}%")
    print(f"Confidence  : {pd['confidence']}")
    print(f"Q-Role      : {result['questionnaire_role']}")
    print(f"\nSummary: {result['clinical_summary']}")
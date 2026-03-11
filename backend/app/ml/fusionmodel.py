import numpy as np
from typing import Dict, List

# ==============================
# FUSION MODEL CONFIGURATION
# ==============================
IMAGE_WEIGHT = 0.7
QUESTIONNAIRE_WEIGHT = 0.3

BOOST_THRESHOLD = 0.15
ALTERNATIVE_THRESHOLD = 0.20

STRONG_IMAGE_THRESHOLD = 0.90  # 🔑 key fix


# ==============================
# FUSION PREDICTION ENGINE
# ==============================
def fuse_predictions(
    image_predictions: List[Dict],
    questionnaire_predictions: List[Dict]
) -> Dict:

    img_probs = {p["disease"]: p["probability"] for p in image_predictions}
    quest_probs = {p["disease"]: p["probability"] for p in questionnaire_predictions}

    all_diseases = set(img_probs.keys()) | set(quest_probs.keys())
    fused_probs = {}

    for disease in all_diseases:
        img_prob = img_probs.get(disease, 0.0)
        quest_prob = quest_probs.get(disease, 0.0)

        # 🔥 FIX: Strong image evidence should NOT be penalized
        if img_prob >= STRONG_IMAGE_THRESHOLD:
            fused_probs[disease] = img_prob
        else:
            fused_probs[disease] = (
                IMAGE_WEIGHT * img_prob +
                QUESTIONNAIRE_WEIGHT * quest_prob
            )

    fused_predictions = sorted(
        [{"disease": d, "probability": float(p)} for d, p in fused_probs.items()],
        key=lambda x: x["probability"],
        reverse=True
    )

    primary = fused_predictions[0]
    primary_disease = primary["disease"]
    primary_prob = primary["probability"]

    image_top = image_predictions[0]["disease"]
    image_top_prob = image_predictions[0]["probability"]

    quest_top = questionnaire_predictions[0]["disease"]
    quest_top_prob = questionnaire_predictions[0]["probability"]

    quest_support_for_primary = quest_probs.get(primary_disease, 0.0)

    questionnaire_role = "weak_support"
    alternative_diagnosis = None

    # BOOST
    if primary_disease == image_top and quest_support_for_primary > BOOST_THRESHOLD:
        questionnaire_role = "boost"

    # ALTERNATIVE
    elif quest_top != image_top and quest_top_prob > ALTERNATIVE_THRESHOLD:
        questionnaire_role = "alternative"
        alternative_diagnosis = {
            "disease": quest_top,
            "probability": float(quest_top_prob),
            "lifestyle_factors": _get_lifestyle_support(
                quest_top, questionnaire_predictions
            )
        }

    confidence = _assess_confidence(
        primary_prob,
        image_top_prob,
        quest_support_for_primary,
        questionnaire_role
    )

    return {
        "primary_diagnosis": {
            "disease": primary_disease,
            "probability": float(primary_prob),
            "image_contribution": float(img_probs.get(primary_disease, 0.0)),
            "questionnaire_contribution": float(quest_support_for_primary),
            "confidence": confidence
        },
        "questionnaire_role": questionnaire_role,
        "alternative_diagnosis": alternative_diagnosis,
        "model_details": {
            "image_top_prediction": {
                "disease": image_top,
                "probability": float(image_top_prob)
            },
            "questionnaire_top_prediction": {
                "disease": quest_top,
                "probability": float(quest_top_prob)
            },
            "fusion_weights": {
                "image": IMAGE_WEIGHT,
                "questionnaire": QUESTIONNAIRE_WEIGHT
            }
        },
        "all_fused_predictions": fused_predictions[:5]
    }


# ==============================
# SUPPORT FUNCTIONS
# ==============================
def _get_lifestyle_support(disease: str, quest_predictions: List[Dict]) -> str:
    lifestyle_factors = {
        "Telogen Effluvium": "High stress and sleep or nutritional imbalance",
        "Alopecia Areata": "Stress and autoimmune history",
        "Male Pattern Baldness": "Family history of hair loss",
        "Seborrheic Dermatitis": "Dandruff and oily scalp",
        "Psoriasis": "Redness, itching, scaling",
        "Contact Dermatitis": "Chemical exposure or hair products",
        "Folliculitis": "Scalp hygiene and inflammation",
        "Tinea Capitis": "Itching and dandruff-like flakes",
        "Head Lice": "Severe itching"
    }
    return lifestyle_factors.get(disease, "Lifestyle and symptom indicators")


def _assess_confidence(
    primary_prob: float,
    image_prob: float,
    quest_support: float,
    quest_role: str
) -> str:

    if image_prob >= 0.9:
        return "HIGH"

    if image_prob > 0.7 and quest_role == "boost":
        return "HIGH"

    if image_prob > 0.6:
        return "MEDIUM_HIGH"

    if image_prob > 0.5:
        return "MEDIUM"

    return "LOW"


def generate_clinical_summary(result: Dict) -> str:
    primary = result["primary_diagnosis"]
    role = result["questionnaire_role"]
    alternative = result["alternative_diagnosis"]

    summary = (
        f"Primary Diagnosis: {primary['disease']} "
        f"(Confidence: {primary['confidence']})\n"
        f"Based on {IMAGE_WEIGHT:.0%} image analysis and "
        f"{QUESTIONNAIRE_WEIGHT:.0%} lifestyle assessment.\n\n"
    )

    if role == "boost":
        summary += "✓ Lifestyle factors SUPPORT the image-based diagnosis.\n"
    elif role == "alternative":
        summary += (
            f"⚠ Lifestyle factors suggest alternative: "
            f"{alternative['disease']}.\n"
            f"Reason: {alternative['lifestyle_factors']}\n"
        )
    else:
        summary += (
            "○ Lifestyle factors provide weak additional information.\n"
            "  Diagnosis primarily based on visual analysis.\n"
        )

    summary += "\nRecommendation: Consult a dermatologist for confirmation."

    return summary


# ==============================
# MAIN INTEGRATION FUNCTION
# ==============================
def run_fusion(image_result: Dict, questionnaire_result: Dict) -> Dict:

    image_preds = image_result["all_predictions"]
    quest_preds = questionnaire_result["predictions"]

    fusion_result = fuse_predictions(image_preds, quest_preds)
    fusion_result["clinical_summary"] = generate_clinical_summary(fusion_result)

    fusion_result["metadata"] = {
        "image_model_confidence": float(image_result["confidence"]),
        "questionnaire_vector": questionnaire_result["encoded_vector"]
    }

    return fusion_result

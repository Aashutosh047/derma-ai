import numpy as np
from typing import Dict, List, Tuple

# ==============================
# Disease Labels (HAM10000 + Normal)
# ==============================
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

# ==============================
# Encoding Maps
# ==============================
SUN_EXPOSURE_MAP   = {"low": 0, "moderate": 1, "high": 2}
FAMILY_HISTORY_MAP = {"no": 0, "yes": 1}
SKIN_TONE_MAP      = {"dark": 0, "medium": 1, "fair": 2, "very_fair": 3}
AGE_GROUP_MAP      = {"under_30": 0, "30_to_50": 1, "above_50": 2}
LESION_CHANGE_MAP  = {"no": 0, "yes": 1}
ITCHING_BLEEDING_MAP = {"no": 0, "yes": 1}
MOLE_COUNT_MAP     = {"few": 0, "moderate": 1, "many": 2}
SUNBURN_MAP        = {"no": 0, "yes": 1}
CHEMICAL_MAP       = {"no": 0, "yes": 1}
SKIN_INJURY_MAP    = {"no": 0, "yes": 1}
DURATION_MAP       = {"recent": 0, "months": 1, "years": 2}

# ==============================
# Feature Vector Structure (11 features)
# ==============================
# Index 0:  sun_exposure       (0-2)  low/moderate/high
# Index 1:  family_history     (0-1)  no/yes
# Index 2:  skin_tone          (0-3)  dark/medium/fair/very_fair
# Index 3:  age_group          (0-2)  under_30/30_to_50/above_50
# Index 4:  lesion_change      (0-1)  no/yes (size, color, shape change)
# Index 5:  itching_bleeding   (0-1)  no/yes
# Index 6:  mole_count         (0-2)  few/moderate/many
# Index 7:  sunburn_history    (0-1)  no/yes
# Index 8:  chemical_exposure  (0-1)  no/yes (chemicals, radiation)
# Index 9:  skin_injury        (0-1)  no/yes (trauma at lesion site)
# Index 10: lesion_duration    (0-2)  recent/months/years

# ==============================
# Disease Contribution Matrix (Research-Based)
# 8 diseases x 11 features
# ==============================
# Rows   = skin diseases (alphabetical, matches CNN class order)
# Cols   = features [sun, family, skin_tone, age, lesion_change,
#                    itching_bleed, mole_count, sunburn, chemical,
#                    skin_injury, duration]
# Values = weight of feature's contribution to that disease

SKIN_DISEASE_CONTRIBUTIONS = np.array([
    # sun  fam  tone  age  chng  itch  mole  burn  chem  injr  dur
    [3.0, 0.5, 2.5, 2.5, 1.5, 1.0, 0.5, 3.0, 1.0, 0.0, 2.0],  # Actinic keratoses    (sun, age, sunburn)
    [2.5, 1.5, 2.0, 2.0, 2.0, 1.0, 0.5, 2.5, 1.5, 0.5, 1.5],  # Basal cell carcinoma (sun, age, family)
    [1.0, 1.0, 1.0, 2.0, 1.0, 0.5, 1.5, 1.0, 0.5, 0.5, 2.5],  # Benign keratosis     (age, duration, moles)
    [0.5, 0.0, 0.5, 1.0, 0.5, 1.5, 0.5, 0.0, 0.5, 3.0, 2.0],  # Dermatofibroma       (skin injury, duration)
    [1.5, 2.0, 1.5, 1.0, 1.0, 0.5, 3.0, 1.5, 0.0, 0.5, 1.5],  # Melanocytic nevi     (family, mole count)
    [3.0, 2.5, 3.0, 1.5, 3.0, 2.0, 2.5, 3.0, 1.0, 0.5, 1.5],  # Melanoma             (sun, family, tone, change)
    [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0],  # Normal               (no risk factors)
    [0.5, 0.0, 0.5, 1.0, 0.5, 1.5, 0.0, 0.5, 0.5, 2.5, 1.5],  # Vascular lesions     (injury, itching)
], dtype=np.float32)

# ==============================
# Formatting Layer (Frontend → ML)
# ==============================
def format_skin_questionnaire(raw_q: Dict) -> Dict:
    """
    Convert frontend skin questionnaire to ML-ready format.

    Expected input keys:
    - sunExposure:        "low" | "moderate" | "high"
    - familyHistorySkin:  "no"  | "yes"
    - skinTone:           "dark" | "medium" | "fair" | "very_fair"
    - ageGroup:           "under_30" | "30_to_50" | "above_50"
    - lesionChange:       true | false
    - itchingBleeding:    true | false
    - moleCount:          "few" | "moderate" | "many"
    - sunburnHistory:     true | false
    - chemicalExposure:   true | false
    - skinInjury:         true | false
    - lesionDuration:     "recent" | "months" | "years"
    """
    return {
        "sun_exposure":      raw_q["sunExposure"].lower(),
        "family_history":    raw_q["familyHistorySkin"].lower(),
        "skin_tone":         raw_q["skinTone"].lower(),
        "age_group":         raw_q["ageGroup"].lower(),
        "lesion_change":     raw_q["lesionChange"],
        "itching_bleeding":  raw_q["itchingBleeding"],
        "mole_count":        raw_q["moleCount"].lower(),
        "sunburn_history":   raw_q["sunburnHistory"],
        "chemical_exposure": raw_q["chemicalExposure"],
        "skin_injury":       raw_q["skinInjury"],
        "lesion_duration":   raw_q["lesionDuration"].lower(),
    }

# ==============================
# Encoding Layer
# ==============================
def encode_skin_questionnaire(data: Dict) -> np.ndarray:
    """
    Convert formatted skin questionnaire to feature vector.
    Returns: np.ndarray of shape (11,)
    """
    vector = [
        SUN_EXPOSURE_MAP[data["sun_exposure"]],
        FAMILY_HISTORY_MAP[data["family_history"]],
        SKIN_TONE_MAP[data["skin_tone"]],
        AGE_GROUP_MAP[data["age_group"]],
        int(data["lesion_change"]),
        int(data["itching_bleeding"]),
        MOLE_COUNT_MAP[data["mole_count"]],
        int(data["sunburn_history"]),
        int(data["chemical_exposure"]),
        int(data["skin_injury"]),
        DURATION_MAP[data["lesion_duration"]],
    ]
    return np.array(vector, dtype=np.float32)

# ==============================
# Prediction Layer
# ==============================
def predict_skin_from_vector(vector: np.ndarray) -> List[Tuple[str, float]]:
    """
    Calculate skin disease probabilities from feature vector.
    Returns: List of (disease_name, probability) sorted by probability desc.
    """
    raw_scores = SKIN_DISEASE_CONTRIBUTIONS @ vector

    # Softmax-style normalization
    total = raw_scores.sum() + 1e-8
    probs = raw_scores / total

    return sorted(zip(SKIN_DISEASES, probs), key=lambda x: x[1], reverse=True)

# ==============================
# MAIN PIPELINE (CALLED BY FASTAPI)
# ==============================
def run_skin_questionnaire_pipeline(raw_questionnaire: Dict) -> Dict:
    """
    Full pipeline from raw frontend questionnaire to predictions.

    Returns:
        - formatted:       processed questionnaire dict
        - encoded_vector:  feature vector as list
        - predictions:     list of {disease, probability} dicts
    """
    formatted = format_skin_questionnaire(raw_questionnaire)
    vector    = encode_skin_questionnaire(formatted)
    results   = predict_skin_from_vector(vector)

    print("\n[SKIN ML] Formatted Questionnaire:")
    print(formatted)
    print("\n[SKIN ML] Encoded Feature Vector:")
    print(vector)
    print("\n[SKIN ML] Disease Predictions:")
    for disease, prob in results:
        print(f"  {disease}: {prob:.3f}")

    return {
        "formatted":      formatted,
        "encoded_vector": vector.tolist(),
        "predictions": [
            {"disease": d, "probability": float(p)}
            for d, p in results
        ]
    }

# ==============================
# Example Usage
# ==============================
if __name__ == "__main__":
    sample = {
        "sunExposure":       "high",
        "familyHistorySkin": "yes",
        "skinTone":          "fair",
        "ageGroup":          "above_50",
        "lesionChange":      True,
        "itchingBleeding":   True,
        "moleCount":         "many",
        "sunburnHistory":    True,
        "chemicalExposure":  False,
        "skinInjury":        False,
        "lesionDuration":    "months",
    }
    results = run_skin_questionnaire_pipeline(sample)
    print("\nTop 3 Predictions:")
    for pred in results["predictions"][:3]:
        print(f"  {pred['disease']}: {pred['probability']:.1%}")
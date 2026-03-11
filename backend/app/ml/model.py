import numpy as np
from typing import Dict, List, Tuple

# ==============================
# Disease Labels (Updated)
# ==============================
DISEASES = [
    "Alopecia Areata",
    "Contact Dermatitis",
    "Folliculitis",
    "Head Lice",
    "Lichen Planus",
    "Male Pattern Baldness",
    "Psoriasis",
    "Seborrheic Dermatitis",
    "Telogen Effluvium",
    "Tinea Capitis"
]

# ==============================
# Encoding Maps
# ==============================
HAIR_FALL_MAP = {"low": 0, "medium": 1, "high": 2}
YES_NO_MAP = {"no": 0, "yes": 1}
STRESS_MAP = {"low": 0, "moderate": 1, "high": 2}
DIET_MAP = {"poor": 0, "average": 1, "good": 2, "excellent": 3}
SLEEP_MAP = {"less_than_5": 0, "5_to_7": 1, "7_to_9": 2, "more_than_9": 3}
WASH_FREQ_MAP = {
    "weekly": 0,
    "twice_weekly": 1,
    "every_other_day": 2,
    "daily": 3
}

# ==============================
# Feature Vector Structure (11 features)
# ==============================
# Index 0: hair_fall (0-2)
# Index 1: family_history (0-1)
# Index 2: stress (0-2)
# Index 3: diet (0-3)
# Index 4: sleep (0-3)
# Index 5: scalp_itching (0-1)
# Index 6: scalp_dandruff (0-1)
# Index 7: scalp_redness (0-1)
# Index 8: wash_frequency (0-3)
# Index 9: heat_styling (0-1)
# Index 10: chemical_treatment (0-1)

# ==============================
# Disease Contribution Matrix (Research-Based)
# ==============================
# Each row = one disease
# Each column = one feature's contribution weight
DISEASE_CONTRIBUTIONS = np.array([
    # hair_fall, family, stress, diet, sleep, itching, dandruff, redness, wash_freq, heat, chemical
    [2.0, 1.0, 2.5, 1.0, 1.0, 0.5, 0.0, 0.5, 0.0, 0.0, 0.0],  # Alopecia Areata (autoimmune, stress-triggered)
    [0.5, 0.0, 1.0, 0.5, 0.5, 2.5, 0.5, 3.0, 1.5, 2.0, 3.0],  # Contact Dermatitis (chemical/product reaction)
    [0.5, 0.0, 0.5, 1.0, 1.0, 3.0, 0.5, 2.5, 2.5, 1.5, 1.0],  # Folliculitis (bacterial, hygiene-related)
    [0.0, 0.0, 0.0, 0.5, 0.5, 3.5, 0.5, 1.0, 0.5, 0.0, 0.0],  # Head Lice (itching primary symptom)
    [1.5, 0.5, 1.5, 1.0, 1.0, 2.0, 0.0, 2.0, 0.5, 0.5, 1.0],  # Lichen Planus (inflammatory)
    [2.5, 3.0, 1.0, 1.5, 1.0, 0.0, 0.0, 0.0, 0.0, 0.5, 1.0],  # Male Pattern Baldness (genetic, progressive)
    [1.0, 1.5, 2.0, 1.5, 1.5, 2.5, 3.5, 3.0, 1.0, 0.5, 0.5],  # Psoriasis (chronic inflammatory, stress)
    [0.5, 0.5, 1.5, 1.5, 1.0, 2.0, 3.5, 2.0, 2.0, 1.0, 1.0],  # Seborrheic Dermatitis (dandruff, oily scalp)
    [3.0, 0.5, 3.0, 2.5, 2.5, 0.5, 0.5, 0.0, 0.5, 1.5, 1.5],  # Telogen Effluvium (stress, diet, shedding)
    [1.0, 0.0, 0.5, 1.5, 1.0, 2.5, 3.0, 2.0, 1.5, 0.5, 0.5],  # Tinea Capitis (fungal, dandruff-like)
], dtype=np.float32)

# ==============================
# Formatting Layer (Backend → ML)
# ==============================
def format_questionnaire_for_model(raw_q: Dict) -> Dict:
    """
    Convert backend questionnaire format to ML-ready format.
    
    Expected input keys:
    - hairFallSeverity: "Low", "Medium", "High"
    - familyHistory: "No", "Yes"
    - stressLevel: "Low", "Moderate", "High"
    - dietQuality: "Poor", "Average", "Good", "Excellent"
    - sleepDuration: "<5", "5_to_7", "7_to_9", ">9"
    - hairWashFrequency: "Once a week", "Twice a week", "Every other day", "Daily"
    - useHeatStyling: true/false
    - useChemicalTreatments: true/false
    - scalpItching: true/false
    - scalpDandruff: true/false
    - scalpRedness: true/false
    """
    return {
        "hair_fall": raw_q["hairFallSeverity"].lower(),
        "family_history": raw_q["familyHistory"].lower(),
        "stress": raw_q["stressLevel"].lower(),
        "diet": raw_q["dietQuality"].lower(),
        "sleep": raw_q["sleepDuration"].lower(),
        "wash_frequency": raw_q["hairWashFrequency"].lower(),
        "heat_styling": raw_q["useHeatStyling"],
        "chemical_treatment": raw_q["useChemicalTreatments"],
        "scalp_issues": [
            issue for issue, present in {
                "itching": raw_q["scalpItching"],
                "dandruff": raw_q["scalpDandruff"],
                "redness": raw_q["scalpRedness"]
            }.items() if present
        ]
    }

# ==============================
# Encoding Layer
# ==============================
def encode_questionnaire(data: Dict) -> np.ndarray:
    """
    Convert formatted questionnaire to feature vector.
    
    Returns: np.ndarray of shape (11,) with normalized features
    """
    vector = []

    # Feature 0: Hair fall severity (0-2)
    vector.append(HAIR_FALL_MAP[data["hair_fall"]])
    
    # Feature 1: Family history (0-1)
    vector.append(YES_NO_MAP[data["family_history"]])
    
    # Feature 2: Stress level (0-2)
    vector.append(STRESS_MAP[data["stress"]])
    
    # Feature 3: Diet quality (0-3)
    vector.append(DIET_MAP[data["diet"]])
    
    # Feature 4: Sleep duration (0-3)
    vector.append(SLEEP_MAP[data["sleep"]])

    # Features 5-7: Scalp symptoms (0-1 each)
    scalp = set(data["scalp_issues"])
    vector.append(1 if "itching" in scalp else 0)
    vector.append(1 if "dandruff" in scalp else 0)
    vector.append(1 if "redness" in scalp else 0)

    # Feature 8: Wash frequency (0-3)
    vector.append(WASH_FREQ_MAP[data["wash_frequency"]])
    
    # Feature 9: Heat styling (0-1)
    vector.append(int(data["heat_styling"]))
    
    # Feature 10: Chemical treatment (0-1)
    vector.append(int(data["chemical_treatment"]))

    return np.array(vector, dtype=np.float32)

# ==============================
# Prediction Layer
# ==============================
def predict_from_vector(vector: np.ndarray) -> List[Tuple[str, float]]:
    """
    Calculate disease probabilities from feature vector.
    
    Args:
        vector: Feature vector of shape (11,)
        
    Returns:
        List of (disease_name, probability) tuples, sorted by probability
    """
    # Calculate raw scores via matrix multiplication
    raw_scores = DISEASE_CONTRIBUTIONS @ vector
    
    # Convert to probabilities (softmax-like normalization)
    probs = raw_scores / (raw_scores.sum() + 1e-8)
    
    # Sort by probability (highest first)
    results = sorted(
        zip(DISEASES, probs),
        key=lambda x: x[1],
        reverse=True
    )

    return results

# ==============================
# MAIN PIPELINE (CALLED BY FASTAPI)
# ==============================
def run_ml_pipeline(raw_questionnaire: Dict):
    """
    Complete ML pipeline from raw questionnaire to predictions.
    
    Args:
        raw_questionnaire: Dict with backend format questionnaire data
        
    Returns:
        Dict containing:
            - formatted: Processed questionnaire
            - encoded_vector: Feature vector as list
            - predictions: List of {disease, probability} dicts
    """
    # Step 1: Format the questionnaire
    formatted = format_questionnaire_for_model(raw_questionnaire)
    
    # Step 2: Encode to feature vector
    vector = encode_questionnaire(formatted)
    
    # Step 3: Generate predictions
    predictions = predict_from_vector(vector)

    # Debug output
    print("\n[ML] Formatted Questionnaire:")
    print(formatted)

    print("\n[ML] Encoded Feature Vector:")
    print(vector)

    print("\n[ML] Disease Predictions:")
    for disease, prob in predictions:
        print(f"{disease}: {prob:.3f}")

    return {
        "formatted": formatted,
        "encoded_vector": vector.tolist(),
        "predictions": [
            {"disease": d, "probability": float(p)}
            for d, p in predictions
        ]
    }

# ==============================
# Example Usage
# ==============================
if __name__ == "__main__":
    # Example questionnaire
    sample_questionnaire = {
        "hairFallSeverity": "High",
        "familyHistory": "Yes",
        "stressLevel": "High",
        "dietQuality": "Poor",
        "sleepDuration": "<5",
        "hairWashFrequency": "Once a week",
        "useHeatStyling": False,
        "useChemicalTreatments": False,
        "scalpItching": True,
        "scalpDandruff": True,
        "scalpRedness": False
    }
    
    results = run_ml_pipeline(sample_questionnaire)
    
    print("\n[RESULTS] Top 3 Predictions:")
    for pred in results["predictions"][:3]:
        print(f"  {pred['disease']}: {pred['probability']:.1%}")
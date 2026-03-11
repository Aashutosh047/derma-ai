

"""questionaire section"""

import numpy as np
from typing import Dict, List

QUESTIONS = {
    "hair_fall": {
        "question": "How would you rate your hair fall severity?",
        "options": ["Low", "Medium", "High"]
    },
    "family_history": {
        "question": "Do you have a family history of hair loss?",
        "options": ["No", "Yes"]
    },
    "stress": {
        "question": "What is your current stress level?",
        "options": ["Low", "Moderate", "High"]
    },
    "diet": {
        "question": "How would you rate your diet quality?",
        "options": ["Poor", "Average", "Good", "Excellent"]
    },
    "sleep": {
        "question": "How many hours do you sleep on average?",
        "options": ["<5", "5-7", "7-9", ">9"]
    },
    "wash_frequency": {
        "question": "How often do you wash your hair?",
        "options": ["Once a week", "Twice a week", "Every other day", "Daily"]
    },
    "heat_styling": {
        "question": "Do you use heat styling tools regularly?",
        "options": ["No", "Yes"]
    },
    "chemical_treatment": {
        "question": "Do you use chemical treatments (coloring, perms)?",
        "options": ["No", "Yes"]
    },
    "scalp_issues": {
        "question": "Do you experience any scalp issues?",
        "options": ["Itching", "Dandruff", "Redness"]
    }
}

HAIR_FALL_MAP = {"Low": 0, "Medium": 1, "High": 2}
YES_NO_MAP = {"No": 0, "Yes": 1}
STRESS_MAP = {"Low": 0, "Moderate": 1, "High": 2}
DIET_MAP = {"Poor": 0, "Average": 1, "Good": 2, "Excellent": 3}
SLEEP_MAP = {"<5": 0, "5-7": 1, "7-9": 2, ">9": 3}
WASH_FREQ_MAP = {
    "Once a week": 0,
    "Twice a week": 1,
    "Every other day": 2,
    "Daily": 3
}

SCALP_ISSUES = ["itching", "dandruff", "redness"]

FEATURE_ORDER = [
    "hair_fall",
    "family_history",
    "stress",
    "diet",
    "sleep",
    "itching",
    "dandruff",
    "redness",
    "wash_frequency",
    "heat_styling",
    "chemical_treatment"
]

def encode_questionnaire(data: Dict) -> np.ndarray:
    vector = []

    vector.append(HAIR_FALL_MAP[data["hair_fall"]])
    vector.append(YES_NO_MAP[data["family_history"]])
    vector.append(STRESS_MAP[data["stress"]])
    vector.append(DIET_MAP[data["diet"]])
    vector.append(SLEEP_MAP[data["sleep"]])

    scalp = set(s.lower() for s in data["scalp_issues"])
    vector.append(1 if "itching" in scalp else 0)
    vector.append(1 if "dandruff" in scalp else 0)
    vector.append(1 if "redness" in scalp else 0)

    vector.append(WASH_FREQ_MAP[data["wash_frequency"]])
    vector.append(int(data["heat_styling"]))
    vector.append(int(data["chemical_treatment"]))

    return np.array(vector, dtype=np.float32)

DISEASES = [
    "Androgenetic Alopecia",
    "Telogen Effluvium",
    "Seborrheic Dermatitis",
    "Alopecia Areata",
    "Tinea Capitis",
    "Trichotillomania",
    "Diffuse Hair Loss",
    "Hair Shaft Disorder",
    "Other"
]

DISEASE_CONTRIBUTIONS = np.array([
    [2, 2, 0, 1, 0, 0, 0, 0, 0, 0, 0],  # Androgenetic Alopecia
    [2, 0, 2, 2, 1, 0, 0, 0, 0, 0, 0],  # Telogen Effluvium
    [1, 0, 0, 1, 0, 0, 2, 2, 1, 1, 0],  # Seb Derm
    [1, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0],  # Alopecia Areata
    [1, 0, 0, 0, 0, 0, 2, 2, 1, 0, 0],  # Tinea
    [1, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0],  # Trichotillomania
    [2, 0, 1, 2, 1, 0, 0, 0, 0, 0, 0],  # Diffuse
    [1, 0, 0, 1, 0, 0, 0, 0, 0, 2, 1],  # Shaft disorder
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],  # Other
], dtype=np.float32)

def predict_from_questionnaire(vector: np.ndarray):
    raw_scores = DISEASE_CONTRIBUTIONS @ vector
    probs = raw_scores / (raw_scores.sum() + 1e-8)

    results = sorted(
        zip(DISEASES, probs),
        key=lambda x: x[1],
        reverse=True
    )

    return results

def mock_frontend_input():
    return {
        "hair_fall": "High",
        "family_history": "Yes",
        "stress": "Moderate",
        "diet": "Average",
        "sleep": "5-7",
        "wash_frequency": "Every other day",
        "heat_styling": True,
        "chemical_treatment": False,
        "scalp_issues": ["Itching", "Dandruff"]
    }

if __name__ == "__main__":
    user_input = mock_frontend_input()
    vector = encode_questionnaire(user_input)

    print("Encoded Questionnaire Vector:")
    print(vector)

    print("\nDisease Likelihoods:")
    predictions = predict_from_questionnaire(vector)

    for disease, score in predictions:
        print(f"{disease}: {score:.2f}")

"""final output"""
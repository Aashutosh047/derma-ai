from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import sys
from pathlib import Path
from pprint import pprint

# ------------------------------------------------------------------
# Fix import path
# ------------------------------------------------------------------
sys.path.append(str(Path(__file__).parent.parent))

from app.ml.model import run_ml_pipeline
from app.ml.imagemodel import predict_from_image
from app.ml.fusionmodel import run_fusion
def predict_skin_from_image(image_bytes):
    from app.ml.skinmodel import predict_skin_from_image as _predict
    return _predict(image_bytes)



# ------------------------------------------------------------------
# FastAPI app
# ------------------------------------------------------------------
app = FastAPI(
    title="DermAI API",
    description="AI-powered skin and hair health assessment API",
    version="3.0",
)

# ------------------------------------------------------------------
# CORS
# ------------------------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ------------------------------------------------------------------
# In-memory storage
# ------------------------------------------------------------------
user_data_store = []
questionnaire_store = []
image_predictions_store = []
fusion_results_store = []
skin_predictions_store = []

# ------------------------------------------------------------------
# Pydantic models
# ------------------------------------------------------------------
class UserDetails(BaseModel):
    name: str
    email: str
    age: int
    gender: str


class Questionnaire(BaseModel):
    hairFallSeverity: str
    familyHistory: str
    stressLevel: str
    dietQuality: str
    sleepDuration: str
    scalpItching: bool
    scalpDandruff: bool
    scalpRedness: bool
    hairWashFrequency: str
    useHeatStyling: bool
    useChemicalTreatments: bool


# ------------------------------------------------------------------
# Helper: Print formatted fusion report
# ------------------------------------------------------------------
def print_fusion_report(fusion_result: dict):
    primary = fusion_result["primary_diagnosis"]

    print("\n" + "=" * 72)
    print(" " * 20 + "HAIR HEALTH DIAGNOSTIC REPORT")
    print("=" * 72)

    print("\nPRIMARY DIAGNOSIS")
    print("-" * 18)
    print(f"Condition              : {primary['disease']}")
    print(f"Final Probability      : {primary['probability'] * 100:.2f}%")
    print(f"Confidence Level       : {primary['confidence']}")

    print("\nMODEL CONTRIBUTION")
    print("-" * 18)
    print(f"Image Analysis (CNN)   : {primary['image_contribution'] * 100:.2f}%")
    print(f"Lifestyle Assessment  : {primary['questionnaire_contribution'] * 100:.2f}%")
    print("Fusion Weighting       : 70% Image / 30% Questionnaire")

    print("\nQUESTIONNAIRE INSIGHT")
    print("-" * 20)
    print(f"Role of Questionnaire  : {fusion_result['questionnaire_role']}")

    quest_top = fusion_result["model_details"]["questionnaire_top_prediction"]
    print(
        f"Top Lifestyle Indicator: "
        f"{quest_top['disease']} ({quest_top['probability'] * 100:.2f}%)"
    )

    print("\nFUSED RISK RANKING")
    print("-" * 18)
    for i, pred in enumerate(fusion_result["all_fused_predictions"], start=1):
        print(f"{i}. {pred['disease']:<25} : {pred['probability'] * 100:.2f}%")

    print("\nCLINICAL SUMMARY")
    print("-" * 18)
    print(fusion_result["clinical_summary"])

    print("\nRECOMMENDATION")
    print("-" * 18)
    print("Consult a dermatologist for confirmation and treatment planning.")

    print("\n" + "=" * 72 + "\n")


def print_skin_report(result: dict):
    print("\n" + "=" * 72)
    print(" " * 22 + "SKIN DIAGNOSTIC REPORT")
    print("=" * 72)
    print(f"\nPredicted Condition : {result['predicted_class']}")
    print(f"Severity            : {result['severity'].upper()}")
    print(f"Confidence          : {result['confidence'] * 100:.2f}%")
    print("\nTOP PREDICTIONS")
    print("-" * 18)
    for i, pred in enumerate(result["all_predictions"][:5], start=1):
        print(f"{i}. {pred['disease']:<35} : {pred['probability'] * 100:.2f}%  [{pred['severity']}]")
    print("\n" + "=" * 72 + "\n")


# ------------------------------------------------------------------
# Routes — Root
# ------------------------------------------------------------------
@app.get("/")
def root():
    return {
        "message": "DermAI API running",
        "hair_model": "Active (70% Image + 30% Questionnaire Fusion)",
        "skin_model": "Active (HAM10000 CNN — 8 classes)",
        "version": "3.0",
    }


# ------------------------------------------------------------------
# Routes — Hair Assessment
# ------------------------------------------------------------------
@app.post("/user-details")
def receive_user_details(user: UserDetails):
    user_data_store.append(user.dict())
    print("\n[/user-details] Received user data:")
    pprint(user.dict())
    return {"status": "success"}


@app.post("/questionnaire")
def receive_questionnaire(q: Questionnaire):
    raw_q = q.dict()
    questionnaire_store.append(raw_q)

    print("\n[/questionnaire] Received questionnaire:")
    pprint(raw_q)

    ml_result = run_ml_pipeline(raw_q)

    print("\n========== QUESTIONNAIRE ML RESULT ==========")
    for pred in ml_result["predictions"][:3]:
        print(f"{pred['disease']}: {pred['probability']:.2%}")
    print("=" * 45)

    return {
        "status": "success",
        "ml_result": ml_result,
    }


@app.post("/upload-image")
async def upload_image(image: UploadFile = File(...)):
    print(f"\n[/upload-image] Received hair image: {image.filename}")

    try:
        image_bytes = await image.read()
        prediction_result = predict_from_image(image_bytes)

        image_predictions_store.append(prediction_result)

        print("\n========== HAIR IMAGE CNN RESULT ==========")
        print(f"Predicted: {prediction_result['predicted_class']}")
        print(f"Confidence: {prediction_result['confidence']:.2%}")
        print("=" * 40)

        return {
            "status": "success",
            "predicted_class": prediction_result["predicted_class"],
            "predicted_probability": prediction_result["confidence"],
            "all_class_probabilities": [
                pred["probability"] for pred in prediction_result["all_predictions"]
            ],
            "all_predictions": prediction_result["all_predictions"],
            "prediction": prediction_result,
        }

    except Exception as e:
        print("Hair image processing error:", str(e))
        import traceback
        traceback.print_exc()
        return {"status": "error", "message": str(e)}


@app.get("/get-diagnosis")
def get_final_diagnosis():
    if not questionnaire_store:
        return {"status": "error", "message": "No questionnaire data available"}

    if not image_predictions_store:
        return {"status": "error", "message": "No image data available"}

    try:
        latest_questionnaire = questionnaire_store[-1]
        latest_image = image_predictions_store[-1]

        questionnaire_result = run_ml_pipeline(latest_questionnaire)
        fusion_result = run_fusion(latest_image, questionnaire_result)

        fusion_results_store.append(fusion_result)
        print_fusion_report(fusion_result)

        return {
            "status": "success",
            "fusion_result": fusion_result,
        }

    except Exception as e:
        import traceback
        traceback.print_exc()
        return {"status": "error", "message": str(e)}


@app.get("/latest-diagnosis")
def get_latest_diagnosis():
    if not fusion_results_store:
        return {"status": "error", "message": "No diagnosis available"}
    return {
        "status": "success",
        "diagnosis": fusion_results_store[-1],
    }


# ------------------------------------------------------------------
# Routes — Skin Assessment
# ------------------------------------------------------------------
@app.post("/skin/upload-image")
async def upload_skin_image(image: UploadFile = File(...)):
    print(f"\n[/skin/upload-image] Received skin image: {image.filename}")

    try:
        image_bytes = await image.read()
        prediction_result = predict_skin_from_image(image_bytes)

        skin_predictions_store.append(prediction_result)
        print_skin_report(prediction_result)

        return {
            "status": "success",
            "predicted_class": prediction_result["predicted_class"],
            "confidence": prediction_result["confidence"],
            "severity": prediction_result["severity"],
            "all_predictions": prediction_result["all_predictions"],
        }

    except Exception as e:
        print("Skin image processing error:", str(e))
        import traceback
        traceback.print_exc()
        return {"status": "error", "message": str(e)}


@app.get("/skin/latest")
def get_latest_skin_diagnosis():
    if not skin_predictions_store:
        return {"status": "error", "message": "No skin diagnosis available"}
    return {
        "status": "success",
        "diagnosis": skin_predictions_store[-1],
    }


# ------------------------------------------------------------------
# Routes — Utility
# ------------------------------------------------------------------
@app.get("/all-data")
def get_all_data():
    return {
        "users": user_data_store,
        "questionnaires": questionnaire_store,
        "hair_images": image_predictions_store,
        "fusions": fusion_results_store,
        "skin_images": skin_predictions_store,
    }


@app.delete("/clear-data")
def clear_all_data():
    user_data_store.clear()
    questionnaire_store.clear()
    image_predictions_store.clear()
    fusion_results_store.clear()
    skin_predictions_store.clear()

    print("\n[CLEARED] All stored data removed")

    return {
        "status": "success",
        "message": "All data cleared",
    }
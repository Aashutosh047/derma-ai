from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import sys
from pathlib import Path
from pprint import pprint

sys.path.append(str(Path(__file__).parent.parent))

from app.ml.model import run_ml_pipeline
from app.ml.imagemodel import predict_from_image
from app.ml.fusionmodel import run_fusion
from app.ml.skinquestionnairemodel import run_skin_questionnaire_pipeline
from app.ml.skinfusionmodel import run_skin_fusion

def predict_skin_from_image(image_bytes):
    from app.ml.skinmodel import predict_skin_from_image as _predict
    return _predict(image_bytes)

app = FastAPI(title="DermAI API", description="AI-powered skin and hair health assessment", version="4.0")

app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=False, allow_methods=["*"], allow_headers=["*"])

# ── In-memory stores
user_data_store         = []
questionnaire_store     = []
image_predictions_store = []
fusion_results_store    = []
skin_questionnaire_store = []
skin_predictions_store  = []
skin_fusion_store       = []

# ── Pydantic models
class UserDetails(BaseModel):
    name: str; email: str; age: int; gender: str

class Questionnaire(BaseModel):
    hairFallSeverity: str; familyHistory: str; stressLevel: str
    dietQuality: str; sleepDuration: str; scalpItching: bool
    scalpDandruff: bool; scalpRedness: bool; hairWashFrequency: str
    useHeatStyling: bool; useChemicalTreatments: bool

class SkinQuestionnaire(BaseModel):
    sunExposure: str; familyHistorySkin: str; skinTone: str
    ageGroup: str; lesionChange: bool; itchingBleeding: bool
    moleCount: str; sunburnHistory: bool; chemicalExposure: bool
    skinInjury: bool; lesionDuration: str

# ── Print helpers
def print_fusion_report(fusion_result: dict):
    pd = fusion_result["primary_diagnosis"]
    print("\n" + "="*72)
    print(" "*20 + "HAIR HEALTH DIAGNOSTIC REPORT")
    print("="*72)
    print(f"Condition     : {pd['disease']}")
    print(f"Probability   : {pd['probability']*100:.2f}%")
    print(f"Confidence    : {pd['confidence']}")
    print(f"Q-Role        : {fusion_result['questionnaire_role']}")
    print(f"\nSummary: {fusion_result['clinical_summary']}")
    print("="*72)

def print_skin_fusion_report(fusion_result: dict):
    pd = fusion_result["primary_diagnosis"]
    print("\n" + "="*72)
    print(" "*22 + "SKIN DIAGNOSTIC REPORT (FUSION)")
    print("="*72)
    print(f"Condition     : {pd['disease']}")
    print(f"Severity      : {pd['severity'].upper()}")
    print(f"Probability   : {pd['probability']*100:.2f}%")
    print(f"Confidence    : {pd['confidence']}")
    print(f"Q-Role        : {fusion_result['questionnaire_role']}")
    print(f"\nSummary: {fusion_result['clinical_summary']}")
    print("="*72)

# ════════════════════════════════
# ROOT
# ════════════════════════════════
@app.get("/")
def root():
    return {
        "message": "DermAI API running",
        "hair_model": "Active (70% Image + 30% Questionnaire Fusion)",
        "skin_model": "Active (Xception HAM10000 + Questionnaire Fusion)",
        "version": "4.0",
    }

# ════════════════════════════════
# SHARED
# ════════════════════════════════
@app.post("/user-details")
def receive_user_details(user: UserDetails):
    user_data_store.append(user.dict())
    print("\n[/user-details]"); pprint(user.dict())
    return {"status": "success"}

# ════════════════════════════════
# HAIR ROUTES
# ════════════════════════════════
@app.post("/questionnaire")
def receive_questionnaire(q: Questionnaire):
    raw_q = q.dict()
    questionnaire_store.append(raw_q)
    ml_result = run_ml_pipeline(raw_q)
    print("\n[/questionnaire] Top 3:")
    for pred in ml_result["predictions"][:3]:
        print(f"  {pred['disease']}: {pred['probability']:.2%}")
    return {"status": "success", "ml_result": ml_result}

@app.post("/upload-image")
async def upload_image(image: UploadFile = File(...)):
    print(f"\n[/upload-image] {image.filename}")
    try:
        image_bytes = await image.read()
        prediction_result = predict_from_image(image_bytes)
        image_predictions_store.append(prediction_result)
        return {
            "status": "success",
            "predicted_class": prediction_result["predicted_class"],
            "predicted_probability": prediction_result["confidence"],
            "all_class_probabilities": [p["probability"] for p in prediction_result["all_predictions"]],
            "all_predictions": prediction_result["all_predictions"],
            "prediction": prediction_result,
        }
    except Exception as e:
        import traceback; traceback.print_exc()
        return {"status": "error", "message": str(e)}

@app.get("/get-diagnosis")
def get_final_diagnosis():
    if not questionnaire_store:
        return {"status": "error", "message": "No questionnaire data"}
    if not image_predictions_store:
        return {"status": "error", "message": "No image data"}
    try:
        q_result = run_ml_pipeline(questionnaire_store[-1])
        fusion_result = run_fusion(image_predictions_store[-1], q_result)
        fusion_results_store.append(fusion_result)
        print_fusion_report(fusion_result)
        return {"status": "success", "fusion_result": fusion_result}
    except Exception as e:
        import traceback; traceback.print_exc()
        return {"status": "error", "message": str(e)}

@app.get("/latest-diagnosis")
def get_latest_diagnosis():
    if not fusion_results_store:
        return {"status": "error", "message": "No diagnosis available"}
    return {"status": "success", "diagnosis": fusion_results_store[-1]}

# ════════════════════════════════
# SKIN ROUTES
# ════════════════════════════════
@app.post("/skin/questionnaire")
def receive_skin_questionnaire(q: SkinQuestionnaire):
    raw_q = q.dict()
    skin_questionnaire_store.append(raw_q)
    print("\n[/skin/questionnaire]"); pprint(raw_q)
    result = run_skin_questionnaire_pipeline(raw_q)
    print("\n[SKIN Q] Top 3:")
    for pred in result["predictions"][:3]:
        print(f"  {pred['disease']}: {pred['probability']:.2%}")
    return {"status": "success", "ml_result": result}

@app.post("/skin/upload-image")
async def upload_skin_image(image: UploadFile = File(...)):
    print(f"\n[/skin/upload-image] {image.filename}")
    try:
        image_bytes = await image.read()
        prediction_result = predict_skin_from_image(image_bytes)
        skin_predictions_store.append(prediction_result)
        print(f"[SKIN CNN] {prediction_result['predicted_class']} ({prediction_result['confidence']:.2%}) — {prediction_result['severity'].upper()}")
        return {
            "status": "success",
            "predicted_class": prediction_result["predicted_class"],
            "confidence":      prediction_result["confidence"],
            "severity":        prediction_result["severity"],
            "all_predictions": prediction_result["all_predictions"],
        }
    except Exception as e:
        import traceback; traceback.print_exc()
        return {"status": "error", "message": str(e)}

@app.get("/skin/get-diagnosis")
def get_skin_fusion_diagnosis():
    if not skin_questionnaire_store:
        return {"status": "error", "message": "No skin questionnaire data"}
    if not skin_predictions_store:
        return {"status": "error", "message": "No skin image data"}
    try:
        q_result     = run_skin_questionnaire_pipeline(skin_questionnaire_store[-1])
        fusion_result = run_skin_fusion(skin_predictions_store[-1], q_result)
        skin_fusion_store.append(fusion_result)
        print_skin_fusion_report(fusion_result)
        return {"status": "success", "fusion_result": fusion_result}
    except Exception as e:
        import traceback; traceback.print_exc()
        return {"status": "error", "message": str(e)}

@app.get("/skin/latest")
def get_latest_skin_diagnosis():
    if not skin_fusion_store:
        if not skin_predictions_store:
            return {"status": "error", "message": "No skin diagnosis available"}
        return {"status": "success", "diagnosis": skin_predictions_store[-1]}
    return {"status": "success", "diagnosis": skin_fusion_store[-1]}

# ════════════════════════════════
# UTILITY
# ════════════════════════════════
@app.get("/all-data")
def get_all_data():
    return {
        "users":              user_data_store,
        "questionnaires":     questionnaire_store,
        "hair_images":        image_predictions_store,
        "fusions":            fusion_results_store,
        "skin_questionnaires": skin_questionnaire_store,
        "skin_images":        skin_predictions_store,
        "skin_fusions":       skin_fusion_store,
    }

@app.delete("/clear-data")
def clear_all_data():
    for store in [user_data_store, questionnaire_store, image_predictions_store,
                  fusion_results_store, skin_questionnaire_store,
                  skin_predictions_store, skin_fusion_store]:
        store.clear()
    print("\n[CLEARED] All data removed")
    return {"status": "success", "message": "All data cleared"}
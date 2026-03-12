import os
import numpy as np
from PIL import Image
import tensorflow as tf
from io import BytesIO

# --------------------------
# Class names — must match sorted(os.listdir(data_dir)) from training
# --------------------------
class_names = [
    "Actinic keratoses",
    "Basal cell carcinoma",
    "Benign keratosis-like lesions",
    "Dermatofibroma",
    "Melanocytic nevi",
    "Melanoma",
    "Normal",
    "Vascular lesions",
]

# --------------------------
# Severity mapping
# --------------------------
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

# --------------------------
# Model path
# --------------------------
current_dir = os.path.dirname(os.path.abspath(__file__))
model_path = os.path.join(current_dir, "skin_model_final.keras")
print(f"Looking for skin model at: {model_path}")

# --------------------------
# Load full saved model (Xception-based, saved via model.save())
# --------------------------
if os.path.exists(model_path):
    try:
        skin_model = tf.keras.models.load_model(model_path)
        print("✓ Skin CNN Model (Xception) loaded successfully!")
    except Exception as e:
        skin_model = None
        print(f"✗ Failed to load skin model: {e}")
else:
    skin_model = None
    print(f"⚠ Skin model not found at: {model_path}")
    print("  Place skin_model_final.keras in backend/app/ml/ and restart.")

# --------------------------
# Image preprocessing — Xception expects [0,1] rescaled (rescale=1./255 was used in training)
# --------------------------
def preprocess_image_bytes(image_bytes: bytes):
    img = Image.open(BytesIO(image_bytes)).convert("RGB")
    img = img.resize((224, 224))
    img_array = np.array(img, dtype=np.float32)
    img_array = img_array / 255.0          # matches rescale=1./255 from training
    img_array = np.expand_dims(img_array, axis=0)
    return img_array

# --------------------------
# Main prediction function
# --------------------------
def predict_skin_from_image(image_bytes: bytes):
    if skin_model is None:
        raise RuntimeError(
            "Skin model is not loaded. Place 'skin_model_final.keras' "
            "in backend/app/ml/ and restart the server."
        )

    img_array = preprocess_image_bytes(image_bytes)
    preds = skin_model.predict(img_array, verbose=0)
    pred_index = int(np.argmax(preds, axis=1)[0])

    pred_class = class_names[pred_index] if pred_index < len(class_names) else f"Class {pred_index}"
    pred_prob = float(preds[0][pred_index])

    all_predictions = [
        {
            "disease": class_names[i] if i < len(class_names) else f"Class {i}",
            "probability": float(preds[0][i]),
            "severity": SEVERITY_MAP.get(class_names[i] if i < len(class_names) else "", "benign"),
        }
        for i in range(preds.shape[1])
    ]
    all_predictions.sort(key=lambda x: x["probability"], reverse=True)

    result = {
        "predicted_class": pred_class,
        "predicted_class_index": pred_index,
        "confidence": pred_prob,
        "severity": SEVERITY_MAP.get(pred_class, "benign"),
        "all_predictions": all_predictions,
    }

    print(f"\n[SKIN CNN] Predicted: {pred_class} ({pred_prob:.2%}) — {result['severity'].upper()}")
    return result


# --------------------------
# Test function
# --------------------------
if __name__ == "__main__":
    test_image_path = os.path.join(current_dir, "test_skin.jpg")
    if os.path.exists(test_image_path):
        with open(test_image_path, "rb") as f:
            result = predict_skin_from_image(f.read())
        print(f"Class     : {result['predicted_class']}")
        print(f"Severity  : {result['severity']}")
        print(f"Confidence: {result['confidence']:.2%}")
    else:
        print(f"No test image found at: {test_image_path}")
import os
import numpy as np
from PIL import Image
import tensorflow as tf
from tensorflow.keras.applications import EfficientNetB0
from tensorflow.keras.applications.efficientnet import preprocess_input
from tensorflow.keras import layers
from io import BytesIO

# --------------------------
# Class names (HAM10000 + Normal)
# --------------------------
class_names = [
    "Melanocytic nevi",
    "Melanoma",
    "Benign keratosis-like lesions",
    "Basal cell carcinoma",
    "Actinic keratoses",
    "Vascular lesions",
    "Dermatofibroma",
    "Normal",
]

# --------------------------
# Severity mapping
# --------------------------
SEVERITY_MAP = {
    "Melanocytic nevi":              "benign",
    "Melanoma":                      "malignant",
    "Benign keratosis-like lesions": "benign",
    "Basal cell carcinoma":          "malignant",
    "Actinic keratoses":             "precancerous",
    "Vascular lesions":              "benign",
    "Dermatofibroma":                "benign",
    "Normal":                        "normal",
}

# --------------------------
# Model path
# --------------------------
current_dir = os.path.dirname(os.path.abspath(__file__))
model_weights_path = os.path.join(current_dir, "skin_model_final.keras")
print(f"Looking for skin model at: {model_weights_path}")

# --------------------------
# Build model
# --------------------------
base_model = EfficientNetB0(
    include_top=False,
    weights="imagenet",
    input_shape=(224, 224, 3)
)
base_model.trainable = True

inputs = tf.keras.Input(shape=(224, 224, 3))
x = base_model(inputs)
x = layers.GlobalAveragePooling2D()(x)
x = layers.BatchNormalization()(x)
x = layers.Dense(256, activation="relu")(x)
x = layers.Dropout(0.5)(x)
outputs = layers.Dense(len(class_names), activation="softmax")(x)

skin_model = tf.keras.Model(inputs=inputs, outputs=outputs)

# --------------------------
# Load weights (safe — won't crash if model not yet trained)
# --------------------------
if os.path.exists(model_weights_path):
    skin_model.load_weights(model_weights_path)
    print("✓ Skin CNN Model loaded successfully!")
else:
    skin_model = None
    print(f"⚠ Skin model not found at: {model_weights_path}")
    print("  The /skin/upload-image route will be unavailable until skin_model_final.keras is trained and placed here.")

# --------------------------
# Image preprocessing
# --------------------------
def preprocess_image_bytes(image_bytes: bytes):
    img = Image.open(BytesIO(image_bytes)).convert("RGB")
    img = img.resize((224, 224))
    img_array = np.array(img)
    img_array = np.expand_dims(img_array, axis=0)
    img_array = preprocess_input(img_array)
    return img_array

# --------------------------
# Main prediction function
# --------------------------
def predict_skin_from_image(image_bytes: bytes):
    """
    Takes raw image bytes and returns skin condition prediction results.
    Raises RuntimeError if model is not yet loaded.
    """
    if skin_model is None:
        raise RuntimeError(
            "Skin model is not loaded. Please train the model and save it as "
            "'skin_model_final.keras' in the backend/app/ml/ folder."
        )

    img_array = preprocess_image_bytes(image_bytes)

    preds = skin_model.predict(img_array, verbose=0)
    pred_index = np.argmax(preds, axis=1)[0]
    pred_class = class_names[pred_index]
    pred_prob = float(preds[0][pred_index])

    all_predictions = [
        {
            "disease": class_names[i],
            "probability": float(preds[0][i]),
            "severity": SEVERITY_MAP.get(class_names[i], "benign"),
        }
        for i in range(len(class_names))
    ]

    all_predictions.sort(key=lambda x: x["probability"], reverse=True)

    result = {
        "predicted_class": pred_class,
        "predicted_class_index": int(pred_index),
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
            image_bytes = f.read()
        result = predict_skin_from_image(image_bytes)
        print("\nTest prediction result:")
        print(f"Class     : {result['predicted_class']}")
        print(f"Severity  : {result['severity']}")
        print(f"Confidence: {result['confidence']:.2%}")
    else:
        print(f"Test image not found at: {test_image_path}")
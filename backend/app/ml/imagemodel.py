import os
import numpy as np
from PIL import Image
import tensorflow as tf
from tensorflow.keras.applications import EfficientNetB0
from tensorflow.keras.applications.efficientnet import preprocess_input
from tensorflow.keras import layers
from io import BytesIO

# --------------------------
# Class names
# --------------------------
class_names = [
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

# --------------------------
# Model path - FIXED
# --------------------------
# Get the directory where this file (imagemodel.py) is located
current_dir = os.path.dirname(os.path.abspath(__file__))
model_weights_path = os.path.join(current_dir, "hair_model_final.keras")

print(f"Looking for model at: {model_weights_path}")

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

model = tf.keras.Model(inputs=inputs, outputs=outputs)
model.load_weights(model_weights_path)
print("✓ CNN Model loaded successfully!")

# --------------------------
# Image preprocessing function
# --------------------------
def preprocess_image_bytes(image_bytes: bytes):
    """Convert raw image bytes to preprocessed array for model"""
    img = Image.open(BytesIO(image_bytes)).convert("RGB")
    img = img.resize((224, 224))
    img_array = np.array(img)
    img_array = np.expand_dims(img_array, axis=0)
    img_array = preprocess_input(img_array)
    return img_array

# --------------------------
# Main prediction function
# --------------------------
def predict_from_image(image_bytes: bytes):
    """
    Takes raw image bytes and returns prediction results
    
    Args:
        image_bytes: Raw bytes from uploaded image file
        
    Returns:
        dict with predicted class, probability, and all probabilities
    """
    # Preprocess
    img_array = preprocess_image_bytes(image_bytes)
    
    # Predict
    preds = model.predict(img_array, verbose=0)
    pred_index = np.argmax(preds, axis=1)[0]
    pred_class = class_names[pred_index]
    pred_prob = float(preds[0][pred_index])
    
    # Format all predictions
    all_predictions = [
        {
            "disease": class_names[i],
            "probability": float(preds[0][i])
        }
        for i in range(len(class_names))
    ]
    
    # Sort by probability
    all_predictions.sort(key=lambda x: x["probability"], reverse=True)
    
    result = {
        "predicted_class": pred_class,
        "predicted_class_index": int(pred_index),
        "confidence": pred_prob,
        "all_predictions": all_predictions
    }
    
    print(f"\n[CNN] Predicted: {pred_class} ({pred_prob:.2%} confidence)")
    
    return result

# --------------------------
# Test function
# --------------------------
if __name__ == "__main__":
    # Test with a local file
    test_image_path = os.path.join(current_dir, "androgenic.jpg")
    if os.path.exists(test_image_path):
        with open(test_image_path, "rb") as f:
            image_bytes = f.read()
        
        result = predict_from_image(image_bytes)
        print("\nTest prediction result:")
        print(f"Class: {result['predicted_class']}")
        print(f"Confidence: {result['confidence']:.2%}")
    else:
        print(f"Test image not found at: {test_image_path}")
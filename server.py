from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import numpy as np
import pandas as pd
import tensorflow as tf
from sklearn.preprocessing import StandardScaler
import json
import os

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Load the model if it exists
model = None
if os.path.exists('floodnet_model.h5'):
    try:
        model = tf.keras.models.load_model('floodnet_model.h5')
        print("Model loaded successfully")
    except Exception as e:
        print(f"Error loading model: {e}")

# Create a dummy scaler and dataset for simulation
# In a real scenario, these would be loaded from saved files
class DummyScaler:
    def transform(self, X):
        # Simple normalization between 0 and 1
        return np.array(X) / 10.0

    def inverse_transform(self, X):
        return X * 10.0

scaler = DummyScaler()

# Create dummy data for simulation
columns = ["Rainfall", "WaterLevel", "Humidity", "Temperature", 
           "ClimateChange", "Urbanization", "Deforestation", 
           "DrainageSystems", "DamsQuality"]
X = pd.DataFrame(np.random.rand(100, len(columns)) * 10, columns=columns)


def generate_sequences(data, seq_length):
    """Generate sequences for LSTM input"""
    # This is a simplified function - in real implementation, this would handle time sequences
    return np.array([data[0]] * seq_length).reshape(1, seq_length, -1)


def simulate_and_narrate(features, years=20):
    """Simulate flood risk over time and provide narrative"""
    # Define drift factors for climate change, urbanization, and deforestation
    drift = np.array([0.03, 0.04, 0.015])
    indices = [X.columns.get_loc(f) for f in ["ClimateChange", "Urbanization", "Deforestation"]]
    
    # Create base feature set
    base = pd.DataFrame([X.mean()], columns=X.columns)
    for k in features:
        base[k] = features[k]
    
    # Initialize with scaled features
    x0 = scaler.transform(base).flatten()
    
    # Simulate over years
    risks = []
    for t in range(years):
        xt = x0.copy()
        # Apply drift to climate factors
        for i, idx in enumerate(indices):
            xt[idx] = np.clip(xt[idx] + t * drift[i], 0, 1)
        
        # Use dummy model prediction if no real model is available
        if model is None:
            # Simulate risk as base risk + time factor + random component
            base_risk = (xt[0] * 0.4 + xt[1] * 0.3 + xt[2] * 0.2 + xt[3] * 0.1)
            climate_impact = (xt[indices[0]] * 0.5 + xt[indices[1]] * 0.3 + xt[indices[2]] * 0.2)
            risk = (base_risk * 0.6 + climate_impact * 0.4) * 10
            risk = min(max(risk + np.random.normal(0, 0.2), 0), 10)
        else:
            # Reshape for CNN and LSTM inputs
            x_cnn = xt.reshape(1, 5, 4, 1)  # Adjust dimensions as needed for your model
            x_lstm = generate_sequences([xt], 5)
            # Get prediction from model
            risk = float(model.predict([x_cnn, x_lstm]).flatten()[0]) * 10
        
        risks.append(float(risk))
    
    # Determine trend for narrative
    trend = "increasing rapidly" if risks[-1] - risks[0] > 5 else \
            "moderately increasing" if risks[-1] - risks[0] > 2 else \
            "stable" if abs(risks[-1] - risks[0]) <= 2 else \
            "decreasing"
    
    narrative = f"Over {years} years, flood risk is {trend}, starting at {risks[0]:.2f} and ending at {risks[-1]:.2f}."
    
    return risks, narrative


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/api/predict', methods=['POST'])
def predict():
    """API endpoint for basic prediction"""
    data = request.json
    
    # Extract features
    rainfall = float(data.get('rainfall', 0))
    water_level = float(data.get('waterLevel', 0))
    humidity = float(data.get('humidity', 0))
    temperature = float(data.get('temperature', 0))
    
    # Normalize inputs (simple method)
    normalized_rainfall = min(rainfall / 200.0, 1.0)
    normalized_water_level = min(water_level / 10.0, 1.0)
    normalized_humidity = humidity / 100.0
    normalized_temperature = (temperature + 10) / 50.0  # Assuming range -10 to 40C
    
    # Calculate risk score with physical and climate factors
    base_risk = (normalized_rainfall * 0.4 + 
                normalized_water_level * 0.3 + 
                normalized_humidity * 0.2 + 
                normalized_temperature * 0.1)
    
    # Add random variation for demonstration (would use actual model in production)
    if model is None:
        risk_score = min(base_risk * 100 + np.random.normal(0, 5), 100)
    else:
        # Here you would prepare inputs for your specific model architecture
        # This is a placeholder - adjust according to your model's requirements
        try:
            model_input = np.array([[
                normalized_rainfall, normalized_water_level, 
                normalized_humidity, normalized_temperature
            ]])
            risk_score = float(model.predict(model_input)[0]) * 100
        except Exception as e:
            print(f"Error in model prediction: {e}")
            risk_score = base_risk * 100
    
    # Determine risk level
    if risk_score >= 70:
        risk_level = "high"
        message = "High flood risk detected! Consider evacuation or emergency preparations."
    elif risk_score >= 40:
        risk_level = "medium"
        message = "Medium flood risk detected. Monitor conditions closely."
    else:
        risk_level = "low"
        message = "Low flood risk. Normal precautions advised."
    
    # Calculate factor contributions
    factor_scores = {
        "rainfall": normalized_rainfall * 0.4 / base_risk * 100 if base_risk > 0 else 25,
        "waterLevel": normalized_water_level * 0.3 / base_risk * 100 if base_risk > 0 else 25,
        "humidity": normalized_humidity * 0.2 / base_risk * 100 if base_risk > 0 else 25,
        "temperature": normalized_temperature * 0.1 / base_risk * 100 if base_risk > 0 else 25
    }
    
    return jsonify({
        "level": risk_level,
        "message": message,
        "probability": float(risk_score),
        "factorScores": factor_scores,
        "totalScore": float(risk_score)
    })


@app.route('/api/simulate', methods=['POST'])
def run_simulation():
    """API endpoint for long-term simulation"""
    data = request.json
    
    # Extract basic features
    rainfall = float(data.get('rainfall', 50))
    water_level = float(data.get('waterLevel', 2))
    humidity = float(data.get('humidity', 60))
    temperature = float(data.get('temperature', 20))
    
    # Extract scenario text and years
    scenario = data.get('scenario', '').lower()
    years = int(data.get('years', 20))
    
    # Parse scenario text for features
    keywords = {
        "urban": "Urbanization",
        "deforest": "Deforestation",
        "climate": "ClimateChange",
        "drainage": "DrainageSystems",
        "dam": "DamsQuality"
    }
    
    # Set default values for all features
    features = {
        "Rainfall": rainfall,
        "WaterLevel": water_level,
        "Humidity": humidity,
        "Temperature": temperature,
        "ClimateChange": 5,
        "Urbanization": 5,
        "Deforestation": 5,
        "DrainageSystems": 5,
        "DamsQuality": 5
    }
    
    # Adjust based on scenario text
    for word, feat in keywords.items():
        if word in scenario:
            if "increase" in scenario or "rapid" in scenario or "aggressive" in scenario:
                features[feat] = 8 + np.random.rand() * 2
            elif "decrease" in scenario or "recovery" in scenario or "improve" in scenario:
                features[feat] = 2 + np.random.rand() * 2
            elif "fail" in scenario or "collapse" in scenario or "weak" in scenario:
                features[feat] = 1 + np.random.rand()
    
    # Run simulation
    risks, narrative = simulate_and_narrate(features, years)
    
    return jsonify({
        "risks": risks,
        "narrative": narrative,
        "years": list(range(years)),
        "features": features
    })


if __name__ == '__main__':
    app.run(debug=True, port=5000) 
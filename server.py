from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import numpy as np
import pandas as pd
import tensorflow as tf
from sklearn.preprocessing import StandardScaler
import json
import os
# Import the flood scenario model
from flood_scenario_model import FloodScenarioModel

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

# Initialize the scenario model
try:
    scenario_model = FloodScenarioModel()
    print("Scenario model loaded successfully")
except Exception as e:
    scenario_model = None
    print(f"Error loading scenario model: {e}")

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
    # Improved drift factors based on scientific climate projections
    # Different factors have different rates of change and interdependencies
    base_drift = np.array([0.03, 0.04, 0.015, 0.02, 0.01])  # Climate, Urban, Deforest, Drainage, Dams
    
    # Get indices for all factors that can change over time
    factor_names = ["ClimateChange", "Urbanization", "Deforestation", "DrainageSystems", "DamsQuality"]
    indices = [X.columns.get_loc(f) for f in factor_names]
    
    # Create base feature set
    base = pd.DataFrame([X.mean()], columns=X.columns)
    for k in features:
        base[k] = features[k]
    
    # Initialize with scaled features
    x0 = scaler.transform(base).flatten()
    
    # Simulate over years
    risks = []
    feature_trajectories = {factor: [] for factor in factor_names}
    
    # Store initial values
    for i, factor in enumerate(factor_names):
        feature_trajectories[factor].append(x0[indices[i]] * 10)  # Unscale for storing
    
    for t in range(years):
        xt = x0.copy()
        
        # First handle base drift for climate factors
        for i, idx in enumerate(indices):
            # Base drift modified by current value of the factor (logistic-like growth)
            current_val = xt[idx]
            # Calculate drift based on current value - nonlinear effects
            drift_modifier = 1.0
            
            # Climate change accelerates over time (reinforcing loop)
            if i == 0 and t > 10:  # ClimateChange factor after 10 years
                drift_modifier = 1.2  # Accelerating climate effects
            
            # Urban growth slows as it approaches capacity
            if i == 1 and current_val > 0.7:  # Urbanization factor approaching limits
                drift_modifier = 0.7  # Slowing urban growth at high levels
            
            # Calculate effective drift
            effective_drift = base_drift[i] * drift_modifier
            
            # Apply drift with constraints
            if factor_names[i] in ["DrainageSystems", "DamsQuality"]:
                # Infrastructure degrades over time unless maintained
                xt[idx] = max(0, xt[idx] - (effective_drift * 0.5))
            else:
                xt[idx] = min(1.0, xt[idx] + effective_drift)
        
        # Now handle interactions between factors
        
        # Deforestation makes climate change worse
        if xt[indices[2]] > 0.6:  # High deforestation
            xt[indices[0]] = min(1.0, xt[indices[0]] + 0.01)  # Increases climate change
            
        # Good drainage systems reduce impact of urbanization
        if xt[indices[3]] > 0.7:  # Good drainage systems
            urban_impact = max(0, xt[indices[1]] - 0.2)  # Reduce effective urbanization
        else:
            urban_impact = xt[indices[1]] * 1.2  # Amplify urbanization effects with poor drainage
            
        # Dam quality affects water level management
        dam_effectiveness = xt[indices[4]]
        
        # Use model or simplified approach for prediction
        if model is None:
            # Enhanced calculation considering interactions and nonlinear effects
            
            # Calculate base environmental risk
            rain_impact = xt[0] * 0.4  # Rainfall
            water_impact = xt[1] * 0.3  # Water level
            
            # Water level is affected by dam quality
            water_impact = water_impact * (1.0 - (dam_effectiveness * 0.5))
            
            # Humidity impact increases with temperature
            humidity_temp_interaction = xt[2] * xt[3] * 0.3  # Humidity and Temperature interact
            
            # Environmental base risk
            env_risk = rain_impact + water_impact + humidity_temp_interaction
            
            # Climate factors with interactions
            climate_impact = (xt[indices[0]] * 0.5 +  # Climate change
                             urban_impact * 0.3 +     # Urbanization (modified by drainage)
                             xt[indices[2]] * 0.2)    # Deforestation
            
            # Final risk calculation with nonlinear scaling
            # Higher weights for environmental factors in early years,
            # climate factors gain importance over time
            env_weight = 0.8 - (t / years * 0.3)  # Decreases over time
            climate_weight = 1.0 - env_weight
            
            # Calculate final risk score (0-10 scale)
            risk = (env_risk * env_weight + climate_impact * climate_weight) * 10
            
            # Add small random variation representing unpredictable factors
            random_variation = np.random.normal(0, 0.1)  # Reduced random variation for more stability
            risk = min(max(risk + random_variation, 0), 10)
        else:
            # Reshape for CNN and LSTM inputs
            x_cnn = xt.reshape(1, 5, 4, 1)
            x_lstm = generate_sequences([xt], 5)
            # Get prediction from model
            risk = float(model.predict([x_cnn, x_lstm]).flatten()[0]) * 10
        
        risks.append(float(risk))
        
        # Store factor values for trajectory analysis
        for i, factor in enumerate(factor_names):
            feature_trajectories[factor].append(xt[indices[i]] * 10)  # Unscale for storing
    
    # Enhanced narrative generation with more detailed trend analysis
    
    # Overall trend
    start_risk = risks[0]
    end_risk = risks[-1]
    risk_change = end_risk - start_risk
    
    if risk_change > 5:
        trend = "increasing rapidly"
        severity = "severe"
    elif risk_change > 2:
        trend = "moderately increasing"
        severity = "significant"
    elif risk_change > 0.5:
        trend = "slightly increasing"
        severity = "mild"
    elif abs(risk_change) <= 0.5:
        trend = "relatively stable"
        severity = "minimal"
    elif risk_change > -2:
        trend = "slightly decreasing"
        severity = "mild improvement in"
    else:
        trend = "decreasing"
        severity = "substantial improvement in"
    
    # Identify key factors driving the change
    factor_changes = {f: feature_trajectories[f][-1] - feature_trajectories[f][0] for f in factor_names}
    
    # Sort factors by absolute change
    driving_factors = sorted(factor_changes.items(), key=lambda x: abs(x[1]), reverse=True)
    
    # Format factor names for readability
    factor_display = {
        "ClimateChange": "climate change impacts",
        "Urbanization": "urban development",
        "Deforestation": "deforestation",
        "DrainageSystems": "drainage infrastructure",
        "DamsQuality": "dam and levee systems"
    }
    
    # Generate detailed narrative
    narrative = f"Over {years} years, flood risk is {trend}, from {start_risk:.2f} to {end_risk:.2f} on a 10-point scale."
    
    # Add details about key driving factors
    if driving_factors:
        top_factor, top_change = driving_factors[0]
        direction = "increase" if top_change > 0 else "decrease"
        narrative += f" The most significant driver is a {abs(top_change):.1f}-point {direction} in {factor_display[top_factor]}."
    
    # Add pattern details
    if len(risks) > 5:
        # Check for acceleration or plateaus
        first_half_change = risks[len(risks)//2] - risks[0]
        second_half_change = risks[-1] - risks[len(risks)//2]
        
        if abs(second_half_change) > abs(first_half_change) * 1.5:
            narrative += f" The rate of change is accelerating in later years."
        elif abs(first_half_change) > abs(second_half_change) * 1.5:
            narrative += f" The rate of change is slowing in later years."
    
    # Add risk level context
    if end_risk >= 7:
        narrative += f" This scenario indicates a high-risk situation requiring significant preventive measures."
    elif end_risk >= 4:
        narrative += f" This represents a moderate risk level that should be monitored closely."
    else:
        narrative += f" This suggests a manageable risk level with proper planning."
    
    return risks, narrative, feature_trajectories


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
    scenario_text = data.get('scenario', '')
    years = int(data.get('years', 20))
    
    # Use the new scenario model if available
    if scenario_model is not None:
        try:
            # Get predictions from the BERT model
            scenario_factors = scenario_model.predict(scenario_text)
            
            # Map the scenario factors to our simulation features
            features = {
                "Rainfall": rainfall,
                "WaterLevel": water_level,
                "Humidity": humidity,
                "Temperature": temperature,
                "ClimateChange": scenario_factors["ClimateChange"],
                "Urbanization": scenario_factors["Urbanization"],
                "Deforestation": scenario_factors["Deforestation"],
                "DrainageSystems": scenario_factors["DrainageSystems"],
                "DamsQuality": scenario_factors["DamsQuality"]
            }
            
            # Run simulation with these features
            risks, narrative, feature_trajectories = simulate_and_narrate(features, years)
            
            # Create a more detailed narrative based on scenario factors
            high_factors = [k for k, v in scenario_factors.items() if v >= 7]
            low_factors = [k for k, v in scenario_factors.items() if v <= 3]
            
            detailed_narrative = narrative + "\n\n"
            if high_factors:
                detailed_narrative += f"High impact factors include: {', '.join(high_factors)}. "
            if low_factors:
                detailed_narrative += f"Well-managed factors include: {', '.join(low_factors)}. "
                
            return jsonify({
                "risks": risks,
                "narrative": detailed_narrative,
                "years": list(range(years)),
                "features": features,
                "scenario_factors": scenario_factors,
                "feature_trajectories": feature_trajectories
            })
            
        except Exception as e:
            print(f"Error using scenario model: {e}")
            # Fall back to keyword-based approach if there's an error
    
    # Original keyword-based approach as fallback
    # Parse scenario text for features
    scenario = scenario_text.lower()
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
    risks, narrative, feature_trajectories = simulate_and_narrate(features, years)
    
    return jsonify({
        "risks": risks,
        "narrative": narrative,
        "years": list(range(years)),
        "features": features,
        "feature_trajectories": feature_trajectories
    })


if __name__ == '__main__':
    app.run(debug=True, port=5000) 
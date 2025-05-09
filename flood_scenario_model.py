import torch
import numpy as np
from transformers import BertTokenizer, BertModel
from sklearn.multioutput import MultiOutputRegressor
from sklearn.ensemble import GradientBoostingRegressor
from sklearn.preprocessing import MinMaxScaler
from sklearn.model_selection import cross_val_score, KFold
import joblib
import os

class FloodScenarioModel:
    def __init__(self):
        self.tokenizer = BertTokenizer.from_pretrained("bert-base-uncased")
        self.bert_model = BertModel.from_pretrained("bert-base-uncased")
        self.bert_model.eval()

        self.labels = ["Urbanization", "Deforestation", "ClimateChange", "DrainageSystems", "DamsQuality"]
        self.scaler_y = MinMaxScaler()
        
        # Check if the model already exists and load it, otherwise train a new one
        model_path = 'flood_scenario_model.joblib'
        if os.path.exists(model_path):
            try:
                self.model = joblib.load(model_path)
                print("Loaded pre-trained scenario model")
            except Exception as e:
                print(f"Error loading model: {e}")
                self._train_model()
        else:
            self._train_model()

    def _encode(self, text):
        with torch.no_grad():
            tokens = self.tokenizer(text, return_tensors="pt", truncation=True, padding=True, max_length=128)
            output = self.bert_model(**tokens)
            return output.last_hidden_state[:, 0, :].squeeze().numpy()

    def _train_model(self):
        # Expanded training data with more diverse scenarios
        data = [
            {"text": "Rapid urban sprawl and deforestation with failing drainage systems.", "labels": [9, 8, 6, 2, 4]},
            {"text": "Rising sea levels and torrential rain from climate change.", "labels": [4, 3, 9, 3, 3]},
            {"text": "Forest restoration and dam reinforcement in a temperate climate.", "labels": [2, 2, 4, 7, 9]},
            {"text": "Extreme heat and drying wetlands with urban expansion and poor dams.", "labels": [7, 7, 9, 4, 2]},
            {"text": "Excellent drainage and strong dam systems in low urban density areas.", "labels": [3, 3, 4, 9, 9]},
            {"text": "Massive deforestation and heatwaves with weak infrastructure.", "labels": [6, 9, 8, 2, 3]},
            {"text": "Reforestation efforts and green policies reduce climate impact.", "labels": [3, 2, 3, 8, 8]},
            {"text": "Torrential rain due to warming oceans and blocked city drainage.", "labels": [6, 4, 9, 1, 4]},
            # Additional scenarios to improve model robustness
            {"text": "Urban development in floodplains with increased impervious surfaces.", "labels": [9, 5, 6, 3, 5]},
            {"text": "Restoration of wetlands and natural water retention areas.", "labels": [4, 2, 5, 8, 7]},
            {"text": "Aging dams and levees with deferred maintenance in areas with heavy rainfall.", "labels": [5, 4, 7, 5, 2]},
            {"text": "Green infrastructure implementation with permeable surfaces in urban areas.", "labels": [6, 3, 5, 8, 6]},
            {"text": "Coastal erosion with sea level rise and storm surges.", "labels": [5, 6, 9, 4, 3]},
            {"text": "Mountain deforestation leading to increased runoff and soil erosion.", "labels": [6, 9, 7, 3, 4]},
            {"text": "River basin management with integrated flood control measures.", "labels": [5, 4, 5, 8, 8]},
            {"text": "Agricultural expansion with soil compaction and drainage modifications.", "labels": [7, 8, 6, 3, 4]},
            {"text": "Dense urban centers with outdated stormwater systems.", "labels": [9, 4, 6, 2, 5]},
            {"text": "Smart city development with rainfall capture and storage systems.", "labels": [8, 3, 5, 9, 7]},
            {"text": "Severe drought followed by intense rainfall on dry soil.", "labels": [5, 6, 8, 4, 5]},
            {"text": "Polar ice melting rapidly with stronger hurricanes.", "labels": [4, 5, 10, 3, 5]},
            {"text": "Complete ecosystem restoration and nature-based solutions for flood management.", "labels": [2, 1, 3, 9, 8]},
            {"text": "Catastrophic dam failure in area with extreme precipitation events.", "labels": [5, 6, 8, 5, 1]},
            {"text": "Improved urban planning with flood-resilient building codes and zoning.", "labels": [6, 4, 5, 7, 7]}
        ]

        print("Training scenario model with", len(data), "examples")
        
        X = np.array([self._encode(d["text"]) for d in data])
        y = np.array([d["labels"] for d in data])
        y_scaled = self.scaler_y.fit_transform(y)
        
        # Create a more powerful model with gradient boosting
        base_model = GradientBoostingRegressor(
            n_estimators=100,
            learning_rate=0.05,
            max_depth=3,
            min_samples_split=3,
            loss='squared_error',
            random_state=42
        )
        
        # Cross-validation to evaluate model quality
        kf = KFold(n_splits=5, shuffle=True, random_state=42)
        cv_scores = []
        
        # Evaluate each output dimension separately
        for i in range(y_scaled.shape[1]):
            dim_scores = cross_val_score(base_model, X, y_scaled[:, i], cv=kf, scoring='neg_mean_squared_error')
            cv_scores.append(-np.mean(dim_scores))  # Convert to positive MSE
            
        print(f"Cross-validation MSE by dimension: {np.round(cv_scores, 4)}")
        print(f"Mean MSE across dimensions: {np.round(np.mean(cv_scores), 4)}")
        
        # Train final model on all data
        self.model = MultiOutputRegressor(base_model)
        self.model.fit(X, y_scaled)
        
        # Save the trained model
        joblib.dump(self.model, 'flood_scenario_model.joblib')
        print("Model trained and saved to flood_scenario_model.joblib")

    def predict(self, text):
        emb = self._encode(text)
        pred_scaled = self.model.predict([emb])[0]
        scores = self.scaler_y.inverse_transform([pred_scaled])[0]
        
        # Apply reasonable constraints to predictions
        scores = np.clip(scores, 1, 10)  # Ensure values stay in 1-10 range
        
        # Return rounded scores
        return dict(zip(self.labels, np.round(scores, 2))) 
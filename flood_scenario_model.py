import torch
import numpy as np
from transformers import BertTokenizer, BertModel
from sklearn.multioutput import MultiOutputRegressor
from sklearn.linear_model import Ridge
from sklearn.preprocessing import MinMaxScaler

class FloodScenarioModel:
    def __init__(self):
        self.tokenizer = BertTokenizer.from_pretrained("bert-base-uncased")
        self.bert_model = BertModel.from_pretrained("bert-base-uncased")
        self.bert_model.eval()

        self.labels = ["Urbanization", "Deforestation", "ClimateChange", "DrainageSystems", "DamsQuality"]
        self.scaler_y = MinMaxScaler()

        self._train_model()

    def _encode(self, text):
        with torch.no_grad():
            tokens = self.tokenizer(text, return_tensors="pt", truncation=True, padding=True)
            output = self.bert_model(**tokens)
            return output.last_hidden_state[:, 0, :].squeeze().numpy()

    def _train_model(self):
        # Training data
        data = [
            {"text": "Rapid urban sprawl and deforestation with failing drainage systems.", "labels": [9, 8, 6, 2, 4]},
            {"text": "Rising sea levels and torrential rain from climate change.", "labels": [4, 3, 9, 3, 3]},
            {"text": "Forest restoration and dam reinforcement in a temperate climate.", "labels": [2, 2, 4, 7, 9]},
            {"text": "Extreme heat and drying wetlands with urban expansion and poor dams.", "labels": [7, 7, 9, 4, 2]},
            {"text": "Excellent drainage and strong dam systems in low urban density areas.", "labels": [3, 3, 4, 9, 9]},
            {"text": "Massive deforestation and heatwaves with weak infrastructure.", "labels": [6, 9, 8, 2, 3]},
            {"text": "Reforestation efforts and green policies reduce climate impact.", "labels": [3, 2, 3, 8, 8]},
            {"text": "Torrential rain due to warming oceans and blocked city drainage.", "labels": [6, 4, 9, 1, 4]}
        ]

        X = np.array([self._encode(d["text"]) for d in data])
        y = np.array([d["labels"] for d in data])
        y_scaled = self.scaler_y.fit_transform(y)

        self.model = MultiOutputRegressor(Ridge(alpha=1.0))
        self.model.fit(X, y_scaled)

    def predict(self, text):
        emb = self._encode(text)
        pred_scaled = self.model.predict([emb])[0]
        scores = self.scaler_y.inverse_transform([pred_scaled])[0]
        return dict(zip(self.labels, np.round(scores, 2))) 
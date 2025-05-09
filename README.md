# Flood Prediction Website

A comprehensive web-based interface for predicting flood risks using environmental data with multiple visualization options and future scenario simulations.

## Features

- Input form for environmental data (rainfall, water level, humidity, temperature)
- Choice between simplified rule-based model and ML model for predictions
- Real-time flood risk prediction
- Multiple visualization options:
  - Interactive map visualization using Leaflet with similar flood-prone locations
  - Risk gauge display
  - Factor contribution breakdown charts
  - Historical data comparison
- Future scenario simulation that allows users to:
  - Describe scenarios in natural language
  - Analyze long-term flood risk projections
  - See effects of climate change, urbanization, and deforestation
- Responsive design for desktop and mobile

## How to Run

### Option 1: Frontend Only (Client-Side)
1. Open `index.html` in Chrome or any modern web browser
2. All predictions will use the simplified rule-based model

### Option 2: Full Application with Python Backend (Recommended)
1. Install Python requirements:
   ```
   pip install -r requirements.txt
   ```
2. Start the Python server:
   ```
   python server.py
   ```
3. Open `http://localhost:5000` in your browser
4. Now you can use all features including ML model predictions and scenario simulations

## How to Use

1. Enter the required environmental data:
   - Rainfall (in mm)
   - Water Level (in m)
   - Humidity (in %)
   - Temperature (in °C)
2. Select the prediction model:
   - Simplified Rule-based Model
   - Machine Learning Model (requires server)
3. Click "Predict Flood Risk" to get a prediction
4. View the risk assessment and explore different visualizations by clicking the tabs:
   - Map View: Shows a geographic representation of the flood risk area and similar locations
   - Gauge: Displays a gauge meter of the risk level
   - Risk Factors: Shows a breakdown of how each environmental factor contributes to the risk
   - Historical Comparison: Compares current conditions with historical flood events
   - Future Simulation: Shows long-term risk projections based on scenario simulations

## Similar Location Identification

The map visualization now includes a powerful feature that identifies areas with similar flood risk characteristics to your current prediction:

1. When you make a prediction, the system analyzes the environmental data you entered
2. It compares your data against a database of known flood-prone locations in the United States
3. Locations with similar characteristics (rainfall patterns, water levels, humidity, etc.) are displayed on the map
4. Each similar location shows:
   - The location name
   - Similarity percentage to your prediction
   - Current risk level
   - Brief description of the location's flood characteristics
   
This feature helps you understand how your prediction relates to real-world locations with comparable flood risks.

## Future Scenario Simulation

The Future Scenario Simulation feature lets you describe potential future scenarios in natural language and see how they might affect flood risk over time:

1. Enter a scenario description using natural language (e.g., "Increased urbanization with rapid climate change")
2. Adjust the number of years to simulate using the slider
3. Click "Run Simulation" to process the scenario
4. View the results in the Future Simulation tab, including:
   - Line chart showing risk trends over time
   - Narrative description of the trend
   - Breakdown of the factors considered

The simulation interprets keywords in your scenario description:
- Climate change (increasing/decreasing)
- Urbanization (rapid/controlled)
- Deforestation (continued/recovery)
- Drainage systems (improved/deteriorated)
- Dam quality (maintained/failing)

## Technical Details

- Front-end implementation using HTML, CSS, and JavaScript
- Visualization libraries:
  - Chart.js for interactive charts and gauge visualization
  - Leaflet for map visualization
- Backend server:
  - Flask-based Python server
  - TensorFlow for ML model integration
  - Natural language processing for scenario interpretation

## Integration with ML Model

The website includes both client-side and server-side prediction options:

1. **Client-side (Simplified Model)**: Works entirely in the browser using rule-based logic
2. **Server-side (ML Model)**: Connects to the Python server which loads the `floodnet_model.h5` file

The server automatically loads the model if available in the project directory. If not found, it falls back to a simulated model.

## Files

- **Frontend:**
  - `index.html` - Main HTML structure with multiple visualization tabs
  - `styles.css` - Styling for the website and visualizations
  - `script.js` - JavaScript functionality including chart creation and API interaction

- **Backend:**
  - `server.py` - Python Flask server for ML model and simulation
  - `requirements.txt` - Python dependencies
  - `floodnet_model.h5` - ML model (optional)
  - `flood.csv` - Dataset (optional, for reference)

## Data Visualization Options

1. **Map Visualization**
   - Shows the geographical area affected by potential flooding
   - Color-coded based on risk level
   - Interactive popup with detailed information
   - Displays similar locations with comparable flood risk characteristics

2. **Risk Gauge**
   - Semi-circular gauge showing risk percentage
   - Color-coded based on risk level
   - Easy to understand visual representation of flood risk

3. **Risk Factors Breakdown**
   - Bar chart showing how each environmental factor contributes to the overall risk
   - Helps identify which factors are most significant in the current prediction

4. **Historical Comparison**
   - Line chart comparing current conditions with historical flood events
   - Ranks current prediction against past events
   - Lists similar historical events for reference

## Future Improvements

- More detailed geographical risk mapping
- User accounts to save scenarios and predictions
- Integration with real-time environmental data APIs
- Mobile app version
- More sophisticated NLP for scenario interpretation
- Expanded database of similar locations worldwide 
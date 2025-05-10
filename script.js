document.addEventListener('DOMContentLoaded', function() {
    // Get form and result elements
    const predictionForm = document.getElementById('prediction-form');
    const resultElement = document.getElementById('result');
    const modelType = document.getElementById('model-type');
    const simulationForm = document.getElementById('simulation-form');
    const simulationResult = document.getElementById('simulation-result');
    const simulationNarrative = document.getElementById('simulation-narrative');
    const simulationFactors = document.getElementById('simulation-factors');
    const simulationYears = document.getElementById('simulation-years');
    const yearsValue = document.getElementById('years-value');
    
    // Get form input elements
    const rainfallInput = document.getElementById('rainfall');
    const waterLevelInput = document.getElementById('water-level');
    const humidityInput = document.getElementById('humidity');
    const temperatureInput = document.getElementById('temperature');
    
    // Get scenario cards
    const scenarioCards = document.querySelectorAll('.scenario-card');
    
    // Get navigation elements
    const navLinks = document.querySelectorAll('.nav-link');
    const sectionContainers = document.querySelectorAll('.section-container');
    
    // Get similarity controls
    const similarityThreshold = document.getElementById('similarity-threshold');
    const thresholdValue = document.getElementById('threshold-value');
    const applyThresholdBtn = document.getElementById('apply-threshold');
    const resetThresholdBtn = document.getElementById('reset-threshold');
    const showSimilarityCheckbox = document.getElementById('show-similarity');
    const similarLocationsList = document.getElementById('similar-locations-list');
    
    // Current prediction and input data storage
    let currentPrediction = null;
    let currentInputData = null;
    
    // Get tab elements
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');
    
    // Chart objects
    let gaugeChart = null;
    let factorsChart = null;
    let historyChart = null;
    let simulationChart = null;
    let map = null;
    
    // Define scenarios data
    const scenariosData = {
        'heavy-rain': {
            rainfall: 150,
            waterLevel: 4.5,
            humidity: 90,
            temperature: 18,
            description: 'Heavy rain event with potential for flash flooding'
        },
        'coastal-flooding': {
            rainfall: 80,
            waterLevel: 5.2,
            humidity: 85,
            temperature: 22,
            description: 'Coastal flooding scenario with high water level'
        },
        'spring-melt': {
            rainfall: 50,
            waterLevel: 3.8,
            humidity: 70,
            temperature: 8,
            description: 'Spring snowmelt with rising water levels'
        },
        'moderate-conditions': {
            rainfall: 60,
            waterLevel: 2.5,
            humidity: 65,
            temperature: 15,
            description: 'Moderate rainfall with manageable conditions'
        },
        'drought-conditions': {
            rainfall: 5,
            waterLevel: 1.0,
            humidity: 30,
            temperature: 32,
            description: 'Drought conditions with minimal flooding risk'
        }
    };
    
    // API endpoint (change this to your actual server URL)
    const API_URL = 'http://localhost:5000';
    
    // Modern Chart.js theme
    Chart.defaults.color = '#a0b0c5';
    Chart.defaults.borderColor = 'rgba(42, 55, 82, 0.5)';
    Chart.defaults.font.family = "'Inter', sans-serif";
    
    // Color theme for charts
    const chartColors = {
        primary: '#0070f3',
        primaryDark: '#0050c9',
        primaryLight: '#3991ff',
        accent: '#00d2ff',
        success: '#00e676',
        warning: '#ffab00',
        danger: '#ff5252',
        background: 'rgba(12, 16, 27, 0.6)',
        surface: 'rgba(28, 36, 56, 0.8)',
        text: '#f0f2f5',
        textSecondary: '#a0b0c5',
    };
    
    // Historical flood data (sample data for demonstration)
    const historicalFloodData = [
        { date: '2020-01', rainfall: 120, waterLevel: 4.2, humidity: 85, temperature: 18, riskScore: 75 },
        { date: '2020-06', rainfall: 90, waterLevel: 3.8, humidity: 78, temperature: 24, riskScore: 65 },
        { date: '2021-03', rainfall: 150, waterLevel: 5.1, humidity: 90, temperature: 15, riskScore: 85 },
        { date: '2021-11', rainfall: 70, waterLevel: 2.9, humidity: 65, temperature: 22, riskScore: 45 },
        { date: '2022-07', rainfall: 110, waterLevel: 4.5, humidity: 80, temperature: 27, riskScore: 70 }
    ];
    
    // Initialize the page
    initializePage();
    
    // Function to initialize the entire page
    function initializePage() {
        console.log('Initializing page...');
        
        // Make sure the prediction section is active by default
        document.getElementById('prediction-section').classList.add('active');
        document.querySelector('.nav-link[data-section="prediction"]').classList.add('active');
        
        // Initialize all components
        initMap();
        initTabSystem();
        initYearsSlider();
        initSimilarityControls();
        initScenarioSelection();
        initNavigation();
        initLocationSearch();
        initCollapsibleSections();
        
        // Set default values for form inputs
        document.getElementById('rainfall').value = '50';
        document.getElementById('water-level').value = '2';
        document.getElementById('humidity').value = '60';
        document.getElementById('temperature').value = '20';
        
        console.log('Page initialization complete');
    }
    
    // Function to initialize navigation
    function initNavigation() {
        // Fix for the navigation system
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', function() {
                // Get target section
                const targetSection = this.getAttribute('data-section');
                
                console.log('Navigation clicked:', targetSection);
                
                // Remove active class from all nav links
                document.querySelectorAll('.nav-link').forEach(navLink => {
                    navLink.classList.remove('active');
                });
                
                // Add active class to clicked link
                this.classList.add('active');
                
                // Hide all sections
                document.querySelectorAll('.section-container').forEach(section => {
                    section.classList.remove('active');
                });
                
                // Show target section
                const targetElement = document.getElementById(`${targetSection}-section`);
                if (targetElement) {
                    targetElement.classList.add('active');
                    console.log('Target section activated:', targetSection);
                } else {
                    console.log('Target section not found:', targetSection);
                }
                
                // If switching to simulation section
                if (targetSection === 'simulation') {
                    // Copy current environmental data to simulation if available
                    if (currentInputData) {
                        // Populate the future scenario form with description based on current data
                        const [rainfall, waterLevel, humidity, temperature] = currentInputData;
                        const scenarioText = document.getElementById('scenario-text');
                        
                        if (!scenarioText.value) {
                            scenarioText.value = `Current conditions: Rainfall ${rainfall}mm, Water Level ${waterLevel}m, Humidity ${humidity}%, Temperature ${temperature}°C with projected climate change impacts`;
                        }
                    }
                }
            });
        });
        
        // Add strobing effect to the simulation button
        addStrobingEffect();
    }
    
    // Function to add strobing effect to simulation button
    function addStrobingEffect() {
        const simulationBtn = document.querySelector('.nav-link[data-section="simulation"]');
        if (simulationBtn) {
            // Add strobe class
            simulationBtn.classList.add('strobe-effect');
            
            // Toggle between on and off states
            setInterval(() => {
                simulationBtn.classList.toggle('strobe-pulse');
            }, 1500);
        }
        
        // Also add strobing effect to the Run Simulation button
        const runSimBtn = document.querySelector('.simulation-btn');
        if (runSimBtn) {
            runSimBtn.classList.add('strobe-effect');
            // Offset the timing slightly from the nav button
            setInterval(() => {
                runSimBtn.classList.toggle('strobe-pulse');
            }, 1800);
        }
    }
    
    // Add event listener for prediction form submission
    predictionForm.addEventListener('submit', function(event) {
        event.preventDefault();
        
        // Show loading state
        resultElement.innerHTML = `
            <div class="loading">
                <div class="spinner"></div>
                <p>Analyzing environmental data...</p>
            </div>
        `;
        
        // Get form values
        const rainfall = parseFloat(document.getElementById('rainfall').value);
        const waterLevel = parseFloat(document.getElementById('water-level').value);
        const humidity = parseFloat(document.getElementById('humidity').value);
        const temperature = parseFloat(document.getElementById('temperature').value);
        const selectedModel = modelType.value;
        
        // Store current input data
        currentInputData = [rainfall, waterLevel, humidity, temperature];
        
        // Validate inputs
        if (isNaN(rainfall) || isNaN(waterLevel) || isNaN(humidity) || isNaN(temperature)) {
            showError('Please enter valid numbers for all fields');
            return;
        }
        
        // Make prediction based on selected model
        if (selectedModel === 'simplified') {
            // Use client-side prediction
            const prediction = predictFloodRiskSimplified(rainfall, waterLevel, humidity, temperature);
            
            // Store current prediction
            currentPrediction = prediction;
            
            // Simulate loading for a better user experience
            setTimeout(() => {
                // Display result and update visualizations
                displayPredictionResult(prediction);
                updateMap(prediction, currentInputData);
                updateGaugeChart(prediction);
                updateFactorsChart(rainfall, waterLevel, humidity, temperature, prediction);
                updateHistoryChart(rainfall, waterLevel, humidity, temperature, prediction);
            }, 800);
        } else {
            // Use server-side ML model prediction
            fetch(`${API_URL}/api/predict`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    rainfall: rainfall,
                    waterLevel: waterLevel,
                    humidity: humidity,
                    temperature: temperature
                })
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                // Store current prediction
                currentPrediction = data;
                
                // Display result and update visualizations
                displayPredictionResult(data);
                updateMap(data, currentInputData);
                updateGaugeChart(data);
                updateFactorsChart(rainfall, waterLevel, humidity, temperature, data);
                updateHistoryChart(rainfall, waterLevel, humidity, temperature, data);
            })
            .catch(error => {
                console.error('Error:', error);
                showError('Error connecting to the server. Using simplified model instead.');
                // Fallback to simplified model
                const prediction = predictFloodRiskSimplified(rainfall, waterLevel, humidity, temperature);
                
                // Store current prediction
                currentPrediction = prediction;
                
                displayPredictionResult(prediction);
                updateMap(prediction, currentInputData);
                updateGaugeChart(prediction);
                updateFactorsChart(rainfall, waterLevel, humidity, temperature, prediction);
                updateHistoryChart(rainfall, waterLevel, humidity, temperature, prediction);
            });
        }
    });
    
    // Add event listener for simulation form submission
    simulationForm.addEventListener('submit', function(event) {
        event.preventDefault();
        
        // Get form values
        const scenarioText = document.getElementById('scenario-text').value;
        const years = parseInt(simulationYears.value);
        
        // Get current environmental values
        const rainfall = parseFloat(document.getElementById('rainfall').value) || 50;
        const waterLevel = parseFloat(document.getElementById('water-level').value) || 2;
        const humidity = parseFloat(document.getElementById('humidity').value) || 60;
        const temperature = parseFloat(document.getElementById('temperature').value) || 20;
        
        // Validate inputs
        if (!scenarioText) {
            showSimulationError('Please describe a scenario.');
            return;
        }
        
        // Show loading state
        simulationResult.innerHTML = `
            <div class="loading">
                <div class="spinner"></div>
                <p>Running simulation for "${scenarioText.substring(0, 30)}${scenarioText.length > 30 ? '...' : ''}"</p>
            </div>
        `;
        
        // Call the simulation API
        fetch(`${API_URL}/api/simulate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                rainfall: rainfall,
                waterLevel: waterLevel,
                humidity: humidity,
                temperature: temperature,
                scenario: scenarioText,
                years: years
            })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            // Display simulation results
            displaySimulationResults(data, scenarioText);
            
            // Switch to simulation tab
            activateTab('simulation');
        })
        .catch(error => {
            console.error('Error:', error);
            showSimulationError('Error running simulation. Please try again or check if the server is running.');
            
            // Fallback to client-side simulation
            const simulationData = simulateClientSide(rainfall, waterLevel, humidity, temperature, scenarioText, years);
            displaySimulationResults(simulationData, scenarioText);
        });
    });
    
    // Function to initialize years slider
    function initYearsSlider() {
        simulationYears.addEventListener('input', function() {
            yearsValue.textContent = this.value + ' years';
        });
    }
    
    // Function to initialize tab system
    function initTabSystem() {
        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const tabName = button.getAttribute('data-tab');
                activateTab(tabName);
            });
        });
    }
    
    // Function to activate a specific tab
    function activateTab(tabName) {
        // Update active tab button
        tabButtons.forEach(btn => {
            btn.classList.remove('active');
            if (btn.getAttribute('data-tab') === tabName) {
                btn.classList.add('active');
            }
        });
        
        // Update active tab pane
        tabPanes.forEach(pane => {
            pane.classList.remove('active');
            if (pane.id === tabName + '-tab') {
                pane.classList.add('active');
            }
        });
        
        console.log('Activating tab:', tabName);
        
        // Resize charts when their tab becomes active to ensure proper rendering
        setTimeout(() => {
            if (tabName === 'gauge' && gaugeChart) {
                console.log('Resizing gauge chart');
                gaugeChart.resize();
            } else if (tabName === 'chart' && factorsChart) {
                console.log('Resizing factors chart');
                factorsChart.resize();
            } else if (tabName === 'history' && historyChart) {
                console.log('Resizing history chart');
                historyChart.resize();
            } else if (tabName === 'simulation' && simulationChart) {
                console.log('Resizing simulation chart');
                simulationChart.resize();
            }
        }, 50);
    }
    
    // Function to predict flood risk using simplified model
    function predictFloodRiskSimplified(rainfall, waterLevel, humidity, temperature) {
        let riskScore = 0;
        let factorScores = {
            rainfall: 0,
            waterLevel: 0,
            humidity: 0,
            temperature: 0
        };
        
        // Rainfall factor (0-40 points)
        if (rainfall > 100) { 
            factorScores.rainfall = 40;
        } else if (rainfall > 50) {
            factorScores.rainfall = 25;
        } else if (rainfall > 20) {
            factorScores.rainfall = 10;
        } else {
            factorScores.rainfall = 5;
        }
        
        // Water level factor (0-40 points)
        if (waterLevel > 5) {
            factorScores.waterLevel = 40;
        } else if (waterLevel > 3) {
            factorScores.waterLevel = 25;
        } else if (waterLevel > 1) {
            factorScores.waterLevel = 10;
        } else {
            factorScores.waterLevel = 5;
        }
        
        // Humidity factor (0-10 points)
        if (humidity > 80) {
            factorScores.humidity = 10;
        } else if (humidity > 60) {
            factorScores.humidity = 5;
        } else {
            factorScores.humidity = 2;
        }
        
        // Temperature factor (0-10 points)
        if (temperature > 30) {
            factorScores.temperature = 5; // Hot weather can increase evaporation
        } else if (temperature < 5) {
            factorScores.temperature = 10; // Cold can mean snow melt
        } else {
            factorScores.temperature = 3;
        }
        
        // Calculate total risk score
        riskScore = factorScores.rainfall + factorScores.waterLevel + factorScores.humidity + factorScores.temperature;
        
        // Determine risk level
        let riskLevel;
        if (riskScore >= 70) {
            riskLevel = {
                level: 'high',
                message: 'High flood risk detected! Consider evacuation or emergency preparations.',
                probability: Math.min(95, riskScore),
                factorScores: factorScores,
                totalScore: riskScore
            };
        } else if (riskScore >= 40) {
            riskLevel = {
                level: 'medium',
                message: 'Medium flood risk detected. Monitor conditions closely.',
                probability: riskScore,
                factorScores: factorScores,
                totalScore: riskScore
            };
        } else {
            riskLevel = {
                level: 'low',
                message: 'Low flood risk. Normal precautions advised.',
                probability: riskScore,
                factorScores: factorScores,
                totalScore: riskScore
            };
        }
        
        return riskLevel;
    }
    
    // Function to predict flood risk using ML model (still a simulation)
    function predictFloodRiskML(rainfall, waterLevel, humidity, temperature) {
        // In a real implementation, this would make an API call to a server
        // that loads the ML model and returns a prediction
        
        // For demonstration purposes, we'll simulate an ML model response
        // by adding some randomness to our simplified model
        
        const baseResult = predictFloodRiskSimplified(rainfall, waterLevel, humidity, temperature);
        
        // Add some "ML complexity" - slight randomness to make it seem more sophisticated
        const randomFactor = Math.random() * 10 - 5; // Random value between -5 and 5
        let mlProbability = baseResult.probability + randomFactor;
        
        // Ensure probability stays within bounds
        mlProbability = Math.max(0, Math.min(100, mlProbability));
        
        // Determine risk level based on adjusted probability
        let riskLevel;
        if (mlProbability >= 70) {
            riskLevel = {
                level: 'high',
                message: 'ML Model: High flood risk detected! Consider evacuation or emergency preparations.',
                probability: mlProbability,
                factorScores: baseResult.factorScores,
                totalScore: mlProbability,
                isMLPrediction: true
            };
        } else if (mlProbability >= 40) {
            riskLevel = {
                level: 'medium',
                message: 'ML Model: Medium flood risk detected. Monitor conditions closely.',
                probability: mlProbability,
                factorScores: baseResult.factorScores,
                totalScore: mlProbability,
                isMLPrediction: true
            };
        } else {
            riskLevel = {
                level: 'low',
                message: 'ML Model: Low flood risk. Normal precautions advised.',
                probability: mlProbability,
                factorScores: baseResult.factorScores,
                totalScore: mlProbability,
                isMLPrediction: true
            };
        }
        
        return riskLevel;
    }
    
    // Client-side simulation when server is not available
    function simulateClientSide(rainfall, waterLevel, humidity, temperature, scenarioText, years) {
        // Parse scenario for keywords
        const keywords = {
            "urban": "Urbanization",
            "deforest": "Deforestation",
            "climate": "ClimateChange",
            "drainage": "DrainageSystems",
            "dam": "DamsQuality"
        };
        
        // Set default drift rates
        let driftRates = {
            baseline: 0.01,
            climate: 0.03,
            urban: 0.04,
            deforest: 0.015
        };
        
        // Adjust drift based on scenario
        const scenarioLower = scenarioText.toLowerCase();
        
        if (scenarioLower.includes("rapid") || scenarioLower.includes("aggress") || scenarioLower.includes("severe")) {
            driftRates.baseline *= 2;
            driftRates.climate *= 2;
            driftRates.urban *= 2;
            driftRates.deforest *= 2;
        }
        
        if (scenarioLower.includes("slow") || scenarioLower.includes("gradual") || scenarioLower.includes("minor")) {
            driftRates.baseline *= 0.5;
            driftRates.climate *= 0.5;
            driftRates.urban *= 0.5;
            driftRates.deforest *= 0.5;
        }
        
        // Generate risk values for each year
        const risks = [];
        const baseRisk = calculateBaseRisk(rainfall, waterLevel, humidity, temperature);
        
        for (let t = 0; t < years; t++) {
            // Calculate climate impact increasing over time
            let climateImpact = 0;
            
            if (scenarioLower.includes("climate")) {
                climateImpact += t * driftRates.climate;
                if (scenarioLower.includes("decrease") || scenarioLower.includes("improve")) {
                    climateImpact *= -0.5;
                }
            }
            
            if (scenarioLower.includes("urban")) {
                climateImpact += t * driftRates.urban;
                if (scenarioLower.includes("decrease") || scenarioLower.includes("control")) {
                    climateImpact *= -0.5;
                }
            }
            
            if (scenarioLower.includes("deforest")) {
                climateImpact += t * driftRates.deforest;
                if (scenarioLower.includes("recovery") || scenarioLower.includes("plant")) {
                    climateImpact *= -0.5;
                }
            }
            
            // Add baseline drift plus random noise
            const yearRisk = Math.min(Math.max(baseRisk + (t * driftRates.baseline) + climateImpact + (Math.random() * 0.4 - 0.2), 0), 10);
            risks.push(yearRisk);
        }
        
        // Determine trend for narrative
        const trend = risks[risks.length - 1] - risks[0] > 5 ? "increasing rapidly" : 
                    risks[risks.length - 1] - risks[0] > 2 ? "moderately increasing" : 
                    Math.abs(risks[risks.length - 1] - risks[0]) <= 2 ? "stable" : "decreasing";
        
        const narrative = `Over ${years} years, flood risk is ${trend}, starting at ${risks[0].toFixed(2)} and ending at ${risks[risks.length - 1].toFixed(2)}.`;
        
        return {
            risks: risks,
            narrative: narrative,
            years: Array.from(Array(years).keys()),
            features: {
                Rainfall: rainfall,
                WaterLevel: waterLevel,
                Humidity: humidity,
                Temperature: temperature
            }
        };
    }
    
    // Helper function for client-side simulation
    function calculateBaseRisk(rainfall, waterLevel, humidity, temperature) {
        // Normalize to 0-1 scale
        const normRainfall = Math.min(rainfall / 200, 1);
        const normWaterLevel = Math.min(waterLevel / 10, 1);
        const normHumidity = humidity / 100;
        const normTemp = (temperature + 10) / 50; // Assuming range -10 to 40
        
        // Calculate base risk (0-10 scale)
        return (normRainfall * 4 + normWaterLevel * 3 + normHumidity * 2 + normTemp) * 10 / 10;
    }
    
    // Function to display prediction result
    function displayPredictionResult(prediction) {
        let resultHTML = `
            <div class="risk-${prediction.level}">
                <h3>${capitalizeFirstLetter(prediction.level)} Flood Risk</h3>
                <p>${prediction.message}</p>
                <p><strong>Risk Probability:</strong> ${prediction.probability.toFixed(1)}%</p>
                ${prediction.isMLPrediction ? '<p><small>Prediction made using Machine Learning model</small></p>' : ''}
            </div>
        `;
        
        resultElement.innerHTML = resultHTML;
    }
    
    // Function to display simulation results
    function displaySimulationResults(data, scenarioText) {
        // Display summary in result area
        simulationResult.innerHTML = `
            <div class="risk-${getRiskLevelFromScore(data.risks[data.risks.length-1])}">
                <h3>Scenario Simulation Results</h3>
                <p><strong>Scenario:</strong> ${scenarioText}</p>
                <p><strong>Years:</strong> ${data.years.length}</p>
                <p><strong>Final Risk:</strong> ${data.risks[data.risks.length-1].toFixed(1)}/10</p>
            </div>
        `;
        
        // Display narrative
        simulationNarrative.innerHTML = `<p>${data.narrative}</p>`;
        
        // Display factors that were considered
        let factorsHTML = '<h4>Environmental Factors Used:</h4><ul>';
        
        // Check if we have scenario_factors from the ML model
        if (data.scenario_factors) {
            // Display ML scenario factors
            factorsHTML += '<li><strong>Scenario Analysis Results:</strong></li>';
            for (const [key, value] of Object.entries(data.scenario_factors)) {
                const factorClass = value >= 7 ? 'high' : value <= 3 ? 'low' : 'medium';
                factorsHTML += `<li><strong>${key}:</strong> <span class="factor-value ${factorClass}">${value.toFixed(1)}</span></li>`;
            }
            factorsHTML += '<li><hr></li>';
        }
        
        // Display environmental parameters
        for (const [key, value] of Object.entries(data.features)) {
            if (typeof value === 'number' && !['ClimateChange', 'Urbanization', 'Deforestation', 'DrainageSystems', 'DamsQuality'].includes(key)) {
                factorsHTML += `<li><strong>${key}:</strong> ${value.toFixed(1)}</li>`;
            }
        }
        
        factorsHTML += '</ul>';
        
        // Add feature trajectories visualization if available
        if (data.feature_trajectories) {
            factorsHTML += '<h4>Factor Changes Over Time:</h4>';
            factorsHTML += '<div class="factor-trajectories-container">';
            factorsHTML += '<canvas id="factor-trajectories-chart" height="200"></canvas>';
            factorsHTML += '</div>';
        }
        
        // Add feature importance visualization if available
        if (data.feature_importance) {
            factorsHTML += '<h4>Feature Importance Analysis:</h4>';
            factorsHTML += '<div class="feature-importance-container">';
            
            // Create a table for feature importance
            factorsHTML += '<table class="feature-importance-table">';
            factorsHTML += '<tr><th>Category</th><th>Factor</th><th>Importance</th></tr>';
            
            // Add environmental factors
            if (data.feature_importance.Environmental) {
                factorsHTML += `<tr class="category-row"><td colspan="2">Environmental Factors</td><td>${data.feature_importance.Environmental.value.toFixed(1)}%</td></tr>`;
                
                // Add individual environmental factors
                for (const [factor, importance] of Object.entries(data.feature_importance.Environmental.factors)) {
                    const importanceClass = importance > 30 ? 'high' : importance < 15 ? 'low' : 'medium';
                    factorsHTML += `<tr><td></td><td>${factor}</td><td><span class="importance-value ${importanceClass}">${importance.toFixed(1)}%</span></td></tr>`;
                }
            }
            
            // Add climate factors
            if (data.feature_importance.Climate) {
                factorsHTML += `<tr class="category-row"><td colspan="2">Climate & Human Factors</td><td>${data.feature_importance.Climate.value.toFixed(1)}%</td></tr>`;
                
                // Add individual climate factors
                for (const [factor, importance] of Object.entries(data.feature_importance.Climate.factors)) {
                    const importanceClass = importance > 7 ? 'high' : importance < 3 ? 'low' : 'medium';
                    factorsHTML += `<tr><td></td><td>${formatFactorName(factor)}</td><td><span class="factor-value ${importanceClass}">${importance.toFixed(1)}</span></td></tr>`;
                }
            }
            
            factorsHTML += '</table>';
            
            // Add feature importance chart
            factorsHTML += '<div class="importance-chart-container">';
            factorsHTML += '<canvas id="importance-chart" height="250"></canvas>';
            factorsHTML += '</div>';
            
            factorsHTML += '</div>'; // Close feature-importance-container
        }
        
        simulationFactors.innerHTML = factorsHTML;
        
        // Update simulation chart
        updateSimulationChart(data);
        
        // Render factor trajectories chart if available
        if (data.feature_trajectories) {
            renderFeatureTrajectories(data.feature_trajectories, data.years);
        }
        
        // Render feature importance chart if available
        if (data.feature_importance) {
            renderFeatureImportanceChart(data.feature_importance);
        }
    }
    
    // New function to render feature trajectories
    function renderFeatureTrajectories(trajectories, years) {
        const ctx = document.getElementById('factor-trajectories-chart').getContext('2d');
        
        // Create gradients for each line
        const gradients = {
            "ClimateChange": createGradient(ctx, [255, 0, 0]),      // Red
            "Urbanization": createGradient(ctx, [0, 128, 255]),     // Blue
            "Deforestation": createGradient(ctx, [0, 204, 102]),    // Green
            "DrainageSystems": createGradient(ctx, [153, 51, 255]), // Purple
            "DamsQuality": createGradient(ctx, [255, 153, 51])      // Orange
        };
        
        // Prepare datasets
        const datasets = Object.entries(trajectories).map(([factor, values], index) => {
            return {
                label: formatFactorName(factor),
                data: values,
                borderColor: gradients[factor],
                backgroundColor: 'transparent',
                borderWidth: 2,
                tension: 0.4,
                pointRadius: 2,
                pointHoverRadius: 4
            };
        });
        
        // Create chart
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: years.map(year => `Year ${year}`),
                datasets: datasets
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: false,
                        min: 0,
                        max: 10,
                        title: {
                            display: true,
                            text: 'Factor Intensity (0-10)',
                            font: { weight: 'bold' }
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Time Progression',
                            font: { weight: 'bold' }
                        }
                    }
                },
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            boxWidth: 12,
                            usePointStyle: true
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(12, 16, 27, 0.9)',
                        padding: 10,
                        cornerRadius: 6,
                        usePointStyle: true
                    }
                },
                interaction: {
                    mode: 'index',
                    intersect: false
                }
            }
        });
    }
    
    // Helper function to create gradient for chart lines
    function createGradient(ctx, rgbColor) {
        const gradient = ctx.createLinearGradient(0, 0, 400, 0);
        const rgbString = `rgba(${rgbColor[0]}, ${rgbColor[1]}, ${rgbColor[2]}`;
        gradient.addColorStop(0, `${rgbString}, 0.8)`);
        gradient.addColorStop(1, `${rgbString}, 0.4)`);
        return gradient;
    }
    
    // Helper function to format factor names for display
    function formatFactorName(factor) {
        const names = {
            "ClimateChange": "Climate Change",
            "Urbanization": "Urban Development",
            "Deforestation": "Deforestation",
            "DrainageSystems": "Drainage Systems",
            "DamsQuality": "Dam & Levee Quality"
        };
        return names[factor] || factor;
    }
    
    // Function to update simulation chart
    function updateSimulationChart(data) {
        const ctx = document.getElementById('simulation-chart').getContext('2d');
        
        // Destroy existing chart if it exists
        if (simulationChart) {
            simulationChart.destroy();
        }
        
        // Create new chart
        simulationChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.years.map(year => `Year ${year}`),
                datasets: [{
                    label: 'Flood Risk (0-10)',
                    data: data.risks,
                    backgroundColor: 'rgba(0, 112, 243, 0.2)',
                    borderColor: 'rgba(0, 112, 243, 1)',
                    borderWidth: 2,
                    fill: 'start',
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 10,
                        title: {
                            display: true,
                            text: 'Flood Risk (0-10)',
                            font: {
                                weight: 'bold',
                                size: 14
                            }
                        },
                        grid: {
                            color: 'rgba(42, 55, 82, 0.3)',
                            drawBorder: false
                        },
                        ticks: {
                            padding: 10
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Time Progression',
                            font: {
                                weight: 'bold',
                                size: 14
                            }
                        },
                        grid: {
                            display: false,
                            drawBorder: false
                        },
                        ticks: {
                            padding: 10
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: 'rgba(12, 16, 27, 0.9)',
                        titleFont: {
                            size: 14,
                            weight: 'bold'
                        },
                        bodyFont: {
                            size: 13
                        },
                        padding: 15,
                        caretSize: 8,
                        cornerRadius: 8,
                        callbacks: {
                            label: function(context) {
                                return `Risk: ${context.parsed.y.toFixed(2)}/10`;
                            },
                            afterLabel: function(context) {
                                const riskLevel = getRiskLevelFromScore(context.parsed.y * 10);
                                return `Risk Level: ${capitalizeFirstLetter(riskLevel)}`;
                            }
                        }
                    }
                }
            }
        });
        
        // Manually resize the chart after a short delay to ensure proper rendering
        setTimeout(() => {
            if (simulationChart) {
                simulationChart.resize();
            }
        }, 100);
    }
    
    // Function to show error message
    function showError(message) {
        resultElement.innerHTML = `<div class="error"><p>${message}</p></div>`;
    }
    
    // Function to show simulation error
    function showSimulationError(message) {
        simulationResult.innerHTML = `<div class="error"><p>${message}</p></div>`;
    }
    
    // Function to initialize map
    function initMap() {
        // Initialize Leaflet map with blue water style
        map = L.map('map').setView([40.7128, -74.0060], 10); // Default to NYC for demo
        
        // Add distinct blue map tile layer
        L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
            subdomains: 'abcd',
            maxZoom: 19
        }).addTo(map);
        
        // Apply custom styling to make water features more blue
        fetch('https://raw.githubusercontent.com/isellsoap/leaflet-water-tiles/master/water.json')
            .then(response => response.json())
            .then(waterData => {
                L.geoJSON(waterData, {
                    style: {
                        fillColor: '#0070f3',
                        weight: 1,
                        opacity: 0.8,
                        color: '#0070f3',
                        fillOpacity: 0.6
                    }
                }).addTo(map);
            })
            .catch(error => {
                console.log('Could not load water overlay', error);
                
                // Fallback: Add a custom CSS rule to enhance water features
                const style = document.createElement('style');
                style.textContent = `.leaflet-tile-loaded { filter: hue-rotate(190deg) saturate(1.5) brightness(0.95); }`;
                document.head.appendChild(style);
            });
        
        // Add a default marker with custom icon
        const defaultIcon = L.divIcon({
            className: 'custom-div-icon',
            html: `<div class="marker-pin pulse-animation"><i class="fas fa-map-marker-alt"></i></div>`,
            iconSize: [30, 42],
            iconAnchor: [15, 42]
        });
        
        L.marker([40.7128, -74.0060], {icon: defaultIcon}).addTo(map)
            .bindPopup(`
                <div class="custom-popup">
                    <h4>Location</h4>
                    <p>Enter data for flood risk prediction.</p>
                </div>
            `)
            .openPopup();
    }
    
    // Function to update map based on prediction
    function updateMap(prediction, inputData) {
        // Clear existing layers
        map.eachLayer(layer => {
            if (layer instanceof L.Marker || layer instanceof L.Circle) {
                map.removeLayer(layer);
            }
        });
        
        // Keep the base tile layer (now blue style)
        L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
            subdomains: 'abcd',
            maxZoom: 19
        }).addTo(map);
        
        // Set colors based on risk level
        let color = getRiskColor(prediction.level);
        
        // Add a circle to represent flood risk area with pulsing effect
        const radius = 1000 + (prediction.probability * 50); // Scale radius based on risk
        const mainLocation = [40.7128, -74.0060]; // NYC as main location
        
        // Add the main location circle with modern styling
        L.circle(mainLocation, {
            color: color,
            fillColor: color,
            fillOpacity: 0.4,
            radius: radius,
            weight: 2,
            className: 'main-risk-circle'
        }).addTo(map);
        
        // Create custom icon for main marker
        const mainIcon = L.divIcon({
            className: 'custom-div-icon',
            html: `<div class="marker-pin pulse-animation" style="background-color:${color}"><i class="fas fa-water"></i></div>`,
            iconSize: [30, 42],
            iconAnchor: [15, 42]
        });
        
        // Add a marker with popup showing prediction details
        L.marker(mainLocation, {icon: mainIcon}).addTo(map)
            .bindPopup(`
                <div class="custom-popup">
                    <h4>${capitalizeFirstLetter(prediction.level)} Flood Risk</h4>
                    <div class="popup-details">
                        <div class="popup-detail"><span>Probability:</span> ${prediction.probability.toFixed(1)}%</div>
                        <div class="popup-detail"><span>Rainfall:</span> ${inputData[0]} mm</div>
                        <div class="popup-detail"><span>Water Level:</span> ${inputData[1]} m</div>
                        <div class="popup-detail"><span>Humidity:</span> ${inputData[2]}%</div>
                        <div class="popup-detail"><span>Temperature:</span> ${inputData[3]}°C</div>
                    </div>
                </div>
            `)
            .openPopup();
        
        // Generate similar locations based on the prediction
        const similarLocations = findSimilarLocations(prediction, inputData);
        
        // Add similar locations to the map
        similarLocations.forEach(location => {
            // Create custom icon for similar location markers
            const locIcon = L.divIcon({
                className: 'custom-div-icon',
                html: `<div class="marker-pin" style="background-color:${getRiskColor(location.riskLevel)}"><i class="fas fa-map-pin"></i></div>`,
                iconSize: [30, 42],
                iconAnchor: [15, 42]
            });
            
            // Add circle with slightly different color shade
            L.circle([location.lat, location.lng], {
                color: getRiskColor(location.riskLevel),
                fillColor: getRiskColor(location.riskLevel),
                fillOpacity: 0.2,
                radius: location.radius,
                weight: 1.5
            }).addTo(map);
            
            // Add marker with location info
            L.marker([location.lat, location.lng], {icon: locIcon})
                .addTo(map)
                .bindPopup(`
                    <div class="custom-popup">
                        <h4>${location.name}</h4>
                        <div class="popup-details">
                            <div class="popup-detail"><span>Risk Level:</span> ${capitalizeFirstLetter(location.riskLevel)}</div>
                            <div class="popup-detail"><span>Similarity:</span> ${location.similarity.toFixed(0)}%</div>
                            <div class="popup-detail"><span>Characteristics:</span> ${location.characteristics}</div>
                        </div>
                    </div>
                `);
        });
        
        // Build the similar locations list in HTML
        if (similarLocations.length > 0) {
            let locationsHTML = '';
            similarLocations.forEach(location => {
                locationsHTML += `
                    <div class="location-item">
                        <div class="location-info">
                            <div class="location-name">${location.name}</div>
                            <div class="location-details">
                                <span class="location-similarity">${location.similarity.toFixed(0)}% Match</span>
                                <span class="location-risk ${location.riskLevel}">${capitalizeFirstLetter(location.riskLevel)} Risk</span>
                            </div>
                        </div>
                        <button class="location-focus" onclick="map.setView([${location.lat}, ${location.lng}], 12)">
                            <i class="fas fa-search-location"></i> View
                        </button>
                    </div>
                `;
            });
            similarLocationsList.innerHTML = locationsHTML;
        } else {
            similarLocationsList.innerHTML = '<div class="no-locations">No similar locations found. Try adjusting the similarity threshold.</div>';
        }
        
        // Adjust map view to fit all locations
        if (similarLocations.length > 0) {
            const allPoints = [mainLocation, ...similarLocations.map(loc => [loc.lat, loc.lng])];
            const bounds = L.latLngBounds(allPoints);
            map.fitBounds(bounds, { padding: [50, 50] });
        } else {
            map.setView(mainLocation, 10);
        }
    }
    
    // Function to find locations with similar flood risk characteristics
    function findSimilarLocations(prediction, inputData) {
        // Get the current similarity threshold from the slider
        const threshold = parseInt(similarityThreshold.value);
        const showSimilar = showSimilarityCheckbox.checked;
        
        // If showing similar locations is disabled, return empty array
        if (!showSimilar) {
            return [];
        }
        
        // Expanded database of potential flood-prone locations 
        const floodLocations = [
            {
                name: "New Orleans, LA",
                lat: 29.9511,
                lng: -90.0715,
                baseRisk: 75,
                rainfall: 160,
                waterLevel: 2.5,
                humidity: 78,
                temperature: 24,
                characteristics: "Low-lying coastal city with history of flooding and levee systems",
                floodType: "coastal,hurricane,river",
                region: "Gulf Coast"
            },
            {
                name: "Houston, TX",
                lat: 29.7604,
                lng: -95.3698,
                baseRisk: 65,
                rainfall: 130,
                waterLevel: 1.8,
                humidity: 75,
                temperature: 28,
                characteristics: "Prone to flash floods during heavy rainfall and hurricanes",
                floodType: "flash,hurricane",
                region: "Gulf Coast"
            },
            {
                name: "Miami, FL",
                lat: 25.7617,
                lng: -80.1918,
                baseRisk: 70,
                rainfall: 120,
                waterLevel: 2.2,
                humidity: 80,
                temperature: 29,
                characteristics: "Coastal city vulnerable to hurricanes, storm surge, and rising sea levels",
                floodType: "coastal,hurricane",
                region: "Southeast"
            },
            {
                name: "Sacramento, CA",
                lat: 38.5816,
                lng: -121.4944,
                baseRisk: 55,
                rainfall: 50,
                waterLevel: 3.2,
                humidity: 65,
                temperature: 22,
                characteristics: "River delta system with extensive flood control systems",
                floodType: "river,dam",
                region: "West Coast"
            },
            {
                name: "St. Louis, MO",
                lat: 38.6270,
                lng: -90.1994,
                baseRisk: 60,
                rainfall: 90,
                waterLevel: 4.1,
                humidity: 70,
                temperature: 18,
                characteristics: "Located at the confluence of major rivers (Mississippi and Missouri)",
                floodType: "river",
                region: "Midwest"
            },
            {
                name: "Charleston, SC",
                lat: 32.7765,
                lng: -79.9311,
                baseRisk: 68,
                rainfall: 110,
                waterLevel: 2.0,
                humidity: 82,
                temperature: 26,
                characteristics: "Low-elevation coastal city prone to tidal flooding and storm surge",
                floodType: "coastal,hurricane",
                region: "Southeast"
            },
            {
                name: "Fargo, ND",
                lat: 46.8772,
                lng: -96.7898,
                baseRisk: 58,
                rainfall: 60,
                waterLevel: 3.8,
                humidity: 62,
                temperature: 10,
                characteristics: "Prone to spring flooding from snowmelt in Red River Valley",
                floodType: "snowmelt,river",
                region: "Northern Plains"
            },
            {
                name: "Nashville, TN",
                lat: 36.1627,
                lng: -86.7816,
                baseRisk: 50,
                rainfall: 100,
                waterLevel: 2.8,
                humidity: 73,
                temperature: 20,
                characteristics: "River-based city with history of flash flooding",
                floodType: "river,flash",
                region: "Southeast"
            },
            {
                name: "Cedar Rapids, IA",
                lat: 41.9779,
                lng: -91.6656,
                baseRisk: 62,
                rainfall: 85,
                waterLevel: 3.5,
                humidity: 68,
                temperature: 16,
                characteristics: "Vulnerable to Cedar River flooding and flash floods",
                floodType: "river,flash",
                region: "Midwest"
            },
            {
                name: "Boulder, CO",
                lat: 40.0150,
                lng: -105.2705,
                baseRisk: 45,
                rainfall: 70,
                waterLevel: 1.5,
                humidity: 40,
                temperature: 15,
                characteristics: "Mountain foothill city prone to flash floods",
                floodType: "flash,snowmelt",
                region: "Rocky Mountains"
            },
            {
                name: "Phoenix, AZ",
                lat: 33.4484,
                lng: -112.0740,
                baseRisk: 35,
                rainfall: 20,
                waterLevel: 0.8,
                humidity: 30,
                temperature: 32,
                characteristics: "Desert city with monsoon season flash floods",
                floodType: "flash,monsoon",
                region: "Southwest"
            },
            {
                name: "Baton Rouge, LA",
                lat: 30.4515,
                lng: -91.1871,
                baseRisk: 72,
                rainfall: 140,
                waterLevel: 3.0,
                humidity: 76,
                temperature: 26,
                characteristics: "Prone to river flooding from Mississippi and extreme rainfall events",
                floodType: "river,hurricane",
                region: "Gulf Coast"
            },
            {
                name: "Portland, OR",
                lat: 45.5051,
                lng: -122.6750,
                baseRisk: 48,
                rainfall: 110,
                waterLevel: 2.3,
                humidity: 75,
                temperature: 16,
                characteristics: "River city with seasonal flooding from rainfall and snowmelt",
                floodType: "river,rain",
                region: "Pacific Northwest"
            },
            {
                name: "Des Moines, IA",
                lat: 41.5868,
                lng: -93.6250,
                baseRisk: 55,
                rainfall: 75,
                waterLevel: 2.7,
                humidity: 65,
                temperature: 17,
                characteristics: "City at the confluence of Des Moines and Raccoon rivers",
                floodType: "river,flash",
                region: "Midwest"
            },
            {
                name: "Ellicott City, MD",
                lat: 39.2674,
                lng: -76.7983,
                baseRisk: 52,
                rainfall: 95,
                waterLevel: 1.7,
                humidity: 70,
                temperature: 22,
                characteristics: "Historic town with severe flash flooding history",
                floodType: "flash",
                region: "Mid-Atlantic"
            },
            {
                name: "San Antonio, TX",
                lat: 29.4252,
                lng: -98.4946,
                baseRisk: 45,
                rainfall: 70,
                waterLevel: 1.8,
                humidity: 65,
                temperature: 27,
                characteristics: "Prone to flash floods in urban areas",
                floodType: "flash,urban",
                region: "Southwest"
            },
            {
                name: "Grand Forks, ND",
                lat: 47.9253,
                lng: -97.0329,
                baseRisk: 60,
                rainfall: 50,
                waterLevel: 4.0,
                humidity: 60,
                temperature: 9,
                characteristics: "Historic Red River flooding with major snowmelt events",
                floodType: "snowmelt,river",
                region: "Northern Plains"
            },
            {
                name: "Albany, NY",
                lat: 42.6526,
                lng: -73.7562,
                baseRisk: 48,
                rainfall: 85,
                waterLevel: 3.1,
                humidity: 67,
                temperature: 14,
                characteristics: "Hudson River flooding and ice jams",
                floodType: "river,ice",
                region: "Northeast"
            },
            {
                name: "Minot, ND",
                lat: 48.2330,
                lng: -101.2923,
                baseRisk: 53,
                rainfall: 45,
                waterLevel: 3.8,
                humidity: 58,
                temperature: 8,
                characteristics: "Souris River flooding with major historical inundation",
                floodType: "river,snowmelt",
                region: "Northern Plains"
            },
            {
                name: "Louisville, KY",
                lat: 38.2527,
                lng: -85.7585,
                baseRisk: 47,
                rainfall: 95,
                waterLevel: 3.0,
                humidity: 68,
                temperature: 19,
                characteristics: "Ohio River flooding with complex floodwall system",
                floodType: "river",
                region: "Midwest"
            }
        ];
        
        // Get rainfall, water level, humidity, and temperature from input data
        const [rainfall, waterLevel, humidity, temperature] = inputData;
        
        // Calculate similarity scores based on input parameters
        const similarLocations = floodLocations.map(location => {
            // Calculate detailed similarity for each parameter
            const rainfallDiff = Math.abs(location.rainfall - rainfall);
            const waterLevelDiff = Math.abs(location.waterLevel - waterLevel);
            const humidityDiff = Math.abs(location.humidity - humidity);
            const temperatureDiff = Math.abs(location.temperature - temperature);
            
            // Calculate individual parameter similarities (0-100%)
            const rainfallSim = 100 - Math.min(100, (rainfallDiff / 2));
            const waterLevelSim = 100 - Math.min(100, (waterLevelDiff * 25));
            const humiditySim = 100 - Math.min(100, humidityDiff);
            const temperatureSim = 100 - Math.min(100, (temperatureDiff * 3));
            
            // Overall similarity is the weighted average
            const overallSimilarity = (
                rainfallSim * 0.4 + 
                waterLevelSim * 0.35 + 
                humiditySim * 0.15 + 
                temperatureSim * 0.1
            );
            
            // Determine flood risk level 
            let baseRiskAdjusted = location.baseRisk;
            
            // Adjust risk based on current prediction (gives more weight to the prediction)
            if (rainfall > 120) baseRiskAdjusted += 10;
            if (waterLevel > 3) baseRiskAdjusted += 15;
            if (humidity > 80) baseRiskAdjusted += 5;
            
            const adjustedRisk = (baseRiskAdjusted * 0.4 + prediction.probability * 0.6);
            
            // Determine risk level
            let riskLevel;
            if (adjustedRisk >= 70) riskLevel = "high";
            else if (adjustedRisk >= 40) riskLevel = "medium";
            else riskLevel = "low";
            
            // Calculate radius (similar to main location but with variability)
            const radius = 800 + (adjustedRisk * 40) + (Math.random() * 300);
            
            return {
                ...location,
                similarity: overallSimilarity,
                riskLevel: riskLevel,
                adjustedRisk: adjustedRisk,
                radius: radius,
                rainfallSim,    // For detailed breakdown
                waterLevelSim,  // For detailed breakdown
                humiditySim,    // For detailed breakdown
                temperatureSim  // For detailed breakdown
            };
        });
        
        // Filter by current similarity threshold and sort by similarity
        return similarLocations
            .filter(loc => loc.similarity > threshold) 
            .sort((a, b) => b.similarity - a.similarity)
            .slice(0, 8); // Show at most 8 similar locations
    }
    
    // Function to update gauge chart
    function updateGaugeChart(prediction) {
        const ctx = document.getElementById('gauge-chart').getContext('2d');
        
        // Destroy existing chart if it exists
        if (gaugeChart) {
            gaugeChart.destroy();
        }
        
        // Handle different prediction data formats
        let probability = 0;
        let riskLevel = 'low';
        
        if (prediction) {
            // Normalize probability to 0-10 scale for consistency
            probability = prediction.probability ? (prediction.probability > 10 ? prediction.probability / 10 : prediction.probability) : 0;
            riskLevel = prediction.level || getRiskLevelFromScore(probability);
        }
        
        console.log('Creating gauge chart with probability:', probability, 'risk level:', riskLevel);
        
        // Create new gauge chart
        gaugeChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                datasets: [{
                    data: [probability, 10 - probability],
                    backgroundColor: [
                        getRiskColor(riskLevel),
                        'rgba(28, 36, 56, 0.2)'
                    ],
                    borderWidth: 0,
                    circumference: 180,
                    rotation: 270
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '85%',
                layout: {
                    padding: 20
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        enabled: false
                    }
                },
                animation: {
                    animateRotate: true,
                    animateScale: true,
                    duration: 1000,
                    easing: 'easeOutCubic'
                }
            }
        });
        
        // Add gauge text overlay with risk level and score
        const gaugeContainer = document.querySelector('#gauge-tab .gauge-container');
        
        // Remove existing gauge text if any
        const existingGaugeText = gaugeContainer.querySelector('.gauge-text');
        if (existingGaugeText) {
            existingGaugeText.remove();
        }
        
        // Create gauge text
        const gaugeText = document.createElement('div');
        gaugeText.className = 'gauge-text';
        gaugeText.innerHTML = `
            <div class="gauge-value">${probability.toFixed(1)}</div>
            <div class="gauge-label">${capitalizeFirstLetter(riskLevel)} Risk</div>
        `;
        
        gaugeContainer.appendChild(gaugeText);
        
        // Manually resize the chart after a short delay to ensure proper rendering
        setTimeout(() => {
            if (gaugeChart) {
                gaugeChart.resize();
            }
        }, 100);
    }
    
    // Function to update factors chart
    function updateFactorsChart(rainfall, waterLevel, humidity, temperature, prediction) {
        const ctx = document.getElementById('factors-chart').getContext('2d');
        
        // Destroy existing chart if it exists
        if (factorsChart) {
            factorsChart.destroy();
        }
        
        console.log('Updating factors chart with prediction:', prediction);
        
        // Default values in case prediction data is missing components
        let factorScores = {
            rainfall: 25,
            waterLevel: 25,
            humidity: 25,
            temperature: 25
        };
        
        let totalScore = 100;
        
        // Get factor values from prediction if available
        if (prediction && prediction.factorScores) {
            factorScores = prediction.factorScores;
            totalScore = prediction.totalScore || 100;
        }
        
        // Get factor values with proper error handling
        const rainfallFactor = (factorScores.rainfall / totalScore * 100) || 25;
        const waterLevelFactor = (factorScores.waterLevel / totalScore * 100) || 25;
        const humidityFactor = (factorScores.humidity / totalScore * 100) || 25;
        const temperatureFactor = (factorScores.temperature / totalScore * 100) || 25;
        
        // Ensure the values add up to 100% by adjusting for rounding errors
        const sum = rainfallFactor + waterLevelFactor + humidityFactor + temperatureFactor;
        const adjustmentFactor = 100 / sum;
        
        // Define colors for the pie chart with more transparency for softer appearance
        const colors = [
            'rgba(0, 112, 243, 0.75)',  // Rainfall - Blue
            'rgba(0, 210, 255, 0.75)',  // Water Level - Light Blue
            'rgba(102, 126, 234, 0.75)', // Humidity - Purple
            'rgba(142, 68, 173, 0.75)'  // Temperature - Violet
        ];
        
        const hoverColors = [
            'rgba(0, 112, 243, 0.9)',  // Rainfall - Blue
            'rgba(0, 210, 255, 0.9)',  // Water Level - Light Blue
            'rgba(102, 126, 234, 0.9)', // Humidity - Purple
            'rgba(142, 68, 173, 0.9)'  // Temperature - Violet
        ];
        
        console.log('Chart data:', [
            (rainfallFactor * adjustmentFactor).toFixed(1),
            (waterLevelFactor * adjustmentFactor).toFixed(1),
            (humidityFactor * adjustmentFactor).toFixed(1),
            (temperatureFactor * adjustmentFactor).toFixed(1)
        ]);
        
        // Create new pie chart with simplified options to ensure it displays
        factorsChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Rainfall', 'Water Level', 'Humidity', 'Temperature'],
                datasets: [{
                    data: [
                        parseFloat((rainfallFactor * adjustmentFactor).toFixed(1)),
                        parseFloat((waterLevelFactor * adjustmentFactor).toFixed(1)),
                        parseFloat((humidityFactor * adjustmentFactor).toFixed(1)),
                        parseFloat((temperatureFactor * adjustmentFactor).toFixed(1))
                    ],
                    backgroundColor: colors,
                    hoverBackgroundColor: hoverColors,
                    borderColor: 'rgba(28, 36, 56, 0.4)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right',
                        labels: {
                            color: '#f0f2f5',
                            font: {
                                size: 14
                            },
                            padding: 15
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(12, 16, 27, 0.9)',
                        titleFont: {
                            size: 14,
                            weight: 'bold'
                        },
                        bodyFont: {
                            size: 13
                        },
                        padding: 15,
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.raw || 0;
                                return `${label}: ${value}% of total risk`;
                            },
                            afterLabel: function(context) {
                                const index = context.dataIndex;
                                const labels = [
                                    `Rainfall: ${rainfall} mm`,
                                    `Water Level: ${waterLevel} m`,
                                    `Humidity: ${humidity}%`,
                                    `Temperature: ${temperature}°C`
                                ];
                                return labels[index];
                            }
                        }
                    }
                }
            }
        });
        
        // Manually resize the chart after a short delay to ensure proper rendering
        setTimeout(() => {
            if (factorsChart) {
                factorsChart.resize();
            }
        }, 100);
    }
    
    // Function to update history chart
    function updateHistoryChart(rainfall, waterLevel, humidity, temperature, prediction) {
        const ctx = document.getElementById('history-chart').getContext('2d');
        
        // Handle missing prediction data
        let probability = 0;
        if (prediction) {
            // Normalize probability to 0-100 scale for consistency with historical data
            probability = prediction.probability || 0;
            // Ensure it's on a 0-100 scale
            if (probability <= 10) {
                probability *= 10;
            }
        }
        
        console.log('Updating history chart with probability:', probability);
        
        // Add current data to history comparison
        const currentData = {
            date: 'Current',
            rainfall: rainfall,
            waterLevel: waterLevel,
            humidity: humidity,
            temperature: temperature,
            riskScore: probability
        };
        
        const historyData = [...historicalFloodData, currentData];
        
        // Destroy existing chart if it exists
        if (historyChart) {
            historyChart.destroy();
        }
        
        // Create new chart with simplified options to ensure it displays
        historyChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: historyData.map(item => item.date),
                datasets: [{
                    label: 'Risk Score',
                    data: historyData.map(item => item.riskScore),
                    backgroundColor: 'rgba(0, 112, 243, 0.2)',
                    borderColor: 'rgba(0, 112, 243, 1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.3
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        title: {
                            display: true,
                            text: 'Risk Score'
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            afterLabel: function(context) {
                                const index = context.dataIndex;
                                const data = historyData[index];
                                return [
                                    'Rainfall: ' + data.rainfall + ' mm',
                                    'Water Level: ' + data.waterLevel + ' m',
                                    'Humidity: ' + data.humidity + '%',
                                    'Temperature: ' + data.temperature + '°C'
                                ];
                            }
                        }
                    }
                }
            }
        });
        
        // Update historical comparison info
        updateHistoricalComparisonInfo(historyData, prediction);
        
        // Manually resize the chart after a short delay to ensure proper rendering
        setTimeout(() => {
            if (historyChart) {
                historyChart.resize();
            }
        }, 100);
    }
    
    // Function to update historical comparison info
    function updateHistoricalComparisonInfo(historyData, currentPrediction) {
        const historyInfo = document.getElementById('history-info');
        const sortedData = [...historyData].sort((a, b) => b.riskScore - a.riskScore);
        
        // Find current prediction's rank
        let currentRank = 1;
        for (let i = 0; i < sortedData.length; i++) {
            if (sortedData[i].date === 'Current') {
                currentRank = i + 1;
                break;
            }
        }
        
        // Find similar historical events
        const similarEvents = historicalFloodData.filter(event => {
            return Math.abs(event.riskScore - currentPrediction.probability) < 15;
        });
        
        let infoHTML = `
            <p>Current conditions rank #${currentRank} in severity compared to ${historicalFloodData.length} historical events.</p>
        `;
        
        if (similarEvents.length > 0) {
            infoHTML += `<p>Similar historical conditions:</p><ul>`;
            similarEvents.forEach(event => {
                infoHTML += `<li>${event.date}: ${event.riskScore.toFixed(1)}% risk (rainfall: ${event.rainfall}mm, water: ${event.waterLevel}m)</li>`;
            });
            infoHTML += `</ul>`;
        } else {
            infoHTML += `<p>No similar historical events found in the database.</p>`;
        }
        
        historyInfo.innerHTML = infoHTML;
    }
    
    // Helper function to get risk level from score (0-10 scale)
    function getRiskLevelFromScore(score) {
        if (score >= 7) return 'high';
        if (score >= 4) return 'medium';
        return 'low';
    }
    
    // Helper function to get color for risk level
    function getRiskColor(riskLevel) {
        switch(riskLevel) {
            case 'high':
                return chartColors.danger;
            case 'medium':
                return chartColors.warning;
            case 'low':
                return chartColors.success;
            default:
                return chartColors.primaryLight;
        }
    }
    
    // Helper function to capitalize first letter
    function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }
    
    // Initialize similarity controls
    function initSimilarityControls() {
        // Update threshold value display when slider changes
        similarityThreshold.addEventListener('input', function() {
            thresholdValue.textContent = this.value + '%';
        });
        
        // Apply button click handler
        applyThresholdBtn.addEventListener('click', function() {
            if (currentPrediction && currentInputData) {
                updateMap(currentPrediction, currentInputData);
            }
        });
        
        // Reset button click handler
        resetThresholdBtn.addEventListener('click', function() {
            similarityThreshold.value = 70;
            thresholdValue.textContent = '70%';
            if (currentPrediction && currentInputData) {
                updateMap(currentPrediction, currentInputData);
            }
        });
        
        // Show/hide similar locations
        showSimilarityCheckbox.addEventListener('change', function() {
            if (currentPrediction && currentInputData) {
                updateMap(currentPrediction, currentInputData);
            }
        });
    }
    
    // Function to initialize scenario card selection
    function initScenarioSelection() {
        scenarioCards.forEach(card => {
            card.addEventListener('click', function() {
                // Remove active class from all cards
                scenarioCards.forEach(c => c.classList.remove('active'));
                
                // Add active class to clicked card
                this.classList.add('active');
                
                // Get scenario type from data attribute
                const scenarioType = this.getAttribute('data-scenario');
                
                // Get scenario data
                const scenarioData = scenariosData[scenarioType];
                
                if (scenarioData) {
                    // Set form values
                    rainfallInput.value = scenarioData.rainfall;
                    waterLevelInput.value = scenarioData.waterLevel;
                    humidityInput.value = scenarioData.humidity;
                    temperatureInput.value = scenarioData.temperature;
                    
                    // Add animation to show the user the inputs have changed
                    [rainfallInput, waterLevelInput, humidityInput, temperatureInput].forEach(input => {
                        input.classList.add('input-updated');
                        setTimeout(() => {
                            input.classList.remove('input-updated');
                        }, 1000);
                    });
                    
                    // Automatically trigger prediction if auto-predict is enabled
                    if (scenarioData.description) {
                        resultElement.innerHTML = `
                            <div class="scenario-loading">
                                <div class="spinner"></div>
                                <p>Loading scenario: ${scenarioData.description}</p>
                            </div>
                        `;
                        
                        // Submit form automatically after a slight delay
                        setTimeout(() => {
                            predictionForm.dispatchEvent(new Event('submit'));
                        }, 800);
                    }
                }
            });
        });
    }
    
    // New function to render feature importance chart
    function renderFeatureImportanceChart(importanceData) {
        const ctx = document.getElementById('importance-chart').getContext('2d');
        
        // Prepare datasets
        const labels = [];
        const values = [];
        const colors = [];
        
        // Add environmental factors
        if (importanceData.Environmental && importanceData.Environmental.factors) {
            for (const [factor, importance] of Object.entries(importanceData.Environmental.factors)) {
                labels.push(factor);
                values.push(importance);
                colors.push(getFactorColor(factor, importance));
            }
        }
        
        // Add climate factors - use factor name without score
        if (importanceData.Climate && importanceData.Climate.factors) {
            for (const [factor, importance] of Object.entries(importanceData.Climate.factors)) {
                labels.push(formatFactorName(factor));
                values.push(importance/2); // Scale climate factors for better visualization
                colors.push(getFactorColor(factor, importance));
            }
        }
        
        // Create chart with 'bar' type instead of deprecated 'horizontalBar'
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Feature Importance',
                    data: values,
                    backgroundColor: colors,
                    borderColor: 'rgba(42, 55, 82, 0.3)',
                    borderWidth: 1
                }]
            },
            options: {
                indexAxis: 'y',  // This makes a horizontal bar chart
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Importance (%)',
                            font: { weight: 'bold' }
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Factor',
                            font: { weight: 'bold' }
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: 'rgba(12, 16, 27, 0.9)',
                        titleFont: {
                            weight: 'bold'
                        },
                        callbacks: {
                            label: function(context) {
                                return `Importance: ${context.raw.toFixed(1)}%`;
                            }
                        }
                    }
                }
            }
        });
    }
    
    // Helper function to get color for a factor based on its importance
    function getFactorColor(factor, importance) {
        // Base colors for different factor types
        const environmentalColors = {
            'Rainfall': 'rgba(0, 112, 243, 0.7)',      // Blue
            'Water Level': 'rgba(0, 210, 255, 0.7)',   // Light Blue
            'Humidity': 'rgba(102, 126, 234, 0.7)',    // Purple
            'Temperature': 'rgba(142, 68, 173, 0.7)',  // Violet
            'WaterLevel': 'rgba(0, 210, 255, 0.7)'     // Light Blue (alternate name)
        };
        
        const climateColors = {
            'ClimateChange': 'rgba(255, 82, 82, 0.7)',      // Red
            'Urbanization': 'rgba(155, 89, 182, 0.7)',      // Purple
            'Deforestation': 'rgba(46, 204, 113, 0.7)',     // Green
            'DrainageSystems': 'rgba(52, 152, 219, 0.7)',   // Blue
            'DamsQuality': 'rgba(243, 156, 18, 0.7)'        // Orange
        };
        
        // Determine base color
        let baseColor = environmentalColors[factor] || climateColors[factor];
        
        // If base color not found, use a default based on importance
        if (!baseColor) {
            if (importance > 30) {
                baseColor = 'rgba(255, 82, 82, 0.7)';  // Red for high importance
            } else if (importance > 15) {
                baseColor = 'rgba(243, 156, 18, 0.7)'; // Orange for medium importance
            } else {
                baseColor = 'rgba(46, 204, 113, 0.7)'; // Green for low importance
            }
        }
        
        return baseColor;
    }
    
    // Weather API Configuration
    const WEATHER_API_KEY = 'YOUR_OPENWEATHERMAP_API_KEY'; // Replace with your OpenWeatherMap API key
    const GEOCODING_API_KEY = 'YOUR_GEOCODING_API_KEY'; // Replace with your API key for geocoding service
    
    // Add the fuzzy matching library
    // This would normally be imported from a CDN or npm package
    // For demonstration, we'll implement a simple version
    const FuzzySearch = {
        // Calculate Levenshtein distance between two strings
        levenshteinDistance: function(str1, str2) {
            if (!str1 || !str2) return str1 ? str1.length : (str2 ? str2.length : 0);
            
            const track = Array(str2.length + 1).fill(null).map(() => 
                Array(str1.length + 1).fill(null));
            
            for (let i = 0; i <= str1.length; i += 1) {
                track[0][i] = i;
            }
            
            for (let j = 0; j <= str2.length; j += 1) {
                track[j][0] = j;
            }
            
            for (let j = 1; j <= str2.length; j += 1) {
                for (let i = 1; i <= str1.length; i += 1) {
                    const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
                    track[j][i] = Math.min(
                        track[j][i - 1] + 1, // deletion
                        track[j - 1][i] + 1, // insertion
                        track[j - 1][i - 1] + indicator, // substitution
                    );
                }
            }
            
            return track[str2.length][str1.length];
        },
        
        // Calculate similarity score between 0 and 1
        similarity: function(str1, str2) {
            if (!str1 || !str2) return 0;
            
            try {
                str1 = String(str1).toLowerCase();
                str2 = String(str2).toLowerCase();
                
                const maxLength = Math.max(str1.length, str2.length);
                if (maxLength === 0) return 1.0;
                
                const distance = this.levenshteinDistance(str1, str2);
                return 1.0 - (distance / maxLength);
            } catch (error) {
                console.error('Error calculating similarity:', error);
                return 0;
            }
        },
        
        // Match a query against an array of items
        match: function(query, items, keyProp, threshold = 0.6) {
            if (!query || !items || !Array.isArray(items) || items.length === 0) {
                return [];
            }
            
            try {
                query = String(query).toLowerCase();
                
                const results = items
                    .filter(item => item && typeof item === 'object' && item[keyProp])
                    .map(item => {
                        try {
                            const string = String(item[keyProp]).toLowerCase();
                            const queryLower = query.toLowerCase();
                            const score = this.similarity(string, queryLower);
                            
                            // Exact prefix match gets a boost
                            if (string.startsWith(queryLower)) {
                                return { item, score: Math.min(score + 0.3, 1.0) };
                            }
                            
                            // Contains match gets a smaller boost
                            if (string.includes(queryLower)) {
                                return { item, score: Math.min(score + 0.15, 1.0) };
                            }
                            
                            return { item, score };
                        } catch (error) {
                            console.error('Error processing item in match:', error, item);
                            return { item, score: 0 };
                        }
                    })
                    .filter(result => result.score >= threshold)
                    .sort((a, b) => b.score - a.score);
                
                return results;
            } catch (error) {
                console.error('Error in FuzzySearch.match:', error);
                return [];
            }
        }
    };
    
    // Function to initialize location search
    function initLocationSearch() {
        console.log('Initializing location search functionality');
        
        const searchInput = document.getElementById('location-search');
        const searchBtn = document.getElementById('search-btn');
        const searchResults = document.getElementById('search-results');
        const useWeatherBtn = document.getElementById('use-weather-data');
        
        // Log if any elements weren't found
        if (!searchInput) console.error('Location search input element not found!');
        if (!searchBtn) console.error('Search button element not found!');
        if (!searchResults) console.error('Search results container not found!');
        if (!useWeatherBtn) console.error('Use weather data button not found!');
        
        // Set up listeners for search input and button
        if (searchBtn) {
            searchBtn.addEventListener('click', function(event) {
                event.preventDefault();
                console.log('Search button clicked, query:', searchInput ? searchInput.value : 'N/A');
                searchLocation(searchInput ? searchInput.value : '');
            });
        }
        
        if (searchInput) {
            searchInput.addEventListener('keyup', function(event) {
                if (event.key === 'Enter') {
                    console.log('Enter key pressed in search input, query:', this.value);
                    searchLocation(this.value);
                }
            });
        }
        
        // Add listener for using the weather data
        if (useWeatherBtn) {
            useWeatherBtn.addEventListener('click', function() {
                console.log('Use weather data button clicked');
                
                try {
                    const rainfall = document.getElementById('weather-rainfall')?.getAttribute('data-value') || 0;
                    const waterLevel = document.getElementById('weather-water')?.getAttribute('data-value') || 0;
                    const humidity = document.getElementById('weather-humidity')?.getAttribute('data-value') || 0;
                    const temperature = document.getElementById('weather-temp')?.getAttribute('data-value') || 0;
                    
                    console.log('Weather data values:', { rainfall, waterLevel, humidity, temperature });
                    
                    // Update form inputs with the weather data
                    const rainfallInput = document.getElementById('rainfall');
                    const waterLevelInput = document.getElementById('water-level');
                    const humidityInput = document.getElementById('humidity');
                    const temperatureInput = document.getElementById('temperature');
                    
                    if (rainfallInput) rainfallInput.value = rainfall;
                    if (waterLevelInput) waterLevelInput.value = waterLevel;
                    if (humidityInput) humidityInput.value = humidity;
                    if (temperatureInput) temperatureInput.value = temperature;
                    
                    // Highlight the updated fields
                    [rainfallInput, waterLevelInput, humidityInput, temperatureInput]
                        .filter(input => input) // Filter out any null elements
                        .forEach(input => {
                            input.classList.add('input-updated');
                            setTimeout(() => {
                                input.classList.remove('input-updated');
                            }, 2000);
                        });
                } catch (error) {
                    console.error('Error applying weather data to form:', error);
                }
            });
        }
        
        console.log('Location search initialization complete');
    }
    
    // Function to search for a location
    function searchLocation(query) {
        if (!query.trim()) return;
        
        // Show loading state
        const searchResults = document.getElementById('search-results');
        searchResults.innerHTML = '<div class="search-loading"><div class="spinner"></div><p>Searching locations...</p></div>';
        searchResults.classList.add('active');
        
        // In a real implementation, this would call a geocoding API
        // For demo purposes, we'll use our simulated fuzzy search
        simulateGeocodingSearch(query)
            .then(results => {
                if (results.length === 0) {
                    searchResults.innerHTML = '<div class="search-no-results">No locations found. Try a different search term.</div>';
                    return;
                }
                
                // Display search results with match scores
                searchResults.innerHTML = '';
                results.forEach(result => {
                    const resultItem = document.createElement('div');
                    resultItem.className = 'search-result-item';
                    resultItem.innerHTML = `
                        <div class="search-result-name">${result.highlightedName || result.name}</div>
                        <div class="search-result-address">${result.address}</div>
                        <div class="search-match-score" title="Match confidence: ${result.matchScore * 100}%">
                            <div class="match-indicator" style="width: ${result.matchScore * 100}%"></div>
                        </div>
                    `;
                    
                    // Add click handler to select this location
                    resultItem.addEventListener('click', () => {
                        selectLocation(result);
                        searchResults.classList.remove('active');
                    });
                    
                    searchResults.appendChild(resultItem);
                });
            })
            .catch(error => {
                console.error('Error searching for location:', error);
                searchResults.innerHTML = '<div class="search-error">An error occurred while searching. Please try again.</div>';
            });
    }
    
    // Function to select a location and get weather data
    function selectLocation(location) {
        console.log('Selected location:', location);
        
        // Show loading state in the weather preview
        const weatherPreview = document.getElementById('weather-preview');
        if (!weatherPreview) {
            console.error('Weather preview element not found');
            return;
        }
        
        // Keep the original structure but just show loading state
        const originalContent = weatherPreview.innerHTML;
        const loadingHTML = `
            <div class="loading">
                <div class="spinner"></div>
                <p>Retrieving weather data for ${location ? location.name : 'selected location'}...</p>
            </div>
        `;
        
        weatherPreview.innerHTML = loadingHTML;
        weatherPreview.classList.remove('hidden');
        
        // Check if location is valid
        if (!location || !location.id) {
            console.error('Invalid location object:', location);
            weatherPreview.innerHTML = `
                <div class="error">
                    <p>Error: Invalid location data. Please try again.</p>
                </div>
            `;
            return;
        }
        
        // In a real implementation, this would call a weather API
        // For demo purposes, we'll simulate with some realistic data
        simulateWeatherData(location)
            .then(weatherData => {
                console.log('Weather data received:', weatherData);
                
                try {
                    // Check if weather data is valid
                    if (!weatherData || typeof weatherData !== 'object') {
                        throw new Error('Invalid weather data received');
                    }
                    
                    // Build the complete HTML for weather preview
                    const weatherHTML = `
                        <div class="weather-header">
                            <div class="weather-location">
                                <i class="fas fa-map-marker-alt"></i>
                                <span id="weather-location-text">${location.name}</span>
                            </div>
                            <div class="weather-timestamp" id="weather-timestamp">
                                <i class="fas fa-clock"></i> ${new Date().toLocaleTimeString()}
                            </div>
                        </div>
                        <div class="weather-data">
                            <div class="weather-item">
                                <div class="weather-icon"><i class="fas fa-cloud-rain"></i></div>
                                <div class="weather-label">Rainfall</div>
                                <div class="weather-value" id="weather-rainfall" data-value="${weatherData.rainfall}">${weatherData.rainfall} mm</div>
                            </div>
                            <div class="weather-item">
                                <div class="weather-icon"><i class="fas fa-water"></i></div>
                                <div class="weather-label">Water Level</div>
                                <div class="weather-value" id="weather-water" data-value="${weatherData.waterLevel}">${weatherData.waterLevel} m</div>
                            </div>
                            <div class="weather-item">
                                <div class="weather-icon"><i class="fas fa-tint"></i></div>
                                <div class="weather-label">Humidity</div>
                                <div class="weather-value" id="weather-humidity" data-value="${weatherData.humidity}">${weatherData.humidity}%</div>
                            </div>
                            <div class="weather-item">
                                <div class="weather-icon"><i class="fas fa-temperature-high"></i></div>
                                <div class="weather-label">Temperature</div>
                                <div class="weather-value" id="weather-temp" data-value="${weatherData.temperature}">${weatherData.temperature}°C</div>
                            </div>
                        </div>
                        <button id="use-weather-data" class="use-weather-btn">
                            <i class="fas fa-file-import"></i> Use This Data
                        </button>
                    `;
                    
                    // Set the complete HTML at once
                    weatherPreview.innerHTML = weatherHTML;
                    
                    // Ensure the use-weather-btn has its event listener
                    const useWeatherBtn = document.getElementById('use-weather-data');
                    if (useWeatherBtn) {
                        useWeatherBtn.addEventListener('click', function() {
                            console.log('Use weather data button clicked after search');
                            
                            try {
                                // Get values directly from weatherData
                                const rainfall = weatherData.rainfall;
                                const waterLevel = weatherData.waterLevel;
                                const humidity = weatherData.humidity;
                                const temperature = weatherData.temperature;
                                
                                console.log('Using weather data:', { rainfall, waterLevel, humidity, temperature });
                                
                                // Update form inputs with the weather data
                                const rainfallInput = document.getElementById('rainfall');
                                const waterLevelInput = document.getElementById('water-level');
                                const humidityInput = document.getElementById('humidity');
                                const temperatureInput = document.getElementById('temperature');
                                
                                if (rainfallInput) rainfallInput.value = rainfall;
                                if (waterLevelInput) waterLevelInput.value = waterLevel;
                                if (humidityInput) humidityInput.value = humidity;
                                if (temperatureInput) temperatureInput.value = temperature;
                                
                                // Highlight the updated fields
                                [rainfallInput, waterLevelInput, humidityInput, temperatureInput]
                                    .filter(input => input) // Filter out any null elements
                                    .forEach(input => {
                                        input.classList.add('input-updated');
                                        setTimeout(() => {
                                            input.classList.remove('input-updated');
                                        }, 2000);
                                    });
                                    
                                // Add a success message
                                alert('Weather data applied successfully!');
                            } catch (error) {
                                console.error('Error applying weather data to form after search:', error);
                                alert('Error applying weather data. Please try again.');
                            }
                        });
                    }
                    
                    // Make sure the preview is visible
                    weatherPreview.classList.remove('hidden');
                } catch (error) {
                    console.error('Error processing weather data:', error);
                    weatherPreview.innerHTML = `
                        <div class="error">
                            <p>Error processing weather data. Please try again.</p>
                            <p>Details: ${error.message}</p>
                        </div>
                    `;
                }
            })
            .catch(error => {
                console.error('Error getting weather data:', error);
                weatherPreview.innerHTML = `
                    <div class="error">
                        <p>Error retrieving weather data. Please try again.</p>
                        <p>Details: ${error.message || 'Unknown error'}</p>
                    </div>
                `;
            });
    }
    
    // Simulated weather data retrieval for demonstration
    function simulateWeatherData(location) {
        console.log('Simulating weather data for location:', location);
        
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                try {
                    // Generate realistic weather data based on the location
                    // In a real implementation, this would come from a weather API
                    let weatherData = {
                        rainfall: 0,
                        waterLevel: 0,
                        humidity: 0,
                        temperature: 0
                    };
                    
                    // Different base data depending on location
                    switch(location.id) {
                        case 1: // New Orleans
                            weatherData = {
                                rainfall: Math.round(Math.random() * 40 + 80), // 80-120mm
                                waterLevel: parseFloat((Math.random() * 2 + 3).toFixed(1)), // 3-5m
                                humidity: Math.round(Math.random() * 15 + 75), // 75-90%
                                temperature: Math.round(Math.random() * 8 + 24) // 24-32°C
                            };
                            break;
                            
                        case 2: // Houston
                            weatherData = {
                                rainfall: Math.round(Math.random() * 60 + 40), // 40-100mm
                                waterLevel: parseFloat((Math.random() * 1.5 + 2).toFixed(1)), // 2-3.5m
                                humidity: Math.round(Math.random() * 20 + 60), // 60-80%
                                temperature: Math.round(Math.random() * 10 + 22) // 22-32°C
                            };
                            break;
                            
                        case 3: // Miami
                            weatherData = {
                                rainfall: Math.round(Math.random() * 50 + 30), // 30-80mm
                                waterLevel: parseFloat((Math.random() * 1.2 + 1.8).toFixed(1)), // 1.8-3m
                                humidity: Math.round(Math.random() * 15 + 75), // 75-90%
                                temperature: Math.round(Math.random() * 6 + 26) // 26-32°C
                            };
                            break;
                            
                        case 4: // Sacramento
                            weatherData = {
                                rainfall: Math.round(Math.random() * 30 + 10), // 10-40mm
                                waterLevel: parseFloat((Math.random() * 1 + 1.5).toFixed(1)), // 1.5-2.5m
                                humidity: Math.round(Math.random() * 25 + 40), // 40-65%
                                temperature: Math.round(Math.random() * 15 + 15) // 15-30°C
                            };
                            break;
                            
                        case 5: // New York
                            weatherData = {
                                rainfall: Math.round(Math.random() * 40 + 20), // 20-60mm
                                waterLevel: parseFloat((Math.random() * 1.5 + 1).toFixed(1)), // 1-2.5m
                                humidity: Math.round(Math.random() * 30 + 50), // 50-80%
                                temperature: Math.round(Math.random() * 20 + 5) // 5-25°C
                            };
                            break;
                            
                        default:
                            // Default random data for other locations
                            weatherData = {
                                rainfall: Math.round(Math.random() * 80 + 20), // 20-100mm
                                waterLevel: parseFloat((Math.random() * 3 + 1).toFixed(1)), // 1-4m
                                humidity: Math.round(Math.random() * 50 + 30), // 30-80%
                                temperature: Math.round(Math.random() * 30 + 5) // 5-35°C
                            };
                    }
                    
                    console.log('Generated weather data:', weatherData);
                    resolve(weatherData);
                } catch (error) {
                    console.error('Error generating weather data:', error);
                    reject(error);
                }
            }, 800); // Simulate network delay
        });
    }
    
    // Function to get weather icon based on rainfall intensity
    function getWeatherIcon(rainfall) {
        if (rainfall > 80) return 'fas fa-cloud-showers-heavy'; // Heavy rain
        if (rainfall > 40) return 'fas fa-cloud-rain'; // Moderate rain
        if (rainfall > 10) return 'fas fa-cloud-sun-rain'; // Light rain
        return 'fas fa-cloud'; // Cloudy
    }

    // Simulated geocoding search for demonstration
    function simulateGeocodingSearch(query) {
        return new Promise((resolve) => {
            setTimeout(() => {
                // Mock larger dataset for more realistic search
                const mockLocations = [
                    {
                        id: 1,
                        name: "New Orleans",
                        address: "New Orleans, LA, USA",
                        lat: 29.9511,
                        lng: -90.0715
                    },
                    {
                        id: 2,
                        name: "Houston",
                        address: "Houston, TX, USA",
                        lat: 29.7604,
                        lng: -95.3698
                    },
                    {
                        id: 3,
                        name: "Miami",
                        address: "Miami, FL, USA",
                        lat: 25.7617,
                        lng: -80.1918
                    },
                    {
                        id: 4,
                        name: "Sacramento",
                        address: "Sacramento, CA, USA",
                        lat: 38.5816,
                        lng: -121.4944
                    },
                    {
                        id: 5,
                        name: "New York",
                        address: "New York, NY, USA",
                        lat: 40.7128,
                        lng: -74.0060
                    },
                    {
                        id: 6,
                        name: "San Francisco",
                        address: "San Francisco, CA, USA",
                        lat: 37.7749,
                        lng: -122.4194
                    },
                    {
                        id: 7,
                        name: "Chicago",
                        address: "Chicago, IL, USA",
                        lat: 41.8781,
                        lng: -87.6298
                    },
                    {
                        id: 8,
                        name: "New Haven",
                        address: "New Haven, CT, USA",
                        lat: 41.3083,
                        lng: -72.9279
                    },
                    {
                        id: 9,
                        name: "New Brunswick",
                        address: "New Brunswick, NJ, USA",
                        lat: 40.4862,
                        lng: -74.4518
                    },
                    {
                        id: 10,
                        name: "Boston",
                        address: "Boston, MA, USA",
                        lat: 42.3601,
                        lng: -71.0589
                    },
                    {
                        id: 11,
                        name: "Los Angeles",
                        address: "Los Angeles, CA, USA",
                        lat: 34.0522,
                        lng: -118.2437
                    },
                    {
                        id: 12,
                        name: "Seattle",
                        address: "Seattle, WA, USA",
                        lat: 47.6062,
                        lng: -122.3321
                    },
                    {
                        id: 13,
                        name: "Atlanta",
                        address: "Atlanta, GA, USA",
                        lat: 33.7490,
                        lng: -84.3880
                    },
                    {
                        id: 14,
                        name: "Dallas",
                        address: "Dallas, TX, USA",
                        lat: 32.7767,
                        lng: -96.7970
                    },
                    {
                        id: 15,
                        name: "Phoenix",
                        address: "Phoenix, AZ, USA",
                        lat: 33.4484,
                        lng: -112.0740
                    },
                    {
                        id: 16,
                        name: "Philadelphia",
                        address: "Philadelphia, PA, USA",
                        lat: 39.9526,
                        lng: -75.1652
                    },
                    {
                        id: 17,
                        name: "San Diego",
                        address: "San Diego, CA, USA",
                        lat: 32.7157,
                        lng: -117.1611
                    },
                    {
                        id: 18,
                        name: "San Antonio",
                        address: "San Antonio, TX, USA",
                        lat: 29.4241,
                        lng: -98.4936
                    },
                    {
                        id: 19,
                        name: "Detroit",
                        address: "Detroit, MI, USA",
                        lat: 42.3314,
                        lng: -83.0458
                    },
                    {
                        id: 20,
                        name: "Minneapolis",
                        address: "Minneapolis, MN, USA",
                        lat: 44.9778,
                        lng: -93.2650
                    }
                ];
                
                // Use fuzzy search instead of simple filtering
                if (!query.trim()) {
                    resolve([]);
                    return;
                }
                
                // Apply fuzzy search with name and address
                const nameResults = FuzzySearch.match(query, mockLocations, 'name', 0.3);
                const addressResults = FuzzySearch.match(query, mockLocations, 'address', 0.2);
                
                // Combine results, ensuring no duplicates
                const combinedResults = [...nameResults];
                
                addressResults.forEach(addrResult => {
                    // If not already in combined results
                    if (!combinedResults.some(r => r.item.id === addrResult.item.id)) {
                        combinedResults.push(addrResult);
                    }
                });
                
                // Sort by score and limit results
                const finalResults = combinedResults
                    .sort((a, b) => b.score - a.score)
                    .slice(0, 7) // Limit to top 7 results
                    .map(r => ({ 
                        ...r.item, 
                        matchScore: r.score.toFixed(2),
                        highlightedName: highlightMatch(r.item.name, query)
                    }));
                
                resolve(finalResults);
            }, 300); // Reduced delay for better UX
        });
    }

    // Function to highlight matching parts of text
    function highlightMatch(text, query) {
        // Simple highlighting for exact substring matches
        if (!query || query.length < 2) return text;
        
        const index = text.toLowerCase().indexOf(query.toLowerCase());
        if (index >= 0) {
            return (
                text.substring(0, index) + 
                '<span class="highlight">' + 
                text.substring(index, index + query.length) + 
                '</span>' + 
                text.substring(index + query.length)
            );
        }
        
        return text;
    }

    // Function to initialize collapsible sections
    function initCollapsibleSections() {
        console.log('Initializing collapsible sections');
        
        const collapsibleHeaders = document.querySelectorAll('.card-header.collapsible');
        
        // Initially collapse the Custom Parameters section but keep Scenarios expanded
        const scenariosHeader = document.querySelector('#scenarios-header');
        const parametersHeader = document.querySelector('#parameters-header');
        
        // Make scenarios expanded by default (active)
        scenariosHeader.classList.add('active');
        
        // Make parameters collapsed by default
        const parametersContent = parametersHeader.nextElementSibling;
        parametersContent.classList.add('collapsed');
        
        collapsibleHeaders.forEach(header => {
            header.addEventListener('click', function() {
                // Toggle active class on header
                this.classList.toggle('active');
                
                // Toggle collapsed class on content
                const content = this.nextElementSibling;
                content.classList.toggle('collapsed');
                
                console.log(`Toggled section: ${this.querySelector('h3').innerText}`);
            });
        });
        
        console.log('Collapsible sections initialized');
    }
}); 
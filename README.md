# 🌾 Kisan AI For Farmers (किसान एआई)

**Kisan AI For Farmers** is an AI-powered agricultural decision support and advisory platform designed to empower farmers with timely, data-backed insights for farm management, crop protection, and income optimization.

---

## 🌟 Key Features

1. **🔬 AI Crop Disease Detection with Photo Upload**:
   - Upload any clear picture of a crop leaf (supports JPG, PNG, WEBP, drag & drop, and camera capture).
   - Instant computer vision diagnosis detecting disease name, causal pathogen, severity level, symptoms, and confidence percentage.
   - Dual treatment plans: **Chemical fungicides/pesticides** (with exact dosages) and **Eco-friendly organic remedies** (Neem extract, Trichoderma, Jeevamrutha).
   - Includes preset leaf test buttons for instant demonstrations (Tomato, Potato, Rice, Wheat, Healthy Leaf).

2. **🤖 'HAL' AI Farming Chatbot Assistant**:
   - An intelligent multilingual agricultural chatbot available 24/7.
   - Answers queries on crop diseases, pest remedies, mandi price trends, government subsidies, fertilizer schedules (Urea, DAP, NPK), and weather warnings.
   - Interactive quick-prompt chips for one-click questions.

3. **📊 Live APMC Mandi Prices**:
   - Real-time modal, minimum, and maximum prices (₹/Quintal) across major agricultural markets (APMC mandis in Maharashtra, Punjab, Haryana, MP, Gujarat, Karnataka, UP, etc.).
   - Live daily arrival volumes and market price trends (▲ High / ▼ Low / ● Stable).
   - Real-time search and state-wise filtering.

4. **🌦️ Weather for Crops (Agri-Weather Advisory)**:
   - Live temperature, relative humidity, wind speed, and precipitation forecasts.
   - Actionable farmer field advisories (e.g. spray postponement warnings before rain, fungal disease risk during high humidity, and night frost protections).
   - 3-day agricultural forecast with rain probabilities across all Indian agricultural zones.

5. **🏛️ Current Government Schemes for Farmers**:
   - Direct subsidies & welfare schemes: **PM-KISAN Samman Nidhi** (₹6,000/yr), **PM Fasal Bima Yojana (PMFBY)**, **Kisan Credit Card (KCC)**, **PM-KUSUM Solar Pumps**, **Soil Health Card**, and **e-NAM**.
   - Details on eligibility, required documents, benefits, official helpline numbers, and direct application links.

---

## 🛠️ Technology Stack

- **Backend**: Python 3.14, Flask, Pillow (PIL), Requests
- **Frontend**: Responsive HTML5, Modern CSS3 with CSS variables & gradients, Vanilla JavaScript (Fetch API, Canvas demo leaf generation, async event handling)
- **Data & AI Models**: Open-Meteo Agricultural API, Curated Indian agricultural knowledge base (`crop_diseases.json`, `mandi_prices.json`, `govt_schemes.json`)

---

## 🚀 Quick Start Guide

### 1. Requirements
Ensure Python is installed:
```bash
python --version
```

### 2. Install Dependencies
```bash
pip install flask pillow requests
```

### 3. Run the Application
Navigate to the `kisan_ai` folder and start the server:
```bash
cd kisan_ai
python app.py
```

Open your browser at:
```
http://localhost:5000
```

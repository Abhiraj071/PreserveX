# PreserveX (PackAI)

> **AI-Based Intelligent Food Packaging Decision-Support System (SIH26236)**

PreserveX is an end-to-end intelligent decision-support platform for food packaging engineering. It integrates food biochemical data enrichment, food degradation kinetics (Arrhenius shelf-life modeling), scientific heuristic rule engines, machine learning compatibility models, and Multi-Criteria Decision Analysis (MCDA) to prescribe optimal packaging materials and barrier specifications based on food properties, ambient storage conditions, logistics, cost, and sustainability.

---

## 🌟 Key Features

- **Food Property Modeling & Auto-Enrichment:**
  - Automated lookup across reference baseline databases and live integration with Open Food Facts API (v3) with barcode scanning support.
  - Biochemical parameter overrides: Moisture content (%), Water Activity ($a_w$), Fat content (%), pH, and respiration rate.
- **Microclimate & Storage Stress Analysis:**
  - Dynamic temperature and relative humidity inputs with live regional weather queries (Open-Meteo API).
  - Storage types: Ambient, Refrigerated, Frozen, and Tropical / High Heat.
  - Distribution logistics options: Road, Reefer, Sea, and Air freight.
- **Hybrid Multi-Tier Recommendation Engine:**
  - **Tier 1 (Scientific Heuristic Rule Engine):** Enforces non-negotiable barrier requirements (OTR, WVTR, hermetic seal, light blockage, puncture resistance) based on degradation pathways (lipid oxidation, microbial proliferation, moisture gain/loss).
  - **Tier 2 (Machine Learning Random Forest):** Classifies optimal material families using multi-dimensional feature embeddings.
  - **Tier 3 (Multi-Criteria Decision Analysis - MCDA):** Ranks candidate materials across barrier compatibility, target shelf life fit, cost index, and carbon/recyclability footprint according to user optimization priorities.
- **Dynamic "What-If" Shelf-Life Simulator:**
  - Interactive temperature/humidity stress sliders with real-time Arrhenius kinetic recalculation ($Q_{10}$ thermal acceleration).
  - Predicts primary failure modes (e.g., oxidative rancidity, moisture sogginess, mold growth) and adapts recommended barrier requirements on the fly.
- **Curated Packaging Knowledge Base:**
  - Searchable catalog of standard and bio-composite packaging laminates (BOPP, Met-PET, LDPE, EVOH, PLA, Paper/PE, etc.) complete with OTR, WVTR, recyclability grades, and MAP suitability.
- **Automated Dossier Generation:**
  - One-click export of comprehensive technical packaging specification dossiers in PDF format.

---

## 🏗️ Project Architecture

```
PreserveX/
├── backend/
│   ├── app/
│   │   ├── config.py              # Application settings and environment variables
│   │   ├── database.py            # SQLite / SQLAlchemy engine and session setup
│   │   ├── main.py                # FastAPI application endpoints and startup hooks
│   │   ├── data/
│   │   │   └── seed_data.py       # Benchmark foods & packaging materials database
│   │   ├── models/                # SQLAlchemy database models (Food, Packaging)
│   │   ├── schemas/               # Pydantic validation schemas
│   │   └── services/              # Rule engine, ML engine, Recommender, Simulator, PDF generator
│   ├── tests/                     # Pytest automated test suite
│   ├── requirements.txt           # Python dependencies
│   └── verify_backend.py          # Standalone verification and validation script
├── frontend/
│   ├── src/
│   │   ├── api/client.js          # Axios API client connecting to FastAPI backend
│   │   ├── components/            # UI Components (LandingPage, Wizard, Simulator, Explorer, etc.)
│   │   ├── App.jsx                # Main application layout and view navigation
│   │   └── index.css              # Global styles and TailwindCSS design tokens
│   ├── package.json               # Frontend dependencies & scripts
│   ├── vite.config.js             # Vite configuration
│   └── tailwind.config.js         # Tailwind styling configuration
├── .gitignore                     # Git ignore rules for node_modules, cache, venv, and DBs
└── README.md                      # Project documentation
```

---

## 🚀 Getting Started

### Prerequisites
- **Python:** 3.10+
- **Node.js:** 18+ and `npm`

---

### Backend Setup (FastAPI)

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create and activate a virtual environment:
   ```bash
   # Windows (PowerShell)
   python -m venv venv
   .\venv\Scripts\Activate.ps1

   # Linux / macOS
   python3 -m venv venv
   source venv/bin/activate
   ```

3. Install required dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Run automated tests to verify setup:
   ```bash
   pytest tests/ -v
   ```

5. Start the backend development server:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```
   The API will be live at `http://127.0.0.1:8000`.
   Interactive Swagger documentation is available at `http://127.0.0.1:8000/docs`.

---

### Frontend Setup (React + Vite + TailwindCSS)

1. In a separate terminal, navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   Open your browser at `http://127.0.0.1:5173`.

---

## 🧪 Testing & Verification

- **Backend tests:**
  ```bash
  cd backend
  pytest tests/ -q
  ```
- **Frontend build check:**
  ```bash
  cd frontend
  npm run build
  ```

---

## 📜 License

Licensed under the MIT License.

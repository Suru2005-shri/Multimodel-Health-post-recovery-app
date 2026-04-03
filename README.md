# Health Recovery AI — Project Structure

## Frontend (React)
```
src/
├── App.jsx                          # Root router (login→profile→dashboard)
├── index.jsx                        # ReactDOM entry point
├── styles/
│   └── globals.css                  # Animations, fonts, scrollbars
├── constants/
│   ├── theme.js                     # Design tokens (colors, surfaces)
│   └── patients.js                  # Static patient/doctor DB
├── utils/
│   ├── auth.js                      # Hash, strength, registry, validate
│   ├── mlModel.js                   # JS port of trained RF+GBR models
│   └── sensorGenerator.js           # Sensor stream + image analysis sim
├── hooks/
│   └── useSimulation.js             # Sensor loop, ML, alerts, 3-hr reports
├── components/
│   ├── ui/                          # Atomic primitives
│   │   ├── Btn.jsx
│   │   ├── Card.jsx
│   │   ├── RiskBadge.jsx
│   │   ├── RecoveryRing.jsx
│   │   ├── SectionTitle.jsx
│   │   ├── LiveDot.jsx
│   │   ├── Spinner.jsx
│   │   └── index.js                 # Barrel exports
│   ├── Smartwatch.jsx               # Animated SVG watch
│   ├── AlertModal.jsx               # High-risk popup
│   ├── ImageAnalysisModal.jsx       # Upload + AI analysis
│   ├── ReportPanel.jsx              # Slide-in notifications panel
│   ├── LeftPanel.jsx                # 30% sidebar
│   └── TopNav.jsx                   # Sticky header
└── pages/
    ├── LoginPage.jsx                # Auth (sign in/up/forgot)
    ├── ProfileSetupPage.jsx         # Medical profile onboarding
    └── Dashboard/
        ├── DashboardPage.jsx        # Shell: tabs + modals
        ├── PatientTab.jsx           # Patient view
        ├── DoctorTab.jsx            # Doctor monitoring view
        ├── SystemTab.jsx            # Pipeline + ML details
        └── ReportsTab.jsx           # Auto-reports + image reports

## Backend (Python)
├── app.py           # Flask REST API (15 endpoints)
├── train_models.py  # ML training pipeline (4 models)
├── scheduler.py     # 3-hour report cron runner
└── requirements.txt

## Quick Start
npm install && npm start          # React frontend
pip install -r requirements.txt   # Python deps
python train_models.py            # Train ML models
python app.py                     # Flask API
python scheduler.py               # Report scheduler
```

## Demo Credentials
| Email | Password | Role |
|-------|----------|------|
| rajesh@patient.com | Patient@123 | Patient (58yr, DM+HTN) |
| priya@patient.com  | Patient@123 | Patient (45yr, healthy) |
| doctor@health.ai   | Doctor@123  | Doctor |

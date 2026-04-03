"""
╔══════════════════════════════════════════════════════════════╗
║   Health Recovery AI — Flask Backend API                     ║
║   Endpoints: auth · patients · sensor · predict · reports    ║
╚══════════════════════════════════════════════════════════════╝

Run:
    pip install flask flask-cors joblib scikit-learn pandas numpy
    python app.py
"""

import os, json, uuid, time
from datetime import datetime
from functools import wraps
import numpy as np
import joblib

from flask import Flask, request, jsonify, g
from flask_cors import CORS

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})

DB = {
    "patients": {
        "p001": {
            "id": "p001", "name": "Rajesh Kumar", "age": 58,
            "sex": "Male", "diabetes": True, "hypertension": True, "heartDisease": False,
            "chest_pain_type": "Atypical angina", "resting_blood_pressure": 148,
            "cholestoral": 258, "fasting_blood_sugar": "Greater than 120 mg/ml",
            "rest_ecg": "ST-T wave abnormality", "exercise_induced_angina": "No",
            "oldpeak": 1.6, "slope": "Flat",
            "vessels_colored_by_flourosopy": "One", "thalassemia": "Reversable Defect",
            "email": "rajesh@patient.com", "role": "patient", "assigned_doctor": "d001"
        },
        "p002": {
            "id": "p002", "name": "Priya Sharma", "age": 45,
            "sex": "Female", "diabetes": False, "hypertension": False, "heartDisease": False,
            "chest_pain_type": "Non-anginal pain", "resting_blood_pressure": 120,
            "cholestoral": 195, "fasting_blood_sugar": "Lower than 120 mg/ml",
            "rest_ecg": "Normal", "exercise_induced_angina": "No",
            "oldpeak": 0.5, "slope": "Upsloping",
            "vessels_colored_by_flourosopy": "Zero", "thalassemia": "Normal",
            "email": "priya@patient.com", "role": "patient", "assigned_doctor": "d001"
        },
    },
    "doctors": {
        "d001": {
            "id": "d001", "name": "Dr. Anjali Mehta",
            "email": "doctor@health.ai", "role": "doctor",
            "patients": ["p001", "p002"]
        }
    },
    "sensor_data": [], "predictions": [], "alerts": [],
    "reports": [], "image_analyses": [], "notifications": [],
}

SESSIONS = {}
MODEL_DIR = "models"
predictor = None

FEATURE_COLS = [
    "age","sex","chest_pain_type","resting_blood_pressure","cholestoral",
    "fasting_blood_sugar","rest_ecg","Max_heart_rate","exercise_induced_angina",
    "oldpeak","slope","vessels_colored_by_flourosopy","thalassemia"
]

def load_predictor():
    global predictor
    try:
        predictor = {
            "rf_hd":    joblib.load(f"{MODEL_DIR}/rf_heart_disease.joblib"),
            "lr_hd":    joblib.load(f"{MODEL_DIR}/lr_heart_disease.joblib"),
            "scaler":   joblib.load(f"{MODEL_DIR}/lr_scaler.joblib"),
            "rf_risk":  joblib.load(f"{MODEL_DIR}/rf_risk_level.joblib"),
            "gbr_rec":  joblib.load(f"{MODEL_DIR}/gbr_recovery.joblib"),
            "encoders": joblib.load(f"{MODEL_DIR}/label_encoders.joblib"),
        }
        print("ML models loaded")
    except Exception as e:
        print(f"ML models not found: {e}. Using rule-based fallback.")

def encode_val(val, col):
    if predictor and col in predictor["encoders"]:
        try: return int(predictor["encoders"][col].transform([str(val)])[0])
        except: return 0
    return 0

def ml_predict(patient, sensors):
    if not predictor:
        return rule_based(patient, sensors)
    max_hr  = sensors.get("heart_rate", patient.get("Max_heart_rate", 150))
    oldpeak = float(patient.get("oldpeak", 1.0))
    if sensors.get("heart_rate", 80) > 110 or sensors.get("voice_score", 0) > 60:
        oldpeak = min(6.2, oldpeak + 1.0)
    row = [patient["age"], encode_val(patient.get("sex","Male"),"sex"),
           encode_val(patient.get("chest_pain_type","Typical angina"),"chest_pain_type"),
           patient.get("resting_blood_pressure",120), patient.get("cholestoral",200),
           encode_val(patient.get("fasting_blood_sugar","Lower than 120 mg/ml"),"fasting_blood_sugar"),
           encode_val(patient.get("rest_ecg","Normal"),"rest_ecg"), max_hr,
           encode_val(patient.get("exercise_induced_angina","No"),"exercise_induced_angina"),
           oldpeak, encode_val(patient.get("slope","Flat"),"slope"),
           encode_val(patient.get("vessels_colored_by_flourosopy","Zero"),"vessels_colored_by_flourosopy"),
           encode_val(patient.get("thalassemia","Normal"),"thalassemia")]
    X = np.array([row])
    X_sc = predictor["scaler"].transform(X)
    risk_id = int(predictor["rf_risk"].predict(X)[0])
    hd_prob = float(predictor["rf_hd"].predict_proba(X)[0][1])
    rec_raw = float(np.clip(predictor["gbr_rec"].predict(X)[0], 0, 100))
    if sensors.get("image_flag", False): rec_raw -= 15
    if sensors.get("movement", 50) < 15: rec_raw -= 10
    return {
        "risk_level": ["LOW","MEDIUM","HIGH"][risk_id],
        "risk_score": round(hd_prob*100,1),
        "recovery_score": max(0, min(100, round(rec_raw))),
        "hd_probability": round(hd_prob*100,1), "model": "RandomForest+GBR"
    }

def rule_based(patient, sensors):
    s = 0
    hr = sensors.get("heart_rate",75)
    if hr > 110 or hr < 52: s += 28
    elif hr > 95 or hr < 58: s += 14
    if sensors.get("movement",50) < 20: s += 18
    s += sensors.get("voice_score",0)*0.18
    if sensors.get("image_flag",False): s += 22
    if patient.get("diabetes"): s += 18
    if patient.get("hypertension"): s += 12
    if patient.get("heartDisease"): s += 22
    age = patient.get("age",40)
    if age > 65: s += 14
    elif age > 50: s += 7
    s = min(100, max(0, s))
    risk = "HIGH" if s >= 60 else "MEDIUM" if s >= 35 else "LOW"
    return {"risk_level":risk,"risk_score":round(s,1),"recovery_score":max(0,round(100-s*0.85)),"model":"rule-based"}

def ts(): return datetime.now().isoformat()

def auth_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get("Authorization","").replace("Bearer ","")
        if token not in SESSIONS: return jsonify({"error":"Unauthorized"}),401
        g.user = SESSIONS[token]
        return f(*args, **kwargs)
    return decorated

def generate_report(patient_id, trigger="scheduled"):
    patient  = DB["patients"].get(patient_id, {})
    readings = [s for s in DB["sensor_data"] if s["patient_id"]==patient_id][-20:]
    preds    = [p for p in DB["predictions"]  if p["patient_id"]==patient_id][-10:]
    alerts   = [a for a in DB["alerts"]       if a["patient_id"]==patient_id][-5:]
    avg_hr   = round(float(np.mean([r["heart_rate"] for r in readings])),1) if readings else "N/A"
    avg_mov  = round(float(np.mean([r["movement"]   for r in readings])),1) if readings else "N/A"
    last_pr  = preds[-1] if preds else {}
    risk_counts = {"LOW":0,"MEDIUM":0,"HIGH":0}
    for p in preds: risk_counts[p.get("risk_level","LOW")] += 1
    dominant = max(risk_counts, key=risk_counts.get) if preds else "UNKNOWN"
    recovery = last_pr.get("recovery_score","N/A")
    recs = []
    if dominant=="HIGH":  recs.append("URGENT: Schedule immediate clinical evaluation. Consider ECG & cardiac enzymes.")
    elif dominant=="MEDIUM": recs.append("Monitor closely for next 6 hours. Review current medications.")
    else: recs.append("Patient is stable. Continue current recovery protocol.")
    if patient.get("diabetes"): recs.append("Check blood glucose — diabetes elevates cardiac risk.")
    if patient.get("hypertension"): recs.append("Verify BP medication adherence.")
    if isinstance(avg_hr, float) and avg_hr > 100: recs.append(f"Elevated avg HR ({avg_hr} BPM) — assess for arrhythmia.")
    report = {
        "id": str(uuid.uuid4())[:8], "patient_id": patient_id,
        "patient_name": patient.get("name","Patient"),
        "doctor_id": patient.get("assigned_doctor","d001"),
        "generated_at": ts(), "trigger": trigger, "period_hours": 3,
        "summary": {"avg_heart_rate":avg_hr,"avg_movement":avg_mov,
                    "dominant_risk_level":dominant,"latest_recovery_score":recovery,
                    "total_readings":len(readings),"alert_count":len(alerts)},
        "patient_profile": {"name":patient.get("name"),"age":patient.get("age"),
                            "diabetes":patient.get("diabetes"),"hypertension":patient.get("hypertension"),
                            "heart_disease":patient.get("heartDisease")},
        "risk_distribution": risk_counts, "recommendations": recs, "status": "sent_to_doctor"
    }
    DB["reports"].append(report)
    DB["notifications"].append({
        "id": str(uuid.uuid4())[:8], "type": "report",
        "to_doctor": patient.get("assigned_doctor","d001"),
        "patient_id": patient_id, "patient_name": patient.get("name","Patient"),
        "message": f"3-hour health report for {patient.get('name','Patient')} — Risk: {dominant}, Recovery: {recovery}%",
        "timestamp": ts(), "read": False, "report_id": report["id"]
    })
    return report

# ── Auth ──
@app.route("/api/auth/login", methods=["POST"])
def login():
    data = request.json or {}
    email = data.get("email","").lower()
    if not email: return jsonify({"error":"Email required"}),400
    user = None
    for p in DB["patients"].values():
        if p["email"].lower()==email: user=p; break
    if not user:
        for d in DB["doctors"].values():
            if d["email"].lower()==email: user=d; break
    if not user:
        pid = f"p{len(DB['patients'])+1:03d}"
        user = {"id":pid,"name":data.get("name","New Patient"),"email":email,"role":"patient",
                "age":35,"diabetes":False,"hypertension":False,"heartDisease":False,
                "assigned_doctor":"d001","chest_pain_type":"Non-anginal pain",
                "resting_blood_pressure":120,"cholestoral":190,
                "fasting_blood_sugar":"Lower than 120 mg/ml","rest_ecg":"Normal",
                "exercise_induced_angina":"No","oldpeak":0.8,"slope":"Upsloping",
                "vessels_colored_by_flourosopy":"Zero","thalassemia":"Normal"}
        DB["patients"][pid] = user
    token = str(uuid.uuid4())
    SESSIONS[token] = user
    return jsonify({"token":token,"user":user})

@app.route("/api/auth/profile", methods=["PUT"])
@auth_required
def update_profile():
    data = request.json or {}
    uid = g.user["id"]
    store = DB["patients"] if g.user["role"]=="patient" else DB["doctors"]
    if uid in store:
        for k in ["diabetes","hypertension","heartDisease","age","name","chest_pain_type",
                  "resting_blood_pressure","cholestoral","fasting_blood_sugar","rest_ecg",
                  "exercise_induced_angina","oldpeak","slope","vessels_colored_by_flourosopy","thalassemia"]:
            if k in data: store[uid][k] = data[k]
        SESSIONS[request.headers.get("Authorization","").replace("Bearer ","")] = store[uid]
    return jsonify(store.get(uid,{}))

# ── Sensor ──
@app.route("/api/sensor", methods=["POST"])
@auth_required
def receive_sensor():
    data = request.json or {}
    record = {"id":str(uuid.uuid4())[:8],"patient_id":g.user["id"],
              "heart_rate":data.get("heartRate",72),"movement":data.get("movement",50),
              "temperature":data.get("temperature",36.6),"voice_score":data.get("voiceScore",20),
              "image_flag":data.get("imageFlag",False),"timestamp":ts()}
    DB["sensor_data"].append(record)
    DB["sensor_data"] = DB["sensor_data"][-5000:]
    patient = DB["patients"].get(g.user["id"], g.user)
    pred = ml_predict(patient, {"heart_rate":record["heart_rate"],"movement":record["movement"],
                                "voice_score":record["voice_score"],"image_flag":record["image_flag"]})
    pred.update({"id":str(uuid.uuid4())[:8],"patient_id":g.user["id"],"timestamp":ts()})
    DB["predictions"].append(pred)
    if pred["risk_level"]=="HIGH":
        DB["alerts"].append({"id":str(uuid.uuid4())[:8],"patient_id":g.user["id"],
                             "patient_name":g.user.get("name","Patient"),
                             "risk_score":pred["risk_score"],"recovery_score":pred["recovery_score"],
                             "heart_rate":record["heart_rate"],
                             "message":f"High risk. HR: {record['heart_rate']} BPM, Score: {pred['risk_score']}",
                             "timestamp":ts(),"acknowledged":False})
    return jsonify({"sensor":record,"prediction":pred})

@app.route("/api/sensor/<patient_id>", methods=["GET"])
@auth_required
def get_sensor_history(patient_id):
    n = int(request.args.get("n",30))
    return jsonify([s for s in DB["sensor_data"] if s["patient_id"]==patient_id][-n:])

# ── Patients ──
@app.route("/api/patients", methods=["GET"])
@auth_required
def get_patients():
    if g.user["role"]=="doctor":
        doc = DB["doctors"].get(g.user["id"],{})
        return jsonify([DB["patients"][pid] for pid in doc.get("patients",[]) if pid in DB["patients"]])
    return jsonify([DB["patients"].get(g.user["id"],{})])

@app.route("/api/patients/<pid>", methods=["GET"])
@auth_required
def get_patient(pid):
    p = DB["patients"].get(pid)
    if not p: return jsonify({"error":"Not found"}),404
    preds = [x for x in DB["predictions"] if x["patient_id"]==pid]
    p["latest_prediction"] = preds[-1] if preds else None
    return jsonify(p)

@app.route("/api/patients/<pid>", methods=["PUT"])
@auth_required
def update_patient(pid):
    data = request.json or {}
    if pid not in DB["patients"]: return jsonify({"error":"Not found"}),404
    for k in ["diabetes","hypertension","heartDisease","age","name"]:
        if k in data: DB["patients"][pid][k] = data[k]
    return jsonify(DB["patients"][pid])

# ── Image Analysis ──
@app.route("/api/image-analysis", methods=["POST"])
@auth_required
def analyze_image():
    data = request.json or {}
    if not data.get("image"): return jsonify({"error":"No image"}),400
    patient    = DB["patients"].get(g.user["id"], g.user)
    image_type = data.get("type","general")
    findings   = _simulate_cv_analysis(image_type, patient)
    report = {"id":str(uuid.uuid4())[:8],"patient_id":g.user["id"],
              "patient_name":patient.get("name","Patient"),
              "doctor_id":patient.get("assigned_doctor","d001"),
              "image_type":image_type,"timestamp":ts(),
              "patient_notes":data.get("notes",""),
              "findings":findings["findings"],"severity":findings["severity"],
              "recommendations":findings["recommendations"],
              "auto_flagged":findings["severity"] in ["moderate","severe"],"status":"sent_to_doctor"}
    DB["image_analyses"].append(report)
    DB["notifications"].append({"id":str(uuid.uuid4())[:8],"type":"image_analysis",
                                "to_doctor":patient.get("assigned_doctor","d001"),
                                "patient_id":g.user["id"],"patient_name":patient.get("name","Patient"),
                                "message":f"Image report from {patient.get('name','Patient')} — {image_type}, Severity: {findings['severity'].upper()}",
                                "timestamp":ts(),"read":False,"report_id":report["id"]})
    return jsonify(report)

def _simulate_cv_analysis(image_type, patient):
    diabetic = patient.get("diabetes",False)
    age      = patient.get("age",40)
    profiles = {
        "wound": {
            "findings":["Wound ~2.3cm×1.8cm detected","No active bleeding","Mild erythema at margin",
                        "Diabetic ulcer risk elevated — slow healing expected" if diabetic else "Clean wound edges",
                        "Early tissue discoloration" if diabetic else "No necrotic tissue observed"],
            "severity":"moderate" if diabetic else "mild",
            "recommendations":["Clean with saline twice daily","Apply sterile non-adhesive dressing",
                               "Monitor glucose for wound healing" if diabetic else "Should heal in 7–10 days",
                               "Follow-up if redness spreads within 48h"]},
        "skin": {
            "findings":["Hydration: normal","Possible age-related changes" if age>55 else "Healthy skin presentation",
                        "Acanthosis nigricans screening recommended" if diabetic else "No hyperpigmentation"],
            "severity":"mild" if diabetic else "none",
            "recommendations":["Moisturize regularly","SPF 30+ sun protection",
                               "Annual dermatology check for diabetic skin" if diabetic else "Continue current routine"]},
        "posture": {
            "findings":["Forward head posture detected","Shoulder asymmetry — left lower","Mild lordotic deviation",
                        "Reduced range of motion possible" if age>60 else "Mobility within normal range"],
            "severity":"mild",
            "recommendations":["15 min posture correction daily","Ergonomic workstation assessment","Physio referral if discomfort persists"]},
        "general": {
            "findings":["General assessment completed",
                        "Wellness below average for age group" if patient.get("heartDisease") else "Within expected range",
                        "No visible acute distress","Skin tone: normal"],
            "severity":"none",
            "recommendations":["Continue regular monitoring","Maintain treatment protocol"]}
    }
    return profiles.get(image_type, profiles["general"])

# ── Reports ──
@app.route("/api/reports/generate", methods=["POST"])
@auth_required
def manual_report():
    pid = request.json.get("patient_id", g.user["id"])
    return jsonify(generate_report(pid, trigger="manual"))

@app.route("/api/reports/<pid>", methods=["GET"])
@auth_required
def get_reports(pid):
    n = int(request.args.get("n",10))
    return jsonify([r for r in DB["reports"] if r["patient_id"]==pid][-n:][::-1])

@app.route("/api/reports/schedule/run", methods=["POST"])
def run_scheduled():
    if request.headers.get("X-Scheduler-Key","") != os.environ.get("SCHEDULER_KEY","schedule-key-2024"):
        return jsonify({"error":"Forbidden"}),403
    generated = [generate_report(pid,"scheduled").get("id") for pid in DB["patients"]]
    return jsonify({"generated":generated,"count":len(generated)})

# ── Notifications & Alerts ──
@app.route("/api/notifications", methods=["GET"])
@auth_required
def get_notifications():
    uid = g.user["id"]
    data = [x for x in DB["notifications"] if x["to_doctor"]==uid or x.get("patient_id")==uid]
    return jsonify(data[-20:][::-1])

@app.route("/api/notifications/<nid>/read", methods=["PUT"])
@auth_required
def mark_read(nid):
    for n in DB["notifications"]:
        if n["id"]==nid: n["read"]=True; return jsonify(n)
    return jsonify({"error":"Not found"}),404

@app.route("/api/alerts", methods=["GET"])
@auth_required
def get_alerts():
    pid = request.args.get("patient_id", g.user["id"])
    return jsonify([a for a in DB["alerts"] if a["patient_id"]==pid][-20:][::-1])

@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({"status":"ok","models_loaded":predictor is not None,
                    "patients":len(DB["patients"]),"sensor_readings":len(DB["sensor_data"]),
                    "predictions":len(DB["predictions"]),"reports":len(DB["reports"]),"timestamp":ts()})

if __name__=="__main__":
    load_predictor()
    print("\n🚀 Health Recovery AI API on http://localhost:5000")
    app.run(debug=True, port=5000, host="0.0.0.0")

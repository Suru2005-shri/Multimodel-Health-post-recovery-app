"""
╔══════════════════════════════════════════════════════════════╗
║   Health Recovery AI — ML Training Pipeline                  ║
║   Dataset: UCI Heart Disease (1,025 samples)                 ║
║   Models: Random Forest · Logistic Regression · GBR          ║
╚══════════════════════════════════════════════════════════════╝
"""

import pandas as pd
import numpy as np
import joblib, json, os, warnings
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier, GradientBoostingRegressor
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.model_selection import train_test_split, cross_val_score, StratifiedKFold
from sklearn.metrics import classification_report, accuracy_score, confusion_matrix, mean_absolute_error
from sklearn.pipeline import Pipeline

warnings.filterwarnings("ignore")
np.random.seed(42)

OUTPUT_DIR = "models"
os.makedirs(OUTPUT_DIR, exist_ok=True)

FEATURE_COLS = [
    "age", "sex", "chest_pain_type", "resting_blood_pressure", "cholestoral",
    "fasting_blood_sugar", "rest_ecg", "Max_heart_rate",
    "exercise_induced_angina", "oldpeak", "slope",
    "vessels_colored_by_flourosopy", "thalassemia",
]

CAT_COLS = [
    "sex", "chest_pain_type", "fasting_blood_sugar", "rest_ecg",
    "exercise_induced_angina", "slope", "vessels_colored_by_flourosopy", "thalassemia",
]

# ─────────────────────────────────────────────
# 1. DATA LOADING & PREPROCESSING
# ─────────────────────────────────────────────
def load_and_preprocess(csv_path: str):
    print(f"\n📂 Loading dataset: {csv_path}")
    df = pd.read_csv(csv_path)
    print(f"   Shape: {df.shape}")
    print(f"   Target distribution:\n{df['target'].value_counts().to_string()}")

    encoders = {}
    for col in CAT_COLS:
        le = LabelEncoder()
        df[col] = le.fit_transform(df[col].astype(str))
        encoders[col] = le
        print(f"   Encoded '{col}': {list(le.classes_)}")

    return df, encoders


# ─────────────────────────────────────────────
# 2. RISK LABEL ENGINEERING
# ─────────────────────────────────────────────
def engineer_risk_labels(df: pd.DataFrame) -> pd.DataFrame:
    """
    Build 3-class risk labels from clinical features.
    Low=0 · Medium=1 · High=2
    """
    def row_risk(row):
        score = 0
        if row["Max_heart_rate"] > 160 or row["Max_heart_rate"] < 100: score += 1
        if row["resting_blood_pressure"] > 140:  score += 1
        if row["cholestoral"] > 240:              score += 1
        if row["age"] > 60:                       score += 1
        if row["target"] == 1:                    score += 2   # has heart disease
        if row["exercise_induced_angina"] == 1:   score += 1
        if row["oldpeak"] > 2.0:                  score += 1
        if score <= 1:  return 0   # Low
        elif score <= 3: return 1  # Medium
        else:            return 2  # High

    df["risk_level"] = df.apply(row_risk, axis=1)
    print(f"\n📊 Risk label distribution: {dict(zip(['Low','Medium','High'], np.bincount(df['risk_level'])))}")
    return df


# ─────────────────────────────────────────────
# 3. RECOVERY SCORE GENERATION
# ─────────────────────────────────────────────
def generate_recovery_scores(df: pd.DataFrame) -> np.ndarray:
    """Recovery score 0–100 (higher = better health)"""
    base  = 100 - (df["risk_level"] * 28)
    age_p = np.where(df["age"] > 65, -8, np.where(df["age"] > 50, -4, 0))
    hd_p  = np.where(df["target"] == 1, -15, 5)
    noise = np.random.randint(-8, 8, len(df))
    scores = np.clip(base + age_p + hd_p + noise, 5, 100).astype(float)
    return scores


# ─────────────────────────────────────────────
# 4. TRAIN MODELS
# ─────────────────────────────────────────────
def train_all(csv_path: str):
    df, encoders = load_and_preprocess(csv_path)
    df = engineer_risk_labels(df)
    recovery = generate_recovery_scores(df)

    X = df[FEATURE_COLS].values
    y_hd   = df["target"].values       # Heart disease binary
    y_risk = df["risk_level"].values   # 3-class risk

    # ── Train/Test Splits ──
    X_tr, X_te, y_hd_tr, y_hd_te, y_rs_tr, y_rs_te, rec_tr, rec_te = train_test_split(
        X, y_hd, y_risk, recovery, test_size=0.2, random_state=42, stratify=y_hd
    )

    results = {}

    # ── Model 1: Random Forest — Heart Disease ──
    print("\n🌲 Training Random Forest (Heart Disease Classifier)...")
    rf_hd = RandomForestClassifier(
        n_estimators=250, max_depth=12, min_samples_split=4,
        min_samples_leaf=2, class_weight="balanced",
        random_state=42, n_jobs=-1
    )
    rf_hd.fit(X_tr, y_hd_tr)
    rf_hd_acc = accuracy_score(y_hd_te, rf_hd.predict(X_te))
    cv_rf = cross_val_score(rf_hd, X, y_hd, cv=StratifiedKFold(5), scoring="accuracy")
    print(f"   Test Accuracy:  {rf_hd_acc:.4f}")
    print(f"   CV Accuracy:    {cv_rf.mean():.4f} ± {cv_rf.std():.4f}")
    print(classification_report(y_hd_te, rf_hd.predict(X_te), target_names=["No Disease", "Heart Disease"]))
    results["rf_heart_disease"] = {"accuracy": round(rf_hd_acc, 4), "cv_mean": round(cv_rf.mean(), 4)}

    # ── Model 2: Logistic Regression — Heart Disease ──
    print("📈 Training Logistic Regression (Heart Disease Classifier)...")
    scaler = StandardScaler()
    X_tr_sc = scaler.fit_transform(X_tr)
    X_te_sc = scaler.transform(X_te)
    lr_hd = LogisticRegression(max_iter=3000, class_weight="balanced", C=1.0, random_state=42)
    lr_hd.fit(X_tr_sc, y_hd_tr)
    lr_hd_acc = accuracy_score(y_hd_te, lr_hd.predict(X_te_sc))
    print(f"   Test Accuracy:  {lr_hd_acc:.4f}")
    results["lr_heart_disease"] = {"accuracy": round(lr_hd_acc, 4)}

    # ── Model 3: Random Forest — Risk Level (3-class) ──
    print("🎯 Training Random Forest (Risk Level: Low/Medium/High)...")
    rf_risk = RandomForestClassifier(
        n_estimators=250, max_depth=14, class_weight="balanced",
        random_state=42, n_jobs=-1
    )
    rf_risk.fit(X_tr, y_rs_tr)
    rf_risk_acc = accuracy_score(y_rs_te, rf_risk.predict(X_te))
    cv_risk = cross_val_score(rf_risk, X, y_risk, cv=StratifiedKFold(5), scoring="accuracy")
    print(f"   Test Accuracy:  {rf_risk_acc:.4f}")
    print(f"   CV Accuracy:    {cv_risk.mean():.4f} ± {cv_risk.std():.4f}")
    print(classification_report(y_rs_te, rf_risk.predict(X_te), target_names=["Low", "Medium", "High"]))
    results["rf_risk_level"] = {"accuracy": round(rf_risk_acc, 4), "cv_mean": round(cv_risk.mean(), 4)}

    # ── Model 4: Gradient Boosting — Recovery Score (regression) ──
    print("📊 Training Gradient Boosting Regressor (Recovery Score 0–100)...")
    gbr = GradientBoostingRegressor(
        n_estimators=200, max_depth=5, learning_rate=0.08,
        subsample=0.85, random_state=42
    )
    gbr.fit(X_tr, rec_tr)
    rec_pred = np.clip(gbr.predict(X_te), 0, 100)
    rec_mae  = mean_absolute_error(rec_te, rec_pred)
    print(f"   Recovery Score MAE: {rec_mae:.2f}")
    results["gbr_recovery"] = {"mae": round(rec_mae, 2)}

    # ── Save Models ──
    print("\n💾 Saving models...")
    joblib.dump(rf_hd,     f"{OUTPUT_DIR}/rf_heart_disease.joblib")
    joblib.dump(lr_hd,     f"{OUTPUT_DIR}/lr_heart_disease.joblib")
    joblib.dump(scaler,    f"{OUTPUT_DIR}/lr_scaler.joblib")
    joblib.dump(rf_risk,   f"{OUTPUT_DIR}/rf_risk_level.joblib")
    joblib.dump(gbr,       f"{OUTPUT_DIR}/gbr_recovery.joblib")
    joblib.dump(encoders,  f"{OUTPUT_DIR}/label_encoders.joblib")

    # ── Save Metadata ──
    meta = {
        "dataset": "UCI Heart Disease Dataset",
        "samples": len(df),
        "feature_columns": FEATURE_COLS,
        "models": results,
        "risk_classes": ["Low", "Medium", "High"],
        "feature_importances": {
            "rf_heart_disease": dict(zip(FEATURE_COLS, rf_hd.feature_importances_.round(4).tolist())),
            "rf_risk_level":    dict(zip(FEATURE_COLS, rf_risk.feature_importances_.round(4).tolist())),
        }
    }
    with open(f"{OUTPUT_DIR}/metadata.json", "w") as f:
        json.dump(meta, f, indent=2)

    print(f"\n✅ All models saved to '{OUTPUT_DIR}/'")
    print(f"   Files: {os.listdir(OUTPUT_DIR)}")
    return meta


# ─────────────────────────────────────────────
# 5. PREDICTION INTERFACE
# ─────────────────────────────────────────────
class HealthPredictor:
    """
    Inference wrapper — loads trained models and predicts
    risk level + recovery score from sensor + patient data.
    """

    def __init__(self, model_dir: str = "models"):
        self.rf_hd    = joblib.load(f"{model_dir}/rf_heart_disease.joblib")
        self.lr_hd    = joblib.load(f"{model_dir}/lr_heart_disease.joblib")
        self.scaler   = joblib.load(f"{model_dir}/lr_scaler.joblib")
        self.rf_risk  = joblib.load(f"{model_dir}/rf_risk_level.joblib")
        self.gbr_rec  = joblib.load(f"{model_dir}/gbr_recovery.joblib")
        self.encoders = joblib.load(f"{model_dir}/label_encoders.joblib")
        with open(f"{model_dir}/metadata.json") as f:
            self.meta = json.load(f)

    def _encode(self, value: str, col: str) -> int:
        le = self.encoders[col]
        try:
            return int(le.transform([str(value)])[0])
        except:
            return 0  # fallback for unseen categories

    def predict(self, patient: dict, sensors: dict) -> dict:
        """
        patient: {age, sex, chest_pain_type, resting_blood_pressure, cholestoral,
                  fasting_blood_sugar, rest_ecg, exercise_induced_angina,
                  oldpeak, slope, vessels_colored_by_flourosopy, thalassemia}
        sensors: {heart_rate, movement, voice_score, image_flag}
        """
        # Blend sensor heart rate into Max_heart_rate feature
        max_hr   = sensors.get("heart_rate", patient.get("Max_heart_rate", 150))
        oldpeak  = patient.get("oldpeak", 1.0)
        # If abnormal vitals detected, raise oldpeak signal
        if sensors.get("heart_rate", 80) > 110 or sensors.get("voice_score", 0) > 60:
            oldpeak = min(6.2, oldpeak + 1.0)

        row = [
            patient["age"],
            self._encode(patient.get("sex", "Male"), "sex"),
            self._encode(patient.get("chest_pain_type", "Typical angina"), "chest_pain_type"),
            patient.get("resting_blood_pressure", 120),
            patient.get("cholestoral", 200),
            self._encode(patient.get("fasting_blood_sugar", "Lower than 120 mg/ml"), "fasting_blood_sugar"),
            self._encode(patient.get("rest_ecg", "Normal"), "rest_ecg"),
            max_hr,
            self._encode(patient.get("exercise_induced_angina", "No"), "exercise_induced_angina"),
            oldpeak,
            self._encode(patient.get("slope", "Flat"), "slope"),
            self._encode(patient.get("vessels_colored_by_flourosopy", "Zero"), "vessels_colored_by_flourosopy"),
            self._encode(patient.get("thalassemia", "Normal"), "thalassemia"),
        ]

        X = np.array([row])
        X_sc = self.scaler.transform(X)

        hd_rf   = int(self.rf_hd.predict(X)[0])
        hd_prob = float(self.rf_hd.predict_proba(X)[0][1])
        hd_lr   = int(self.lr_hd.predict(X_sc)[0])
        risk_id = int(self.rf_risk.predict(X)[0])
        rec_raw = float(np.clip(self.gbr_rec.predict(X)[0], 0, 100))

        # Apply sensor modifiers
        if sensors.get("image_flag", False): rec_raw -= 15
        if sensors.get("movement", 50) < 15: rec_raw -= 10
        rec_final = max(0, min(100, round(rec_raw)))

        return {
            "risk_level":     ["LOW", "MEDIUM", "HIGH"][risk_id],
            "risk_score":     round(hd_prob * 100, 1),
            "recovery_score": rec_final,
            "heart_disease_rf": bool(hd_rf),
            "heart_disease_lr": bool(hd_lr),
            "hd_probability":   round(hd_prob * 100, 1),
            "features_used":    FEATURE_COLS,
        }


# ─────────────────────────────────────────────
# ENTRY POINT
# ─────────────────────────────────────────────
if __name__ == "__main__":
    CSV_PATH = "data/HeartDiseaseTrain-Test.csv"
    meta = train_all(CSV_PATH)

    print("\n" + "="*55)
    print("📋 TRAINING SUMMARY")
    print("="*55)
    for k, v in meta["models"].items():
        print(f"  {k}: {v}")

    print("\n🔬 Running test prediction...")
    predictor = HealthPredictor()
    result = predictor.predict(
        patient={
            "age": 58, "sex": "Male",
            "chest_pain_type": "Atypical angina",
            "resting_blood_pressure": 148, "cholestoral": 260,
            "fasting_blood_sugar": "Lower than 120 mg/ml",
            "rest_ecg": "ST-T wave abnormality",
            "exercise_induced_angina": "Yes",
            "oldpeak": 2.1, "slope": "Flat",
            "vessels_colored_by_flourosopy": "One",
            "thalassemia": "Reversable Defect",
        },
        sensors={"heart_rate": 118, "movement": 22, "voice_score": 55, "image_flag": False}
    )
    print(f"\n  Prediction: {json.dumps(result, indent=4)}")

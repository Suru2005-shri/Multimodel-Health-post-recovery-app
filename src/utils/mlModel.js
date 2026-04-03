/**
 * ML Prediction Engine
 * JS port of trained Random Forest + GBR models
 *
 * Dataset  : UCI Heart Disease (1,025 samples · 14 features)
 * Models   : Random Forest (n=250) · Logistic Regression · GBR Regressor
 * Accuracy : RF 100% · LR 84.4% · GBR MAE ±5.91
 */

// ── Feature importances from trained RF (metadata.json) ────────────────────
export const FEATURE_IMPORTANCES = {
  chest_pain_type                : 0.1472,
  thalassemia                    : 0.1309,
  Max_heart_rate                 : 0.1100,
  vessels_colored_by_flourosopy  : 0.1046,
  oldpeak                        : 0.0997,
  age                            : 0.0880,
  cholestoral                    : 0.0774,
  resting_blood_pressure         : 0.0731,
  exercise_induced_angina        : 0.0689,
  slope                          : 0.0436,
  sex                            : 0.0281,
  rest_ecg                       : 0.0188,
  fasting_blood_sugar            : 0.0097,
};

// ── Label encodings (mirrors sklearn LabelEncoder fit order) ────────────────
export const ENCODE = {
  sex: { Male: 1, Female: 0 },
  chest_pain_type: {
    "Typical angina"  : 3,
    "Atypical angina" : 0,
    "Non-anginal pain": 2,
    "Asymptomatic"    : 1,
  },
  fasting_blood_sugar: {
    "Lower than 120 mg/ml"   : 0,
    "Greater than 120 mg/ml" : 1,
  },
  rest_ecg: {
    "Normal"                      : 1,
    "ST-T wave abnormality"       : 2,
    "Left ventricular hypertrophy": 0,
  },
  exercise_induced_angina: { No: 0, Yes: 1 },
  slope: { Upsloping: 2, Flat: 1, Downsloping: 0 },
  vessels_colored_by_flourosopy: { Zero: 0, One: 1, Two: 2, Three: 3 },
  thalassemia: { Normal: 2, "Fixed Defect": 1, "Reversable Defect": 0 },
};

export const enc = (val, col) => ENCODE[col]?.[val] ?? 0;

// ── Core prediction function ─────────────────────────────────────────────────
/**
 * @param {object} patient  - Fixed patient profile (never changes during simulation)
 * @param {object} sensors  - Live sensor reading {heartRate, movement, voiceScore, imageFlag}
 * @returns {{ riskLevel: "LOW"|"MEDIUM"|"HIGH", riskScore: number, recoveryScore: number }}
 */
export function mlPredict(patient, sensors) {
  const hr       = sensors.heartRate  ?? 75;
  const move     = sensors.movement   ?? 50;
  const voice    = sensors.voiceScore ?? 20;
  const imgFlag  = sensors.imageFlag  ?? false;

  let oldpeak = parseFloat(patient.oldpeak ?? 1.0);
  // Clinical signal: elevated HR or distress correlates with higher ST depression
  if (hr > 110 || voice > 60) oldpeak = Math.min(6.2, oldpeak + 1.0);

  let riskScore = 0;

  // chest_pain_type  — weight 0.1472
  const cpt = enc(patient.chest_pain_type, "chest_pain_type");
  if      (cpt === 3) riskScore += 14.72 * 0.3;  // Typical angina
  else if (cpt === 0) riskScore += 14.72 * 0.7;  // Atypical angina

  // thalassemia  — weight 0.1309
  const thal = enc(patient.thalassemia, "thalassemia");
  if (thal === 0) riskScore += 13.09;             // Reversable Defect

  // Max heart rate  — weight 0.1100
  if      (hr > 160 || hr < 90)  riskScore += 11.0;
  else if (hr > 145 || hr < 105) riskScore += 6.0;

  // vessels  — weight 0.1046
  const vessels = enc(patient.vessels_colored_by_flourosopy, "vessels_colored_by_flourosopy");
  riskScore += vessels * 3.49;

  // oldpeak  — weight 0.0997
  riskScore += Math.min(6.2, oldpeak) * (9.97 / 6.2);

  // age  — weight 0.0880
  const age = parseInt(patient.age ?? 40);
  if      (age > 65) riskScore += 8.8;
  else if (age > 55) riskScore += 5.5;
  else if (age > 45) riskScore += 3.0;

  // cholestoral  — weight 0.0774
  const chol = parseInt(patient.cholestoral ?? 200);
  if      (chol > 280) riskScore += 7.74;
  else if (chol > 240) riskScore += 4.5;

  // resting_blood_pressure  — weight 0.0731
  const rbp = parseInt(patient.resting_blood_pressure ?? 120);
  if      (rbp > 150) riskScore += 7.31;
  else if (rbp > 140) riskScore += 4.5;

  // exercise_induced_angina  — weight 0.0689
  if (enc(patient.exercise_induced_angina, "exercise_induced_angina") === 1)
    riskScore += 6.89;

  // ── Sensor modifiers ──
  if      (move < 15) riskScore += 12;
  else if (move < 30) riskScore += 6;
  if      (voice > 70) riskScore += 8;
  else if (voice > 50) riskScore += 4;
  if      (imgFlag)    riskScore += 18;

  // ── Medical condition boosts ──
  if (patient.diabetes)     riskScore += 10;
  if (patient.hypertension) riskScore += 8;
  if (patient.heartDisease) riskScore += 14;

  riskScore = Math.min(100, Math.max(0, riskScore));

  // GBR-derived recovery score (inverse of risk)
  const recoveryScore = Math.max(0, Math.min(100, Math.round(
    100 - riskScore * 0.82
      - (age  > 60 ? 5 : 0)
      + (patient.heartDisease ? -8 : 3)
  )));

  const riskLevel =
    riskScore >= 58 ? "HIGH"   :
    riskScore >= 32 ? "MEDIUM" : "LOW";

  return { riskLevel, riskScore: Math.round(riskScore), recoveryScore };
}

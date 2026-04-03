/**
 * Static Patient & Doctor Database
 * Profiles are NEVER mutated during simulation —
 * only sensor readings change at runtime.
 */
export const PATIENTS_DB = {
  p001: {
    id: "p001", name: "Rajesh Kumar", age: 58, sex: "Male",
    diabetes: true, hypertension: true, heartDisease: false,
    chest_pain_type: "Atypical angina",
    resting_blood_pressure: 148,
    cholestoral: 258,
    fasting_blood_sugar: "Greater than 120 mg/ml",
    rest_ecg: "ST-T wave abnormality",
    exercise_induced_angina: "No",
    oldpeak: 1.6, slope: "Flat",
    vessels_colored_by_flourosopy: "One",
    thalassemia: "Reversable Defect",
    email: "rajesh@patient.com",
    role: "patient",
    assignedDoctor: "d001",
  },
  p002: {
    id: "p002", name: "Priya Sharma", age: 45, sex: "Female",
    diabetes: false, hypertension: false, heartDisease: false,
    chest_pain_type: "Non-anginal pain",
    resting_blood_pressure: 120,
    cholestoral: 195,
    fasting_blood_sugar: "Lower than 120 mg/ml",
    rest_ecg: "Normal",
    exercise_induced_angina: "No",
    oldpeak: 0.5, slope: "Upsloping",
    vessels_colored_by_flourosopy: "Zero",
    thalassemia: "Normal",
    email: "priya@patient.com",
    role: "patient",
    assignedDoctor: "d001",
  },
  d001: {
    id: "d001", name: "Dr. Anjali Mehta", age: 42, sex: "Female",
    role: "doctor",
    email: "doctor@health.ai",
    specialization: "Cardiology",
    patients: ["p001", "p002"],
  },
};

/** Default clinical profile for newly registered users */
export const DEFAULT_PATIENT_PROFILE = {
  age: 35, sex: "Male",
  diabetes: false, hypertension: false, heartDisease: false,
  chest_pain_type: "Non-anginal pain",
  resting_blood_pressure: 120,
  cholestoral: 190,
  fasting_blood_sugar: "Lower than 120 mg/ml",
  rest_ecg: "Normal",
  exercise_induced_angina: "No",
  oldpeak: 0.8,
  slope: "Upsloping",
  vessels_colored_by_flourosopy: "Zero",
  thalassemia: "Normal",
  role: "patient",
  assignedDoctor: "d001",
};

/**
 * Sensor Data Generator
 * Simulates smartwatch readings that drift realistically.
 * IMPORTANT: Only sensor values change — patient profile is never touched.
 */

// ── Live sensor stream ───────────────────────────────────────────────────────
/**
 * @param {object|null} prev           - Previous sensor reading (null on first tick)
 * @param {object}      patientProfile - Fixed patient profile used only for baseline HR
 * @returns {object} New sensor reading
 */
export function nextSensor(prev, patientProfile) {
  // Baseline HR is informed by resting BP (clinical correlation)
  const baseHR =
    patientProfile.resting_blood_pressure > 140 ? 88 :
    patientProfile.resting_blood_pressure > 130 ? 80 : 72;

  const prevHR = prev?.heartRate ?? (baseHR + Math.random() * 15);
  const hr = Math.max(
    45,
    Math.min(
      160,
      prevHR
        + (Math.random() - 0.48) * 5
        + (patientProfile.hypertension ? 0.5 : 0)
    )
  );

  return {
    heartRate  : Math.round(hr),
    movement   : Math.round(Math.max(0, Math.min(100,
                   (prev?.movement ?? 55) + (Math.random() - 0.48) * 12
                 ))),
    temperature: parseFloat((36.1 + Math.random() * 1.8).toFixed(1)),
    voiceScore : Math.round(Math.max(0, Math.min(100,
                   (prev?.voiceScore ?? 18) + (Math.random() - 0.5) * 10
                 ))),
    imageFlag  : Math.random() < 0.04,
    timestamp  : new Date().toLocaleTimeString(),
  };
}

// ── Image analysis simulation ────────────────────────────────────────────────
/**
 * Simulates a CV model analysis result.
 * In production: replace with a real API call to /api/image-analysis
 */
export function simulateImageAnalysis(imageType, patient, notes = "") {
  const diabetic = patient?.diabetes ?? false;
  const age      = patient?.age ?? 40;

  const profiles = {
    wound: {
      findings: [
        "Wound area: approximately 2.3cm × 1.8cm detected via contour analysis",
        "Haemostasis: no active bleeding observed",
        diabetic
          ? "⚠ Diabetic ulcer risk — impaired healing likely"
          : "Wound margins appear clean and well-defined",
        "Mild erythema (redness) detected at wound periphery",
        diabetic
          ? "Early-stage tissue discolouration noted"
          : "No necrotic tissue observed",
      ],
      severity: diabetic ? "moderate" : "mild",
      recommendations: [
        "Irrigate wound with normal saline twice daily",
        "Apply sterile non-adherent dressing; change every 48h",
        diabetic
          ? "Blood glucose optimisation critical for wound healing"
          : "Expected healing time: 7–10 days with proper care",
        "Return if redness extends >2cm from wound edge",
      ],
    },

    skin: {
      findings: [
        "Skin hydration index: within normal bounds",
        age > 55
          ? "Age-related skin thinning patterns visible"
          : "Healthy dermis presentation",
        diabetic
          ? "Acanthosis nigricans screening warranted"
          : "No hyperpigmentation or dyschromia",
        "No suspicious lesions or ulcerations identified",
      ],
      severity: diabetic ? "mild" : "none",
      recommendations: [
        "Daily moisturisation to maintain skin barrier",
        "Broad-spectrum SPF 30+ recommended",
        diabetic
          ? "Annual dermatology review for diabetic skin complications"
          : "Maintain current skincare routine",
      ],
    },

    posture: {
      findings: [
        "Forward head posture detected: ~3cm anterior displacement",
        "Shoulder asymmetry: left side 1.5cm lower",
        "Mild thoracolumbar lordosis deviation",
        age > 60
          ? "Reduced cervical range of motion expected for age"
          : "Mobility within normal age range",
      ],
      severity: "mild",
      recommendations: [
        "Daily chin-tuck exercises × 15 reps, 3 sets",
        "Ergonomic workstation assessment recommended",
        "Refer to physiotherapy if pain persists >2 weeks",
      ],
    },

    general: {
      findings: [
        "General visual assessment completed",
        patient?.heartDisease
          ? "Overall appearance below expected for age group"
          : "Wellness within expected range",
        "No visible signs of acute cardiorespiratory distress",
        "Skin tone, colour, and complexion: unremarkable",
      ],
      severity: "none",
      recommendations: [
        "Continue regular monitoring as per care plan",
        "Maintain prescribed medication schedule",
      ],
    },
  };

  const profile = profiles[imageType] ?? profiles.general;
  return {
    ...profile,
    imageType,
    patientName  : patient?.name,
    timestamp    : new Date().toLocaleTimeString(),
    reportId     : Math.random().toString(36).slice(2, 10),
    patientNotes : notes,
  };
}

// ── Report builder ───────────────────────────────────────────────────────────
export function buildRecommendations(patient, riskLevel, avgHR) {
  const recs = [];
  if      (riskLevel === "HIGH")   recs.push("⚠ URGENT: Schedule immediate clinical evaluation and ECG monitoring.");
  else if (riskLevel === "MEDIUM") recs.push("Monitor closely for the next 6 hours; review current medications.");
  else                             recs.push("Patient stable. Continue current recovery protocol.");

  if (patient.diabetes)     recs.push("Check blood glucose — diabetes amplifies cardiac risk.");
  if (patient.hypertension) recs.push("Verify BP medication adherence; monitor for pressure spikes.");

  if (typeof avgHR === "number" && avgHR > 100)
    recs.push(`Elevated average HR (${avgHR} BPM) — assess for arrhythmia.`);

  return recs;
}

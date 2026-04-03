import T from "../../constants/theme";
import { Card, SectionTitle, LiveDot } from "../ui";
import { FEATURE_IMPORTANCES } from "../../utils/mlModel";

export default function SystemTab({ user, sensors, prediction, alerts, notifications, imageReports, reports, running }) {
  const connectors = [
    { ic: "📡", lbl: "Health Monitor",       active: true },
    { ic: "🔔", lbl: "Alert System",         active: alerts.length > 0 },
    { ic: "👨‍⚕️", lbl: "Doctor Notification", active: notifications.length > 0 },
    { ic: "📋", lbl: "Auto-Report (3hr)",    active: reports.length > 0 },
    { ic: "🔬", lbl: "Image Analysis",       active: imageReports.length > 0 },
    { ic: "🚑", lbl: "Emergency Trigger",    active: false },
  ];

  const emergency = [
    { ic: "🚶", lbl: "No Movement",    warn: sensors?.movement < 10,                             d: "< 10% activity" },
    { ic: "💓", lbl: "Abnormal Vitals",warn: sensors?.heartRate > 125 || sensors?.heartRate < 48, d: "HR out of range" },
    { ic: "🎥", lbl: "Fall Detected",  warn: sensors?.imageFlag,                                  d: "Camera flag active" },
  ];

  return (
    <div className="fi">
      <SectionTitle t="System Architecture" sub="End-to-end health AI pipeline" />

      {/* Flow diagram */}
      <Card style={{ marginBottom: "1.25rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap", justifyContent: "center" }}>
          {[
            { ic: "⌚", lbl: "Smartwatch",  sub: "Sensor Stream" },
            "→",
            { ic: "🔌", lbl: "Flask API",   sub: "/api/sensor"   },
            "→",
            { ic: "🗄", lbl: "PostgreSQL",  sub: "5 Tables"      },
            "→",
            { ic: "🧠", lbl: "RF + GBR",   sub: "sklearn"       },
            "→",
            { ic: "📊", lbl: "Dashboard",  sub: "React.js"      },
          ].map((n, i) =>
            n === "→"
              ? <div key={i} style={{ color: T.primary, fontSize: "1.25rem", opacity: running ? 1 : 0.3 }}>⟶</div>
              : <div key={i} style={{ background: T.s1, borderRadius: 14, padding: "0.75rem", textAlign: "center", minWidth: 90, ...(running ? { outline: `1.5px solid ${T.primary}28` } : {}) }}>
                  <div style={{ fontSize: "1.4rem" }}>{n.ic}</div>
                  <div className="M" style={{ fontWeight: 700, fontSize: "0.76rem", color: T.ink, marginTop: 3 }}>{n.lbl}</div>
                  <div style={{ fontSize: "0.62rem", color: T.ink2 }}>{n.sub}</div>
                </div>
          )}
        </div>
      </Card>

      {/* ML details */}
      <SectionTitle t="ML Training Details" sub="UCI Heart Disease Dataset — 1,025 samples · 14 features" />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginBottom: "1.25rem" }}>
        <Card>
          <div className="M" style={{ fontWeight: 700, fontSize: "0.88rem", marginBottom: "0.75rem" }}>🌲 Models Trained</div>
          {[
            ["Random Forest (Heart Disease)",  "100% acc · 250 trees"],
            ["Logistic Regression",            "84.4% acc · scaled"],
            ["RF Classifier (Risk Level)",     "100% acc · 3 classes"],
            ["Gradient Boosting (Recovery)",   "MAE ±5.91 regression"],
          ].map(([m, s]) => (
            <div key={m} style={{ padding: "0.4rem 0", borderBottom: `1px solid ${T.s2}`, fontSize: "0.75rem" }}>
              <div style={{ fontWeight: 600, color: T.ink }}>{m}</div>
              <div style={{ color: T.ink2, fontSize: "0.7rem" }}>{s}</div>
            </div>
          ))}
        </Card>

        <Card>
          <div className="M" style={{ fontWeight: 700, fontSize: "0.88rem", marginBottom: "0.75rem" }}>📥 Feature Importances</div>
          {Object.entries(FEATURE_IMPORTANCES).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([k, v]) => (
            <div key={k} style={{ marginBottom: "0.4rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.7rem", marginBottom: 2 }}>
                <span style={{ color: T.ink, fontFamily: "monospace" }}>{k}</span>
                <span className="M" style={{ fontWeight: 700, color: T.primary }}>{(v * 100).toFixed(1)}%</span>
              </div>
              <div style={{ height: 4, background: T.s2, borderRadius: 2 }}>
                <div style={{ width: `${v * 100 * 6.8}%`, height: "100%", background: `linear-gradient(90deg,${T.primary},${T.pc})`, borderRadius: 2 }} />
              </div>
            </div>
          ))}
        </Card>
      </div>

      {/* Live prediction JSON */}
      {prediction && sensors && (
        <>
          <SectionTitle t="Live Prediction Payload" />
          <Card style={{ background: T.s1, marginBottom: "1.25rem" }}>
            <pre style={{ fontFamily: "monospace", fontSize: "0.75rem", color: T.ink, lineHeight: 1.7, whiteSpace: "pre-wrap", overflowX: "auto" }}>
{`{
  "patient_id":   "${user?.id}",
  "patient_name": "${user?.name}",
  "timestamp":    "${sensors.timestamp}",

  // ── SENSOR VALUES (change every 1.3s) ──
  "sensors": {
    "heart_rate":  ${sensors.heartRate},
    "movement":    ${sensors.movement},
    "temperature": ${sensors.temperature},
    "voice_score": ${sensors.voiceScore},
    "image_flag":  ${sensors.imageFlag}
  },

  // ── PATIENT PROFILE (FIXED) ──
  "patient_profile": {
    "age":           ${user?.age},
    "diabetes":      ${user?.diabetes || false},
    "hypertension":  ${user?.hypertension || false},
    "resting_bp":    ${user?.resting_blood_pressure || "—"},
    "cholestoral":   ${user?.cholestoral || "—"},
    "thalassemia":   "${user?.thalassemia || "—"}"
  },

  // ── ML OUTPUT ──
  "prediction": {
    "risk_level":     "${prediction.riskLevel}",
    "risk_score":     ${prediction.riskScore},
    "recovery_score": ${prediction.recoveryScore},
    "model":          "RandomForest(n=250) + GBR(n=200)"
  }
}`}
            </pre>
          </Card>
        </>
      )}

      {/* Connector system */}
      <SectionTitle t="Connector & Notification System" />
      {connectors.map(s => (
        <div key={s.lbl} style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.65rem 0.9rem", borderRadius: 10, background: s.active ? `${T.primary}08` : T.s1, marginBottom: "0.4rem", transition: "all .4s" }}>
          <span style={{ fontSize: "1rem" }}>{s.ic}</span>
          <span style={{ flex: 1, fontSize: "0.78rem", fontWeight: 600, color: s.active ? T.ink : T.ink2 }}>{s.lbl}</span>
          <LiveDot color={s.active ? T.green : T.outline} />
          <span style={{ fontSize: "0.68rem", fontWeight: 700, color: s.active ? T.green : T.ink2 }}>
            {s.active ? "ACTIVE" : "STANDBY"}
          </span>
        </div>
      ))}

      {/* Zero-touch emergency */}
      <SectionTitle t="Zero-Touch Emergency Detection" style={{ marginTop: "1.25rem" }} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.75rem" }}>
        {emergency.map(e => (
          <Card key={e.lbl} style={{ background: e.warn ? `${T.red}10` : T.s0, ...(e.warn ? { animation: "alertPulse 2s ease infinite" } : {}) }}>
            <div style={{ fontSize: "1.4rem", marginBottom: 4 }}>{e.ic}</div>
            <div className="M" style={{ fontWeight: 700, fontSize: "0.8rem", color: e.warn ? T.red : T.ink }}>{e.lbl}</div>
            <div style={{ fontSize: "0.68rem", color: T.ink2, marginTop: 2 }}>{e.d}</div>
            <div style={{ marginTop: "0.5rem", fontSize: "0.7rem", fontWeight: 700, color: e.warn ? T.red : T.green }}>
              {e.warn ? "⚠ TRIGGERED" : "✓ Clear"}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

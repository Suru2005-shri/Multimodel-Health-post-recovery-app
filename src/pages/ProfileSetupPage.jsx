import { useState } from "react";
import T from "../../constants/theme";
import Btn from "../../components/ui/Btn";

export default function ProfileSetupPage({ user, onComplete }) {
  const [form, setForm] = useState({
    diabetes: false, hypertension: false, heartDisease: false, age: "40",
  });
  const [error, setError] = useState("");

  const toggle = key => setForm(p => ({ ...p, [key]: !p[key] }));

  const handleSubmit = () => {
    if (!form.age || parseInt(form.age) < 1 || parseInt(form.age) > 130) {
      setError("Please enter a valid age."); return;
    }
    onComplete({ ...form, age: parseInt(form.age) });
  };

  const CONDITIONS = [
    { key: "diabetes",     label: "Diabetes",              ic: "🩸" },
    { key: "hypertension", label: "Hypertension (High BP)", ic: "💊" },
    { key: "heartDisease", label: "Heart Disease",          ic: "❤️‍🩹" },
  ];

  return (
    <div style={{
      minHeight: "100vh", background: T.surface,
      display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem",
    }}>
      <div className="su" style={{
        background: "#fff", borderRadius: 28, padding: "2.5rem",
        maxWidth: 460, width: "100%",
        boxShadow: "0 32px 80px rgba(0,88,188,.10)",
      }}>
        {/* Header */}
        <div style={{ marginBottom: "0.5rem" }}>
          <div className="M" style={{ fontWeight: 800, fontSize: "1.25rem", color: T.ink }}>
            Medical Profile 🏥
          </div>
          <div style={{ fontSize: "0.8rem", color: T.ink2, marginTop: 4, lineHeight: 1.6 }}>
            Welcome, <strong>{user?.name}</strong>! Help us personalise your AI risk assessment.
          </div>
        </div>

        {/* Info box */}
        <div style={{
          background: `${T.primary}08`, borderRadius: 12, padding: "0.85rem 1rem",
          fontSize: "0.75rem", color: T.ink2, lineHeight: 1.6, marginBottom: "1.5rem",
        }}>
          💡 <strong>AI personalisation:</strong> A diabetic patient with identical vitals to a healthy patient
          receives a higher risk score — mirroring real clinical decision-making via trained Random Forest weights.
        </div>

        {/* Error */}
        {error && (
          <div style={{ background: `${T.red}12`, color: T.red, borderRadius: 10, padding: "0.6rem 1rem", fontSize: "0.78rem", marginBottom: "1rem" }}>
            ⚠ {error}
          </div>
        )}

        {/* Age */}
        <div style={{ marginBottom: "1.25rem" }}>
          <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: T.ink2, marginBottom: 6 }}>Age</label>
          <input
            type="number" placeholder="e.g. 45" value={form.age}
            onChange={e => setForm(p => ({ ...p, age: e.target.value }))}
            style={{ width: "100%", padding: "0.85rem 1rem", borderRadius: 12, border: "none", background: T.s1, color: T.ink, fontSize: "0.9rem" }}
          />
        </div>

        {/* Conditions */}
        <div style={{ marginBottom: "1.75rem" }}>
          <div style={{ fontSize: "0.8rem", fontWeight: 600, color: T.ink2, marginBottom: "0.75rem" }}>
            Medical Conditions
          </div>
          {CONDITIONS.map(c => (
            <div key={c.key} onClick={() => toggle(c.key)} style={{
              display: "flex", alignItems: "center", gap: "0.75rem",
              padding: "0.85rem", borderRadius: 12, marginBottom: "0.5rem",
              background: form[c.key] ? `${T.primary}12` : T.s1,
              cursor: "pointer", transition: "all .2s",
            }}>
              <span style={{ fontSize: "1.2rem" }}>{c.ic}</span>
              <span style={{ flex: 1, fontWeight: 600, fontSize: "0.875rem", color: T.ink }}>{c.label}</span>
              <div style={{
                width: 22, height: 22, borderRadius: 6,
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "#fff", fontSize: "0.75rem", fontWeight: 700,
                background: form[c.key] ? `linear-gradient(135deg,${T.primary},${T.pc})` : T.s3,
              }}>
                {form[c.key] ? "✓" : ""}
              </div>
            </div>
          ))}
        </div>

        <Btn onClick={handleSubmit} variant="primary" size="lg" style={{ width: "100%" }}>
          Launch Dashboard →
        </Btn>
      </div>
    </div>
  );
}

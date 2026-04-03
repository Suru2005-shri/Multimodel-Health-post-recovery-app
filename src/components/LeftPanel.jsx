import T from "../../constants/theme";
import Smartwatch from "../Smartwatch";
import { FEATURE_IMPORTANCES } from "../../utils/mlModel";

export default function LeftPanel({
  sensors, running, onToggle,
  prediction, demoMode, setDemoMode,
  onImageClick,
}) {
  const pipeline = [
    { lbl: "⌚ Smartwatch",    st: running    ? "Streaming" : "Standby" },
    { lbl: "🔌 Flask API",     st: running    ? "Connected" : "Idle"    },
    { lbl: "🗄 PostgreSQL DB", st: running    ? "Writing"   : "Ready"   },
    { lbl: "🧠 ML Engine",     st: prediction ? "Active"    : "Waiting" },
    { lbl: "📊 Dashboard",     st: "Live"                               },
  ];

  return (
    <div style={{
      width: "30%", minWidth: 260, maxWidth: 340,
      padding: "1.25rem",
      borderRight: `1px solid ${T.outline}22`,
      background: T.s0,
      overflowY: "auto",
      display: "flex", flexDirection: "column", gap: "1.25rem",
    }}>
      <div className="M" style={{ fontWeight: 800, fontSize: "0.9rem", color: T.ink }}>
        ⌚ Smartwatch Simulation
      </div>

      <Smartwatch sensors={sensors} running={running} onToggle={onToggle} />

      {/* Demo-mode toggle */}
      <div style={{
        display: "flex", alignItems: "center", gap: "0.5rem",
        background: T.s1, borderRadius: 10, padding: "0.6rem 0.85rem",
      }}>
        <input
          type="checkbox" id="demoMode" checked={demoMode}
          onChange={e => setDemoMode(e.target.checked)}
          style={{ accentColor: T.primary }}
        />
        <label htmlFor="demoMode" style={{ fontSize: "0.75rem", color: T.ink2, fontWeight: 500, cursor: "pointer" }}>
          Demo mode (30 s report instead of 3 hrs)
        </label>
      </div>

      {/* Image analysis button */}
      <button
        onClick={onImageClick}
        style={{
          width: "100%", padding: "0.85rem", borderRadius: 14, border: "none",
          background: `linear-gradient(135deg, ${T.green}, #28a745)`,
          color: "#fff", fontFamily: "Manrope", fontWeight: 700, fontSize: "0.82rem",
          boxShadow: `0 6px 20px ${T.green}35`, cursor: "pointer",
        }}
      >
        🔬 Upload Image for Analysis
      </button>
      <div style={{ fontSize: "0.7rem", color: T.ink2, textAlign: "center", marginTop: -10, lineHeight: 1.5 }}>
        AI analyses wound/skin/posture and sends report to doctor
      </div>

      {/* System pipeline */}
      <div>
        <div style={{ fontSize: "0.72rem", fontWeight: 700, color: T.ink2, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "0.6rem" }}>
          System Pipeline
        </div>
        {pipeline.map((r, i) => (
          <div key={i} style={{
            display: "flex", justifyContent: "space-between",
            padding: "0.4rem 0.6rem", borderRadius: 7, marginBottom: 2,
            background: i % 2 === 0 ? T.s1 : "transparent", fontSize: "0.75rem",
          }}>
            <span style={{ color: T.ink, fontWeight: 500 }}>{r.lbl}</span>
            <span style={{
              color: ["Idle","Waiting","Standby","Ready"].includes(r.st) ? T.ink2 : T.green,
              fontWeight: 600, fontSize: "0.68rem",
            }}>{r.st}</span>
          </div>
        ))}
      </div>

      {/* ML model badge */}
      <div style={{ background: `${T.primary}08`, borderRadius: 12, padding: "0.85rem" }}>
        <div style={{ fontSize: "0.72rem", fontWeight: 700, color: T.primary, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>
          🧠 ML Model
        </div>
        <div style={{ fontSize: "0.72rem", color: T.ink, lineHeight: 1.7 }}>
          Random Forest (n=250)<br />
          UCI Heart Disease · 1,025 samples<br />
          Accuracy: <strong>100%</strong> · MAE: <strong>5.91</strong><br />
          Features: <strong>13 clinical</strong> + <strong>4 sensor</strong>
        </div>
      </div>

      {/* Top feature importances */}
      <div style={{ background: T.s1, borderRadius: 12, padding: "0.85rem" }}>
        <div style={{ fontSize: "0.72rem", fontWeight: 700, color: T.ink2, marginBottom: "0.5rem", textTransform: "uppercase", letterSpacing: "0.06em" }}>
          Top Feature Importances
        </div>
        {Object.entries(FEATURE_IMPORTANCES).slice(0, 5).map(([k, v]) => (
          <div key={k} style={{ marginBottom: "0.35rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.68rem", marginBottom: 2 }}>
              <span style={{ color: T.ink, fontFamily: "monospace" }}>{k.replace(/_/g, " ")}</span>
              <span className="M" style={{ fontWeight: 700, color: T.primary }}>{(v * 100).toFixed(1)}%</span>
            </div>
            <div style={{ height: 3, background: T.s3, borderRadius: 2 }}>
              <div style={{ width: `${v * 100 * 6.8}%`, height: "100%", background: `linear-gradient(90deg, ${T.primary}, ${T.pc})`, borderRadius: 2 }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

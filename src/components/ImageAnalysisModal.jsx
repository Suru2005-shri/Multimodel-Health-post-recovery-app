import { useState, useRef } from "react";
import T from "../../constants/theme";
import Btn from "../ui/Btn";
import Spinner from "../ui/Spinner";
import { simulateImageAnalysis } from "../../utils/sensorGenerator";
import { PATIENTS_DB } from "../../constants/patients";

export default function ImageAnalysisModal({ onClose, patient, onReport }) {
  const [file,    setFile]    = useState(null);
  const [preview, setPreview] = useState(null);
  const [type,    setType]    = useState("wound");
  const [notes,   setNotes]   = useState("");
  const [loading, setLoading] = useState(false);
  const [result,  setResult]  = useState(null);
  const fileRef = useRef();

  const handleFile = e => {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    const reader = new FileReader();
    reader.onload = ev => setPreview(ev.target.result);
    reader.readAsDataURL(f);
  };

  const analyze = async () => {
    if (!file) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 2200)); // simulate CV model
    const report = simulateImageAnalysis(type, patient, notes);
    setResult(report);
    onReport(report);
    setLoading(false);
  };

  const TYPES = [
    { id: "wound",   ic: "🩹", lbl: "Wound / Injury"   },
    { id: "skin",    ic: "🫀", lbl: "Skin Condition"    },
    { id: "posture", ic: "🧍", lbl: "Posture Analysis"  },
    { id: "general", ic: "🔎", lbl: "General Visual"    },
  ];

  const severityStyle = sev => ({
    background: sev === "severe" || sev === "moderate" ? `${T.red}18` : `${T.green}18`,
    color     : sev === "severe" || sev === "moderate" ? T.red         : T.green,
    padding   : "0.3rem 0.8rem",
    borderRadius: 50,
    fontWeight  : 700,
    fontSize    : "0.75rem",
  });

  return (
    <div
      className="fi"
      style={{
        position      : "fixed", inset: 0, zIndex: 1100,
        background    : "rgba(0,0,0,.5)", backdropFilter: "blur(5px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "1rem",
      }}
    >
      <div style={{
        background: T.s0, borderRadius: 24, padding: "2rem",
        width: "100%", maxWidth: 600, maxHeight: "90vh",
        overflowY: "auto", boxShadow: "0 28px 80px rgba(0,0,0,.2)",
      }}>
        {!result ? (
          <>
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <div>
                <div className="M" style={{ fontWeight: 800, fontSize: "1.15rem", color: T.ink }}>🔬 Image Analysis</div>
                <div style={{ fontSize: "0.78rem", color: T.ink2, marginTop: 2 }}>
                  AI will analyse and send report to doctor
                </div>
              </div>
              <button onClick={onClose} style={{ background: T.s2, border: "none", borderRadius: "50%", width: 34, height: 34, fontSize: "1rem", color: T.ink2 }}>
                ✕
              </button>
            </div>

            {/* Type selector */}
            <div style={{ marginBottom: "1.25rem" }}>
              <div style={{ fontSize: "0.8rem", fontWeight: 600, color: T.ink2, marginBottom: "0.6rem" }}>Analysis Type</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
                {TYPES.map(t => (
                  <div key={t.id} onClick={() => setType(t.id)} style={{
                    padding: "0.75rem", borderRadius: 12, cursor: "pointer",
                    background: type === t.id ? `${T.primary}12` : T.s1,
                    outline: type === t.id ? `2px solid ${T.primary}40` : "none",
                    transition: "all .2s",
                  }}>
                    <div style={{ fontSize: "1.1rem" }}>{t.ic}</div>
                    <div style={{ fontWeight: 600, fontSize: "0.8rem", color: T.ink, marginTop: 3 }}>{t.lbl}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Upload area */}
            <div onClick={() => fileRef.current?.click()} style={{
              border: `2px dashed ${preview ? T.primary : T.outline}`,
              borderRadius: 16, padding: "2rem", textAlign: "center",
              cursor: "pointer", marginBottom: "1rem",
              background: preview ? `${T.primary}06` : T.s1, transition: "all .2s",
            }}>
              {preview
                ? <img src={preview} alt="preview" style={{ maxWidth: "100%", maxHeight: 200, borderRadius: 10, objectFit: "contain" }} />
                : <>
                    <div style={{ fontSize: "2.5rem", marginBottom: 8 }}>📷</div>
                    <div style={{ fontWeight: 600, fontSize: "0.875rem", color: T.ink }}>Click to upload image</div>
                    <div style={{ fontSize: "0.75rem", color: T.ink2, marginTop: 4 }}>JPG, PNG, HEIC supported</div>
                  </>
              }
              <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} style={{ display: "none" }} />
            </div>

            {/* Notes */}
            <textarea
              value={notes} onChange={e => setNotes(e.target.value)}
              placeholder="Add notes for the doctor (symptoms, duration, etc.)..."
              style={{
                width: "100%", padding: "0.85rem", borderRadius: 12,
                border: "none", background: T.s1, color: T.ink,
                fontSize: "0.875rem", minHeight: 80, resize: "vertical",
                marginBottom: "1.25rem", fontFamily: "'DM Sans', sans-serif",
              }}
            />

            <div style={{ display: "flex", gap: "0.75rem" }}>
              <Btn onClick={onClose}  variant="ghost"   size="md" style={{ flex: 1 }}>Cancel</Btn>
              <Btn onClick={analyze}  variant="primary" size="md" style={{ flex: 2 }} disabled={!file || loading}>
                {loading
                  ? <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                      <Spinner /> Analysing...
                    </span>
                  : "🧠 Analyse & Send to Doctor"}
              </Btn>
            </div>
          </>
        ) : (
          /* ── Result ── */
          <div className="su">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <div className="M" style={{ fontWeight: 800, fontSize: "1.1rem", color: T.ink }}>📋 Analysis Report</div>
              <span style={severityStyle(result.severity)}>{result.severity.toUpperCase()}</span>
            </div>

            {preview && <img src={preview} alt="analysed" style={{ width: "100%", maxHeight: 160, objectFit: "cover", borderRadius: 12, marginBottom: "1rem" }} />}

            <div style={{ marginBottom: "1.25rem" }}>
              <div style={{ fontWeight: 700, fontSize: "0.85rem", color: T.ink2, marginBottom: "0.5rem", textTransform: "uppercase", letterSpacing: "0.06em" }}>Findings</div>
              {result.findings.map((f, i) => (
                <div key={i} style={{ display: "flex", gap: "0.5rem", padding: "0.4rem 0", fontSize: "0.82rem", color: T.ink, borderBottom: `1px solid ${T.s2}` }}>
                  <span style={{ color: T.primary, fontWeight: 600 }}>•</span>{f}
                </div>
              ))}
            </div>

            <div style={{ background: `${T.primary}08`, borderRadius: 14, padding: "1rem", marginBottom: "1.5rem" }}>
              <div style={{ fontWeight: 700, fontSize: "0.82rem", color: T.primary, marginBottom: "0.5rem" }}>👨‍⚕️ Recommendations</div>
              {result.recommendations.map((r, i) => (
                <div key={i} style={{ fontSize: "0.8rem", color: T.ink, padding: "0.3rem 0", display: "flex", gap: "0.5rem" }}>
                  <span>{i + 1}.</span>{r}
                </div>
              ))}
            </div>

            <div style={{ background: `${T.green}12`, borderRadius: 12, padding: "0.85rem", fontSize: "0.8rem", color: T.green, fontWeight: 600, textAlign: "center", marginBottom: "1.25rem" }}>
              ✅ Report sent to {PATIENTS_DB["d001"]?.name ?? "Doctor"} · {new Date().toLocaleTimeString()}
            </div>

            <Btn onClick={onClose} variant="primary" size="md" style={{ width: "100%" }}>Close</Btn>
          </div>
        )}
      </div>
    </div>
  );
}

import T from "../../constants/theme";
import Btn from "../ui/Btn";

export default function AlertModal({ alert, onDismiss }) {
  if (!alert) return null;

  return (
    <div
      className="fi"
      style={{
        position      : "fixed",
        inset         : 0,
        zIndex        : 1200,
        background    : "rgba(0,0,0,.45)",
        backdropFilter: "blur(4px)",
        display       : "flex",
        alignItems    : "center",
        justifyContent: "center",
        padding       : "1rem",
      }}
    >
      <div
        className="su"
        style={{
          background  : T.s0,
          borderRadius: 24,
          padding     : "2rem",
          maxWidth    : 400,
          width       : "100%",
          borderTop   : `4px solid ${T.red}`,
          boxShadow   : `0 24px 64px ${T.red}28`,
        }}
      >
        {/* Icon + title */}
        <div style={{ textAlign: "center", marginBottom: "1.25rem" }}>
          <div style={{ fontSize: "2.8rem" }}>🚨</div>
          <div className="M" style={{ fontWeight: 800, fontSize: "1.2rem", color: T.red, marginTop: 8 }}>
            HIGH RISK DETECTED
          </div>
          <div style={{ fontSize: "0.82rem", color: T.ink2, marginTop: 4, lineHeight: 1.6 }}>
            {alert.message}
          </div>
        </div>

        {/* Stats */}
        <div style={{ background: T.s1, borderRadius: 12, padding: "1rem", marginBottom: "1.5rem" }}>
          {[
            ["Risk Score",  `${alert.riskScore}/100`],
            ["Heart Rate",  `${alert.heartRate} BPM`],
            ["Recovery",    `${alert.recoveryScore}%`],
          ].map(([k, v]) => (
            <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "0.25rem 0", fontSize: "0.82rem" }}>
              <span style={{ color: T.ink2 }}>{k}</span>
              <span className="M" style={{ fontWeight: 700, color: T.ink }}>{v}</span>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: "0.75rem" }}>
          <Btn onClick={onDismiss} variant="ghost"  size="md" style={{ flex: 1 }}>Dismiss</Btn>
          <Btn onClick={onDismiss} variant="danger" size="md" style={{ flex: 2 }}>🏥 Notify Emergency</Btn>
        </div>
      </div>
    </div>
  );
}

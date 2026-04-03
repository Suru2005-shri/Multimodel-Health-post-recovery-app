import T from "../../constants/theme";

const CONFIG = {
  LOW    : { bg: `${T.green}18`, c: T.green,   label: "Low Risk",    icon: "✅" },
  MEDIUM : { bg: "#f59e0b18",    c: "#b45309",  label: "Medium Risk", icon: "⚠️" },
  HIGH   : { bg: `${T.red}18`,   c: T.red,      label: "High Risk",   icon: "🚨" },
};

export default function RiskBadge({ level }) {
  const q = CONFIG[level] ?? CONFIG.LOW;
  return (
    <span
      style={{
        display     : "inline-flex",
        alignItems  : "center",
        gap         : 5,
        background  : q.bg,
        color       : q.c,
        padding     : "0.35rem 0.9rem",
        borderRadius: 50,
        fontFamily  : "Manrope",
        fontWeight  : 700,
        fontSize    : "0.78rem",
        ...(level === "HIGH" ? { animation: "alertPulse 2s ease infinite" } : {}),
      }}
    >
      {q.icon} {q.label}
    </span>
  );
}

import T from "../../constants/theme";
import RiskBadge from "../ui/RiskBadge";
import LiveDot   from "../ui/LiveDot";

export default function TopNav({
  user, running, prediction,
  reportTimer, formatTimer,
  unreadNotifs, onBellClick, onSignOut,
}) {
  return (
    <div style={{
      background    : "rgba(249,249,254,.9)",
      backdropFilter: "blur(20px)",
      borderBottom  : `1px solid ${T.outline}28`,
      padding       : "0.75rem 1.5rem",
      display       : "flex",
      alignItems    : "center",
      justifyContent: "space-between",
      position      : "sticky",
      top           : 0,
      zIndex        : 200,
    }}>
      {/* Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
        <span style={{ fontSize: "1.5rem" }}>🫀</span>
        <div>
          <div className="M" style={{ fontWeight: 800, fontSize: "0.95rem", color: T.ink }}>
            Health Recovery AI
          </div>
          <div style={{ fontSize: "0.68rem", color: T.ink2 }}>Intelligent Monitoring Platform</div>
        </div>
      </div>

      {/* Right cluster */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.85rem", flexWrap: "wrap" }}>
        {running && (
          <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: "0.75rem", color: T.green, fontWeight: 700 }}>
            <LiveDot /> LIVE
          </span>
        )}

        {prediction && <RiskBadge level={prediction.riskLevel} />}

        {/* Report countdown */}
        {running && reportTimer != null && (
          <div style={{
            display: "flex", alignItems: "center", gap: 5,
            background: `${T.primary}10`, borderRadius: 8, padding: "0.3rem 0.7rem",
          }}>
            <span style={{ fontSize: "0.7rem", color: T.primary, fontWeight: 600 }}>📋 Next report</span>
            <span className="M" style={{ fontWeight: 800, fontSize: "0.78rem", color: T.primary }}>
              {formatTimer(reportTimer)}
            </span>
          </div>
        )}

        {/* Notifications bell */}
        <button
          onClick={onBellClick}
          style={{
            position: "relative", background: T.s1, border: "none",
            borderRadius: 10, width: 36, height: 36, fontSize: "1rem", cursor: "pointer",
          }}
        >
          🔔
          {unreadNotifs > 0 && (
            <span style={{
              position: "absolute", top: -3, right: -3,
              background: T.red, color: "#fff", borderRadius: "50%",
              width: 16, height: 16, fontSize: "0.62rem", fontWeight: 700,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              {unreadNotifs}
            </span>
          )}
        </button>

        {/* User chip */}
        <div style={{
          display: "flex", alignItems: "center", gap: "0.5rem",
          background: T.s1, borderRadius: 50, padding: "0.35rem 0.85rem",
        }}>
          <div style={{
            width: 26, height: 26, borderRadius: "50%",
            background: `linear-gradient(135deg, ${T.primary}, ${T.pc})`,
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#fff", fontFamily: "Manrope", fontWeight: 700, fontSize: "0.72rem",
          }}>
            {user?.name?.[0]}
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: "0.78rem", color: T.ink }}>{user?.name}</div>
            <div style={{ fontSize: "0.65rem", color: T.ink2, textTransform: "capitalize" }}>{user?.role}</div>
          </div>
        </div>

        <button
          onClick={onSignOut}
          style={{ background: "none", border: "none", color: T.ink2, fontSize: "0.78rem", fontWeight: 500 }}
        >
          Sign out
        </button>
      </div>
    </div>
  );
}

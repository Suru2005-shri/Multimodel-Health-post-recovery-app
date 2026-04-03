import { useState } from "react";
import T from "../../constants/theme";
import RiskBadge from "../ui/RiskBadge";

export default function ReportPanel({ reports, imageReports, notifications, unread, onClose }) {
  const [tab, setTab] = useState("auto");

  const TABS = [
    { id: "auto",  lbl: "3-Hr Reports" },
    { id: "image", lbl: "Image Reports" },
    { id: "notif", lbl: `Notifications${unread > 0 ? ` (${unread})` : ""}` },
  ];

  return (
    <div
      className="fi"
      style={{
        position: "fixed", inset: 0, zIndex: 1100,
        background: "rgba(0,0,0,.45)", backdropFilter: "blur(4px)",
        display: "flex", alignItems: "flex-end", justifyContent: "flex-end",
        padding: "1rem",
      }}
      onClick={onClose}
    >
      <div
        className="su"
        style={{
          background: T.s0, borderRadius: 24, padding: "1.5rem",
          width: 420, maxHeight: "85vh", overflowY: "auto",
          boxShadow: "0 28px 80px rgba(0,0,0,.2)",
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
          <div className="M" style={{ fontWeight: 800, fontSize: "1rem", color: T.ink }}>
            📋 Doctor Reports & Notifications
          </div>
          <button onClick={onClose} style={{ background: T.s2, border: "none", borderRadius: "50%", width: 30, height: 30, color: T.ink2 }}>✕</button>
        </div>

        {/* Tab bar */}
        <div style={{ display: "flex", gap: "0.4rem", marginBottom: "1rem" }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              padding: "0.4rem 0.85rem", borderRadius: 8, border: "none",
              background: tab === t.id ? T.primary : T.s2,
              color: tab === t.id ? "#fff" : T.ink2,
              fontFamily: "Manrope", fontWeight: 600, fontSize: "0.72rem",
            }}>{t.lbl}</button>
          ))}
        </div>

        {/* Auto reports */}
        {tab === "auto" && (
          reports.length === 0
            ? <Empty msg="No reports yet. Start simulation to auto-generate." />
            : reports.map(r => (
                <div key={r.id} style={{ background: T.s1, borderRadius: 14, padding: "1rem", marginBottom: "0.75rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                    <div className="M" style={{ fontWeight: 700, fontSize: "0.85rem", color: T.ink }}>{r.patientName}</div>
                    <RiskBadge level={r.dominantRisk} />
                  </div>
                  <div style={{ fontSize: "0.75rem", color: T.ink2, marginBottom: "0.5rem" }}>
                    Generated: {r.generatedAt} · Recovery: <strong>{r.recoveryScore}%</strong>
                  </div>
                  {r.recommendations?.map((rec, i) => (
                    <div key={i} style={{ fontSize: "0.75rem", color: T.ink, padding: "0.2rem 0", borderBottom: `1px solid ${T.s2}` }}>
                      {i + 1}. {rec}
                    </div>
                  ))}
                </div>
              ))
        )}

        {/* Image reports */}
        {tab === "image" && (
          imageReports.length === 0
            ? <Empty msg="No image analyses submitted yet." />
            : imageReports.map(r => (
                <div key={r.reportId} style={{ background: T.s1, borderRadius: 14, padding: "1rem", marginBottom: "0.75rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                    <div className="M" style={{ fontWeight: 700, fontSize: "0.85rem", color: T.ink }}>
                      {r.imageType.charAt(0).toUpperCase() + r.imageType.slice(1)} Analysis
                    </div>
                    <SevBadge sev={r.severity} />
                  </div>
                  <div style={{ fontSize: "0.72rem", color: T.ink2, marginBottom: "0.5rem" }}>
                    From: {r.patientName} · {r.timestamp}
                  </div>
                  {r.patientNotes && (
                    <div style={{ fontSize: "0.75rem", color: T.ink2, background: T.s2, borderRadius: 8, padding: "0.5rem", marginBottom: "0.5rem" }}>
                      <strong>Patient notes:</strong> {r.patientNotes}
                    </div>
                  )}
                  {r.findings?.slice(0, 3).map((f, i) => (
                    <div key={i} style={{ fontSize: "0.75rem", color: T.ink, padding: "0.2rem 0" }}>• {f}</div>
                  ))}
                </div>
              ))
        )}

        {/* Notifications */}
        {tab === "notif" && (
          notifications.length === 0
            ? <Empty msg="No notifications." />
            : notifications.map(n => (
                <div key={n.id} style={{
                  display: "flex", gap: "0.75rem", padding: "0.85rem",
                  background: n.read ? T.s1 : `${T.primary}08`,
                  borderRadius: 12, marginBottom: "0.5rem",
                  ...(n.read ? {} : { outline: `1.5px solid ${T.primary}20` }),
                }}>
                  <div style={{ fontSize: "1.1rem" }}>{n.type === "image_analysis" ? "🔬" : "📋"}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: "0.8rem", color: T.ink }}>{n.message}</div>
                    <div style={{ fontSize: "0.7rem", color: T.ink2, marginTop: 2 }}>{n.timestamp}</div>
                  </div>
                  {!n.read && <div style={{ width: 8, height: 8, borderRadius: "50%", background: T.primary, flexShrink: 0, marginTop: 4 }} />}
                </div>
              ))
        )}
      </div>
    </div>
  );
}

function Empty({ msg }) {
  return <div style={{ textAlign: "center", padding: "2rem", color: T.ink2, fontSize: "0.82rem" }}>{msg}</div>;
}

function SevBadge({ sev }) {
  const bad = sev === "moderate" || sev === "severe";
  return (
    <span style={{
      fontSize: "0.72rem", padding: "0.25rem 0.6rem", borderRadius: 50, fontWeight: 700,
      background: bad ? `${T.red}18`   : `${T.green}18`,
      color     : bad ? T.red          : T.green,
    }}>
      {sev.toUpperCase()}
    </span>
  );
}

import { AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import T from "../../constants/theme";
import { Card, RiskBadge, SectionTitle, LiveDot } from "../ui";
import { PATIENTS_DB } from "../../constants/patients";

export default function DoctorTab({ user, sensors, history, prediction, alerts, reports, imageReports }) {
  const hrC =
    !sensors ? T.primary :
    sensors.heartRate > 110 || sensors.heartRate < 55 ? T.red :
    sensors.heartRate > 95 ? "#f59e0b" : T.green;

  const stats = [
    { lbl: "Patients",    val: 2,                              ic: "👥", c: T.primary },
    { lbl: "High Risk",   val: alerts.length > 0 ? 1 : 0,     ic: "🚨", c: T.red    },
    { lbl: "Alerts",      val: alerts.length,                  ic: "🔔", c: "#f59e0b"},
    { lbl: "Reports Sent",val: reports.length,                 ic: "📋", c: T.green  },
  ];

  return (
    <div className="fi">
      <SectionTitle t="Doctor Dashboard" sub="Real-time patient monitoring" />

      {/* KPI cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "0.75rem", marginBottom: "1.25rem" }}>
        {stats.map(s => (
          <Card key={s.lbl}>
            <div style={{ fontSize: "1.2rem", marginBottom: 4 }}>{s.ic}</div>
            <div className="M" style={{ fontSize: "1.5rem", fontWeight: 800, color: s.c }}>{s.val}</div>
            <div style={{ fontSize: "0.7rem", color: T.ink2, marginTop: 2 }}>{s.lbl}</div>
          </Card>
        ))}
      </div>

      {/* Patient list */}
      <SectionTitle t="Patient Monitoring" />
      {Object.values(PATIENTS_DB).filter(p => p.role === "patient").map(p => {
        const isActive = user?.id === p.id && !!sensors;
        const pr       = isActive ? prediction : null;
        const hr       = isActive && sensors ? sensors.heartRate : (p.resting_blood_pressure > 140 ? 88 : 72);

        return (
          <Card key={p.id} style={{ marginBottom: "0.75rem", display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
            {/* Avatar */}
            <div style={{ width: 42, height: 42, borderRadius: "50%", flexShrink: 0, background: `linear-gradient(135deg,${T.primary},${T.pc})`, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontFamily: "Manrope", fontWeight: 700 }}>
              {p.name[0]}
            </div>
            <div style={{ flex: 1, minWidth: 140 }}>
              <div className="M" style={{ fontWeight: 700, fontSize: "0.88rem", color: T.ink }}>{p.name}</div>
              <div style={{ fontSize: "0.7rem", color: T.ink2 }}>
                Age {p.age} · {[p.diabetes && "DM", p.hypertension && "HTN", p.heartDisease && "HD"].filter(Boolean).join(", ") || "Healthy"}
              </div>
              <div style={{ fontSize: "0.68rem", color: T.ink2 }}>
                BP: {p.resting_blood_pressure} mmHg · Chol: {p.cholestoral} mg/dL
              </div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div className="M" style={{ fontWeight: 800, fontSize: "1rem", color: isActive ? hrC : T.ink }}>{hr}</div>
              <div style={{ fontSize: "0.62rem", color: T.ink2 }}>BPM</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div className="M" style={{ fontWeight: 800, fontSize: "1rem", color: isActive && pr ? (pr.recoveryScore > 60 ? T.green : T.red) : T.ink }}>
                {isActive && pr ? `${pr.recoveryScore}%` : "--"}
              </div>
              <div style={{ fontSize: "0.62rem", color: T.ink2 }}>Recovery</div>
            </div>
            {isActive && pr
              ? <RiskBadge level={pr.riskLevel} />
              : <span style={{ background: T.s2, color: T.ink2, padding: "0.3rem 0.8rem", borderRadius: 50, fontSize: "0.72rem", fontWeight: 600 }}>Offline</span>}
            {isActive && <LiveDot />}
          </Card>
        );
      })}

      {/* Trends */}
      {history.length > 4 && (
        <>
          <SectionTitle t="Population Vitals Trend" style={{ marginTop: "1rem" }} />
          <Card>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={history}>
                <defs>
                  <linearGradient id="dg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor={T.primary} stopOpacity={.15} />
                    <stop offset="95%" stopColor={T.primary} stopOpacity={0}   />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3,3" stroke={T.outline} strokeOpacity={.3} />
                <XAxis dataKey="timestamp" tick={{ fontSize: 9, fill: T.ink2 }} />
                <YAxis tick={{ fontSize: 9, fill: T.ink2 }} />
                <Tooltip contentStyle={{ background: T.s0, border: "none", borderRadius: 10, fontSize: 10 }} />
                <Area type="monotone" dataKey="heartRate" name="HR"       stroke={T.primary} fill="url(#dg)" strokeWidth={2}   dot={false} />
                <Area type="monotone" dataKey="movement"  name="Movement" stroke={T.green}   fill="none"     strokeWidth={1.5} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </>
      )}

      {/* Image reports received */}
      {imageReports.length > 0 && (
        <>
          <SectionTitle t="Image Analysis Reports Received" style={{ marginTop: "1.25rem" }} />
          {imageReports.map(r => {
            const bad = r.severity === "moderate" || r.severity === "severe";
            return (
              <Card key={r.reportId} style={{ marginBottom: "0.75rem", borderLeft: `3px solid ${bad ? T.red : T.green}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                  <div className="M" style={{ fontWeight: 700, fontSize: "0.85rem", color: T.ink }}>
                    🔬 {r.imageType.charAt(0).toUpperCase() + r.imageType.slice(1)} — {r.patientName}
                  </div>
                  <span style={{ fontSize: "0.7rem", fontWeight: 700, color: bad ? T.red : T.green }}>
                    {r.severity.toUpperCase()}
                  </span>
                </div>
                {r.patientNotes && (
                  <div style={{ fontSize: "0.72rem", color: T.ink2, background: T.s1, borderRadius: 8, padding: "0.4rem 0.6rem", marginBottom: "0.5rem" }}>
                    Patient: "{r.patientNotes}"
                  </div>
                )}
                {r.findings?.slice(0, 2).map((f, i) => (
                  <div key={i} style={{ fontSize: "0.73rem", color: T.ink, padding: "0.15rem 0" }}>• {f}</div>
                ))}
                <div style={{ fontSize: "0.68rem", color: T.ink2, marginTop: 4 }}>{r.timestamp}</div>
              </Card>
            );
          })}
        </>
      )}
    </div>
  );
}

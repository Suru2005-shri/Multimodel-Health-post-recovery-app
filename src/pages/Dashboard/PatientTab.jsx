import { AreaChart, Area, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import T from "../../constants/theme";
import { Card, RiskBadge, RecoveryRing, SectionTitle } from "../ui";

export default function PatientTab({ user, sensors, history, prediction, alerts }) {
  const hrC =
    !sensors            ? T.primary :
    sensors.heartRate > 110 || sensors.heartRate < 55 ? T.red :
    sensors.heartRate > 95  ? "#f59e0b" : T.green;

  return (
    <div className="fi">
      {/* ── Greeting row ── */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: "1.25rem", marginBottom: "1.25rem", flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 180 }}>
          <div style={{ fontWeight: 300, fontSize: "0.85rem", color: T.ink2 }}>
            Good {new Date().getHours() < 12 ? "Morning" : new Date().getHours() < 17 ? "Afternoon" : "Evening"},
          </div>
          <div className="M" style={{ fontWeight: 800, fontSize: "1.75rem", color: T.ink, lineHeight: 1.1 }}>
            {user?.name?.split(" ")[0]}
          </div>
          <div style={{ fontSize: "0.78rem", color: T.ink2, marginTop: 4 }}>
            Age {user?.age} ·{" "}
            {[
              user?.diabetes     && "Diabetic",
              user?.hypertension && "Hypertensive",
              user?.heartDisease && "Heart Condition",
            ].filter(Boolean).join(" · ") || "No recorded conditions"}
          </div>
          {!sensors && (
            <div style={{ marginTop: "0.6rem", fontSize: "0.75rem", color: T.primary, fontWeight: 500 }}>
              ▶ Start simulation to activate live monitoring
            </div>
          )}
        </div>

        {prediction ? (
          <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
            <RecoveryRing score={prediction.recoveryScore} size={120} />
            <div>
              <div style={{ fontSize: "0.7rem", color: T.ink2, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.4rem" }}>
                AI Risk Assessment
              </div>
              <RiskBadge level={prediction.riskLevel} />
              <div style={{ fontSize: "0.75rem", color: T.ink2, marginTop: "0.4rem" }}>
                Score: <strong className="M" style={{ color: T.ink }}>{prediction.riskScore}/100</strong>
              </div>
              <div style={{ fontSize: "0.68rem", color: T.ink2, marginTop: 2 }}>
                Model: RandomForest + GBR (UCI HD)
              </div>
            </div>
          </div>
        ) : (
          <Card style={{ textAlign: "center", padding: "1.5rem 2rem" }}>
            <div style={{ fontSize: "1.5rem", marginBottom: 6 }}>🧠</div>
            <div style={{ fontSize: "0.8rem", color: T.ink2, fontWeight: 500 }}>
              Start simulation to activate<br />ML prediction
            </div>
          </Card>
        )}
      </div>

      {/* ── Live vitals ── */}
      {sensors && (
        <>
          <SectionTitle t="Live Vitals" sub="Sensor values update every 1.3 s · Patient profile stays fixed" />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: "0.75rem", marginBottom: "1.25rem" }}>
            {[
              { ic: "❤️", lbl: "Heart Rate",  val: sensors.heartRate,   unit: "BPM", c: hrC,      max: 160 },
              { ic: "🏃", lbl: "Movement",    val: sensors.movement,    unit: "%",   c: T.primary, max: 100 },
              { ic: "🌡", lbl: "Temperature", val: sensors.temperature, unit: "°C",  c: "#f59e0b", max: 40  },
              { ic: "🎤", lbl: "Distress",    val: sensors.voiceScore,  unit: "%",
                c: sensors.voiceScore > 65 ? T.red : T.green, max: 100 },
            ].map(v => (
              <Card key={v.lbl} style={{ position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", inset: 0, borderRadius: 20, background: `linear-gradient(135deg,${v.c}08,transparent)` }} />
                <div style={{ position: "relative" }}>
                  <div style={{ fontSize: "1.2rem", marginBottom: 4 }}>{v.ic}</div>
                  <div style={{ fontSize: "0.68rem", color: T.ink2, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.07em" }}>{v.lbl}</div>
                  <div className="M" style={{ fontSize: "1.85rem", fontWeight: 800, color: v.c }}>
                    {v.val}<span style={{ fontSize: "0.82rem", fontWeight: 500, color: T.ink2, marginLeft: 3 }}>{v.unit}</span>
                  </div>
                  <div style={{ marginTop: "0.6rem", height: 4, background: T.s3, borderRadius: 2 }}>
                    <div style={{ width: `${Math.min(100, (parseFloat(v.val) / v.max) * 100)}%`, height: "100%", borderRadius: 2, background: `linear-gradient(90deg,${v.c},${v.c}aa)`, transition: "width .7s ease" }} />
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Patient profile (immutable) */}
          <div style={{ background: `${T.primary}06`, borderRadius: 16, padding: "1rem", marginBottom: "1.25rem", border: `1px dashed ${T.primary}30` }}>
            <div style={{ fontSize: "0.72rem", fontWeight: 700, color: T.primary, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "0.5rem" }}>
              🔒 Patient Profile (Fixed — never changes during simulation)
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem 1.5rem", fontSize: "0.78rem", color: T.ink }}>
              {[
                ["Age",         user?.age],
                ["Sex",         user?.sex || "—"],
                ["Chest Pain",  user?.chest_pain_type || "—"],
                ["Resting BP",  `${user?.resting_blood_pressure || "—"} mmHg`],
                ["Cholesterol", `${user?.cholestoral || "—"} mg/dL`],
                ["Diabetes",    user?.diabetes    ? "Yes 🔴" : "No"],
                ["Hypertension",user?.hypertension ? "Yes 🔴" : "No"],
                ["Heart Dis.",  user?.heartDisease ? "Yes 🔴" : "No"],
                ["Thalassemia", user?.thalassemia || "—"],
                ["Old Peak",    user?.oldpeak || "—"],
              ].map(([k, v]) => (
                <div key={k}><span style={{ color: T.ink2 }}>{k}: </span><strong>{v}</strong></div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* ── Charts ── */}
      {history.length > 4 && (
        <>
          <SectionTitle t="Vitals Trend" sub="Last 30 readings" />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginBottom: "1.25rem" }}>
            <Card>
              <div style={{ fontSize: "0.75rem", fontWeight: 700, color: T.ink2, marginBottom: "0.6rem" }}>❤️ Heart Rate (BPM)</div>
              <ResponsiveContainer width="100%" height={110}>
                <AreaChart data={history}>
                  <defs>
                    <linearGradient id="hg" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor={hrC} stopOpacity={.2} />
                      <stop offset="95%" stopColor={hrC} stopOpacity={0}  />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="timestamp" hide />
                  <YAxis domain={[40, 160]} hide />
                  <Tooltip contentStyle={{ background: T.s0, border: "none", borderRadius: 8, fontSize: 10 }} />
                  <Area type="monotone" dataKey="heartRate" stroke={hrC} fill="url(#hg)" strokeWidth={2} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </Card>
            <Card>
              <div style={{ fontSize: "0.75rem", fontWeight: 700, color: T.ink2, marginBottom: "0.6rem" }}>🏃 Movement &amp; 🎤 Distress</div>
              <ResponsiveContainer width="100%" height={110}>
                <LineChart data={history}>
                  <XAxis dataKey="timestamp" hide />
                  <YAxis domain={[0, 100]} hide />
                  <Tooltip contentStyle={{ background: T.s0, border: "none", borderRadius: 8, fontSize: 10 }} />
                  <Line type="monotone" dataKey="movement"   stroke={T.primary} strokeWidth={2}   dot={false} />
                  <Line type="monotone" dataKey="voiceScore" stroke={T.red}     strokeWidth={1.5} dot={false} strokeDasharray="4,3" />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </div>
        </>
      )}

      {/* ── Alerts ── */}
      <SectionTitle t="Health Alerts" sub={`${alerts.length} alert${alerts.length !== 1 ? "s" : ""} logged`} />
      {alerts.length === 0 ? (
        <Card style={{ textAlign: "center", padding: "1.5rem" }}>
          <div style={{ fontSize: "1.5rem", marginBottom: 6 }}>✅</div>
          <div style={{ fontSize: "0.8rem", color: T.ink2 }}>No alerts. All vitals within safe range.</div>
        </Card>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginBottom: "1.25rem" }}>
          {alerts.slice(0, 5).map(a => (
            <Card key={a.id} style={{ display: "flex", alignItems: "center", gap: "0.75rem", borderLeft: `3px solid ${T.red}`, padding: "0.85rem 1rem" }}>
              <span style={{ fontSize: "1.1rem" }}>🚨</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: "0.8rem", color: T.red }}>High Risk Alert</div>
                <div style={{ fontSize: "0.72rem", color: T.ink2, marginTop: 2 }}>{a.message}</div>
              </div>
              <div style={{ fontSize: "0.68rem", color: T.ink2 }}>{a.timestamp}</div>
            </Card>
          ))}
        </div>
      )}

      {/* ── AI Insights ── */}
      <SectionTitle t="AI Health Insights" sub="Based on your medical profile and model feature importances" />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
        {[
          { ic: "🩺", t: "Diabetes Impact",
            b: user?.diabetes
              ? "Diabetes increases risk by +10 pts (model weight). Monitor glucose for wound healing & cardiac events."
              : "No diabetes. Maintains lower baseline risk.",
            c: user?.diabetes ? T.red : T.green },
          { ic: "💊", t: "Blood Pressure",
            b: user?.hypertension
              ? "Hypertension adds +8 to risk score. Verify medication adherence."
              : "BP normal. Continue healthy lifestyle.",
            c: user?.hypertension ? "#b45309" : T.green },
          { ic: "❤️", t: "Cardiac Risk",
            b: `Thalassemia: ${user?.thalassemia || "Normal"} · Vessels: ${user?.vessels_colored_by_flourosopy || "Zero"} — highest feature importance in trained RF (0.13 + 0.10).`,
            c: user?.heartDisease ? T.red : T.primary },
          { ic: "📊", t: "Risk Model Output",
            b: prediction
              ? `Risk: ${prediction.riskScore}/100 · Level: ${prediction.riskLevel} · Recovery: ${prediction.recoveryScore}% (GBR, MAE ±5.91)`
              : "Start simulation to activate ML prediction.",
            c: T.primary },
        ].map(ins => (
          <Card key={ins.t} style={{ borderTop: `3px solid ${ins.c}28` }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
              <span style={{ fontSize: "1rem" }}>{ins.ic}</span>
              <span className="M" style={{ fontWeight: 700, fontSize: "0.8rem", color: T.ink }}>{ins.t}</span>
            </div>
            <div style={{ fontSize: "0.73rem", color: T.ink2, lineHeight: 1.55 }}>{ins.b}</div>
          </Card>
        ))}
      </div>
    </div>
  );
}

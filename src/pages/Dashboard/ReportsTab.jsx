import T from "../../constants/theme";
import { Card, RiskBadge, SectionTitle, Btn } from "../ui";
import { PATIENTS_DB } from "../../constants/patients";

export default function ReportsTab({
  user, reports, imageReports, notifications, unreadNotifs,
  running, reportTimer, formatTimer, demoMode,
  onGenerateNow, onShowPanel,
}) {
  return (
    <div className="fi">
      <SectionTitle
        t="Automated Reports"
        sub={`AI sends a health report to the doctor every ${demoMode ? "30 seconds (demo)" : "3 hours"}`}
      />

      {/* Timer banner */}
      {running && reportTimer != null && (
        <div style={{
          background: `linear-gradient(135deg, ${T.primary}12, ${T.pc}08)`,
          borderRadius: 16, padding: "1rem 1.25rem", marginBottom: "1.25rem",
          display: "flex", alignItems: "center", gap: "1.25rem",
        }}>
          <div style={{ fontSize: "1.75rem" }}>⏱</div>
          <div>
            <div className="M" style={{ fontWeight: 800, fontSize: "1rem", color: T.ink }}>
              Next auto-report to {PATIENTS_DB["d001"]?.name}
            </div>
            <div style={{ fontSize: "0.8rem", color: T.ink2, marginTop: 2 }}>
              {demoMode ? "Demo mode: 30 s intervals" : "Production mode: every 3 hours"}
            </div>
          </div>
          <div style={{ marginLeft: "auto" }}>
            <div className="M" style={{ fontWeight: 800, fontSize: "2rem", color: T.primary }}>
              {formatTimer(reportTimer)}
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
        <Btn onClick={onGenerateNow} variant="primary" size="md">📋 Generate Report Now</Btn>
        <Btn onClick={onShowPanel}   variant="ghost"   size="md">
          🔔 Notifications {unreadNotifs > 0 ? `(${unreadNotifs} unread)` : ""}
        </Btn>
      </div>

      {/* Auto-reports list */}
      {reports.length === 0 ? (
        <Card style={{ textAlign: "center", padding: "2rem", marginBottom: "1.25rem" }}>
          <div style={{ fontSize: "2rem", marginBottom: 8 }}>📋</div>
          <div className="M" style={{ fontWeight: 700, fontSize: "0.9rem", color: T.ink, marginBottom: 4 }}>
            No reports generated yet
          </div>
          <div style={{ fontSize: "0.78rem", color: T.ink2, lineHeight: 1.6 }}>
            Start simulation and wait {demoMode ? "30 seconds" : "3 hours"}, or click "Generate Report Now".
          </div>
        </Card>
      ) : (
        reports.map(r => {
          const badgeColor =
            r.dominantRisk === "HIGH"   ? T.red     :
            r.dominantRisk === "MEDIUM" ? "#f59e0b" : T.green;
          return (
            <Card key={r.id} style={{ marginBottom: "0.85rem", borderLeft: `3px solid ${badgeColor}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem", flexWrap: "wrap", gap: "0.5rem" }}>
                <div>
                  <div className="M" style={{ fontWeight: 800, fontSize: "0.95rem", color: T.ink }}>📋 3-Hour Health Report</div>
                  <div style={{ fontSize: "0.72rem", color: T.ink2, marginTop: 2 }}>
                    Patient: {r.patientName} · Generated: {r.generatedAt}
                  </div>
                </div>
                <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                  <RiskBadge level={r.dominantRisk} />
                  <div style={{ background: `${T.green}12`, color: T.green, padding: "0.3rem 0.75rem", borderRadius: 50, fontWeight: 700, fontSize: "0.75rem" }}>
                    ✓ Sent to Doctor
                  </div>
                </div>
              </div>

              {/* KPIs */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "0.75rem", background: T.s1, borderRadius: 12, padding: "0.85rem", marginBottom: "0.85rem" }}>
                {[
                  ["Recovery Score", `${r.recoveryScore}%`],
                  ["Avg HR",         `${r.avgHeartRate} BPM`],
                  ["Risk Level",     r.dominantRisk],
                ].map(([k, v]) => (
                  <div key={k} style={{ textAlign: "center" }}>
                    <div style={{ fontSize: "0.68rem", color: T.ink2, textTransform: "uppercase", letterSpacing: "0.06em" }}>{k}</div>
                    <div className="M" style={{ fontWeight: 800, fontSize: "1rem", color: T.ink, marginTop: 2 }}>{v}</div>
                  </div>
                ))}
              </div>

              {/* Recommendations */}
              <div style={{ fontSize: "0.72rem", fontWeight: 700, color: T.ink2, marginBottom: "0.4rem", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Clinical Recommendations
              </div>
              {r.recommendations.map((rec, i) => (
                <div key={i} style={{ fontSize: "0.75rem", color: T.ink, padding: "0.25rem 0", borderBottom: `1px solid ${T.s2}`, display: "flex", gap: "0.5rem" }}>
                  <span style={{ color: T.primary, fontWeight: 600 }}>{i + 1}.</span>{rec}
                </div>
              ))}
            </Card>
          );
        })
      )}

      {/* Image analysis reports */}
      {imageReports.length > 0 && (
        <>
          <SectionTitle t="Image Analysis Reports" sub="Sent to doctor automatically after upload" style={{ marginTop: "1.25rem" }} />
          {imageReports.map(r => {
            const bad = r.severity === "moderate" || r.severity === "severe";
            return (
              <Card key={r.reportId} style={{ marginBottom: "0.85rem", borderLeft: `3px solid ${bad ? T.red : T.green}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.75rem" }}>
                  <div>
                    <div className="M" style={{ fontWeight: 800, fontSize: "0.9rem", color: T.ink }}>
                      🔬 {r.imageType.charAt(0).toUpperCase() + r.imageType.slice(1)} Analysis Report
                    </div>
                    <div style={{ fontSize: "0.72rem", color: T.ink2, marginTop: 2 }}>From: {r.patientName} · {r.timestamp}</div>
                  </div>
                  <span style={{ background: bad ? `${T.red}18` : `${T.green}18`, color: bad ? T.red : T.green, padding: "0.3rem 0.75rem", borderRadius: 50, fontWeight: 700, fontSize: "0.72rem", height: "fit-content" }}>
                    {r.severity.toUpperCase()}
                  </span>
                </div>

                {r.patientNotes && (
                  <div style={{ background: T.s1, borderRadius: 10, padding: "0.6rem", fontSize: "0.75rem", color: T.ink2, marginBottom: "0.75rem" }}>
                    <strong>Patient notes:</strong> {r.patientNotes}
                  </div>
                )}

                <div style={{ marginBottom: "0.75rem" }}>
                  <div style={{ fontSize: "0.72rem", fontWeight: 700, color: T.ink2, marginBottom: "0.4rem", textTransform: "uppercase", letterSpacing: "0.06em" }}>Findings</div>
                  {r.findings.map((f, i) => (
                    <div key={i} style={{ fontSize: "0.75rem", color: T.ink, padding: "0.2rem 0", borderBottom: `1px solid ${T.s2}` }}>• {f}</div>
                  ))}
                </div>

                <div>
                  <div style={{ fontSize: "0.72rem", fontWeight: 700, color: T.ink2, marginBottom: "0.4rem", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                    Recommendations for Doctor
                  </div>
                  {r.recommendations.map((rec, i) => (
                    <div key={i} style={{ fontSize: "0.75rem", color: T.ink, padding: "0.2rem 0", display: "flex", gap: "0.5rem" }}>
                      <span style={{ color: T.primary, fontWeight: 600 }}>{i + 1}.</span>{rec}
                    </div>
                  ))}
                </div>

                <div style={{ marginTop: "0.85rem", background: `${T.green}12`, borderRadius: 8, padding: "0.5rem 0.75rem", fontSize: "0.72rem", color: T.green, fontWeight: 600 }}>
                  ✅ Report sent to {PATIENTS_DB["d001"]?.name} · {r.timestamp}
                </div>
              </Card>
            );
          })}
        </>
      )}
    </div>
  );
}

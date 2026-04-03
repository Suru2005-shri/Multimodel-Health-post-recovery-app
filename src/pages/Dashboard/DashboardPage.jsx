import { useState }         from "react";
import T                    from "../../constants/theme";
import { useSimulation }    from "../../hooks/useSimulation";
import TopNav               from "../../components/TopNav";
import LeftPanel            from "../../components/LeftPanel";
import AlertModal           from "../../components/AlertModal";
import ImageAnalysisModal   from "../../components/ImageAnalysisModal";
import ReportPanel          from "../../components/ReportPanel";
import PatientTab           from "./PatientTab";
import DoctorTab            from "./DoctorTab";
import SystemTab            from "./SystemTab";
import ReportsTab           from "./ReportsTab";

const TABS = [
  { id: "patient", ic: "👤",  lbl: "Patient Dashboard" },
  { id: "doctor",  ic: "👨‍⚕️", lbl: "Doctor View"       },
  { id: "system",  ic: "⚙️",  lbl: "System & ML"       },
  { id: "reports", ic: "📋",  lbl: "Reports"           },
];

export default function DashboardPage({ user, onSignOut }) {
  const [tab,          setTab]          = useState(user.role === "doctor" ? "doctor" : "patient");
  const [demoMode,     setDemoMode]     = useState(true);
  const [showImage,    setShowImage]    = useState(false);
  const [showReports,  setShowReports]  = useState(false);
  const [imageReports, setImageReports] = useState([]);

  const sim = useSimulation(user, demoMode);

  const unreadNotifs = sim.notifications.filter(n => !n.read).length;

  const handleImageReport = r => {
    setImageReports(prev => [r, ...prev.slice(0, 19)]);
    sim.addNotification(
      `🔬 Image analysis from ${user?.name} — ${r.imageType}, ${r.severity.toUpperCase()}`,
      "image_analysis"
    );
  };

  const handleBellClick = () => {
    setShowReports(true);
    sim.setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  /* ── Tab label with count badge ── */
  const tabLabel = t => {
    if (t.id === "reports" && sim.reports.length > 0)
      return `${t.ic} ${t.lbl} (${sim.reports.length})`;
    return `${t.ic} ${t.lbl}`;
  };

  return (
    <>
      {/* Modals */}
      <AlertModal alert={sim.modalAlert} onDismiss={() => sim.setModalAlert(null)} />
      {showImage && (
        <ImageAnalysisModal
          onClose={() => setShowImage(false)}
          patient={user}
          onReport={handleImageReport}
        />
      )}
      {showReports && (
        <ReportPanel
          reports={sim.reports}
          imageReports={imageReports}
          notifications={sim.notifications}
          unread={unreadNotifs}
          onClose={() => setShowReports(false)}
        />
      )}

      <div style={{ minHeight: "100vh", background: T.surface, display: "flex", flexDirection: "column" }}>
        {/* Top nav */}
        <TopNav
          user={user}
          running={sim.running}
          prediction={sim.prediction}
          reportTimer={sim.reportTimer}
          formatTimer={sim.formatTimer}
          unreadNotifs={unreadNotifs}
          onBellClick={handleBellClick}
          onSignOut={onSignOut}
        />

        {/* Body */}
        <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
          {/* Left panel */}
          <LeftPanel
            sensors={sim.sensors}
            running={sim.running}
            onToggle={sim.toggle}
            prediction={sim.prediction}
            demoMode={demoMode}
            setDemoMode={setDemoMode}
            onImageClick={() => setShowImage(true)}
          />

          {/* Right panel */}
          <div style={{ flex: 1, padding: "1.25rem", overflowY: "auto" }}>
            {/* Tab bar */}
            <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.25rem", flexWrap: "wrap" }}>
              {TABS.map(t => (
                <button key={t.id} onClick={() => setTab(t.id)} style={{
                  padding     : "0.5rem 1.1rem",
                  borderRadius: 10,
                  border      : "none",
                  background  : tab === t.id ? `linear-gradient(135deg,${T.primary},${T.pc})` : T.s0,
                  color       : tab === t.id ? "#fff" : T.ink2,
                  fontFamily  : "Manrope",
                  fontWeight  : 600,
                  fontSize    : "0.78rem",
                  boxShadow   : tab === t.id ? `0 4px 14px ${T.primary}38` : "0 2px 6px rgba(0,0,0,.05)",
                  transition  : "all .2s",
                  cursor      : "pointer",
                }}>
                  {tabLabel(t)}
                </button>
              ))}
            </div>

            {/* Tab content */}
            {tab === "patient" && (
              <PatientTab
                user={user}
                sensors={sim.sensors}
                history={sim.history}
                prediction={sim.prediction}
                alerts={sim.alerts}
              />
            )}
            {tab === "doctor" && (
              <DoctorTab
                user={user}
                sensors={sim.sensors}
                history={sim.history}
                prediction={sim.prediction}
                alerts={sim.alerts}
                reports={sim.reports}
                imageReports={imageReports}
              />
            )}
            {tab === "system" && (
              <SystemTab
                user={user}
                sensors={sim.sensors}
                prediction={sim.prediction}
                alerts={sim.alerts}
                notifications={sim.notifications}
                imageReports={imageReports}
                reports={sim.reports}
                running={sim.running}
              />
            )}
            {tab === "reports" && (
              <ReportsTab
                user={user}
                reports={sim.reports}
                imageReports={imageReports}
                notifications={sim.notifications}
                unreadNotifs={unreadNotifs}
                running={sim.running}
                reportTimer={sim.reportTimer}
                formatTimer={sim.formatTimer}
                demoMode={demoMode}
                onGenerateNow={() => sim.generateReport(user, sim.prediction)}
                onShowPanel={() => setShowReports(true)}
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
}

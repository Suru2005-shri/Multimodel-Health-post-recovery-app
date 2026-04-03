/**
 * useSimulation — custom hook
 * Manages the smartwatch sensor stream, ML predictions,
 * auto-alerts, and 3-hour report scheduling.
 */
import { useState, useRef, useCallback, useEffect } from "react";
import { mlPredict }                    from "../utils/mlModel";
import { nextSensor, buildRecommendations } from "../utils/sensorGenerator";

const REPORT_INTERVAL_REAL = 10800; // 3 hours in seconds
const REPORT_INTERVAL_DEMO = 30;    // 30 seconds for demo

export function useSimulation(user, demoMode = true) {
  const [running,    setRunning]    = useState(false);
  const [sensors,    setSensors]    = useState(null);
  const [history,    setHistory]    = useState([]);
  const [prediction, setPrediction] = useState(null);
  const [alerts,     setAlerts]     = useState([]);
  const [modalAlert, setModalAlert] = useState(null);
  const [reports,    setReports]    = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [reportTimer, setReportTimer]     = useState(null);

  const intervalRef    = useRef(null);
  const reportRef      = useRef(null);
  const countdownRef   = useRef(null);
  const lastSensor     = useRef(null);
  const alertCooldown  = useRef(false);
  const predRef        = useRef(null);   // latest prediction for report snapshots

  const addNotification = useCallback((msg, type = "report") => {
    setNotifications(prev => [
      { id: Date.now(), type, message: msg, timestamp: new Date().toLocaleTimeString(), read: false },
      ...prev.slice(0, 29),
    ]);
  }, []);

  const generateReport = useCallback((u, latestPred) => {
    if (!u) return;
    const pred = latestPred ?? predRef.current;
    const avgHR = lastSensor.current?.heartRate ?? 0;
    const report = {
      id           : Math.random().toString(36).slice(2, 10),
      patientName  : u.name,
      patientId    : u.id,
      generatedAt  : new Date().toLocaleTimeString(),
      dominantRisk : pred?.riskLevel   ?? "UNKNOWN",
      recoveryScore: pred?.recoveryScore ?? "N/A",
      avgHeartRate : avgHR,
      trigger      : "scheduled_3hr",
      recommendations: buildRecommendations(u, pred?.riskLevel ?? "LOW", avgHR),
    };
    setReports(prev => [report, ...prev.slice(0, 19)]);
    addNotification(
      `📋 3-hour report for ${u.name} — Risk: ${report.dominantRisk}`,
      "report"
    );
  }, [addNotification]);

  const start = useCallback(() => {
    if (!user) return;
    setRunning(true);

    const interval = demoMode ? REPORT_INTERVAL_DEMO : REPORT_INTERVAL_REAL;
    let countdown  = interval;
    setReportTimer(countdown);

    // ── Sensor stream ──
    intervalRef.current = setInterval(() => {
      const s = nextSensor(lastSensor.current, user);
      lastSensor.current = s;
      setSensors(s);
      setHistory(prev => [...prev.slice(-29), s]);

      const pred = mlPredict(user, s);
      predRef.current = pred;
      setPrediction(pred);

      if (pred.riskLevel === "HIGH" && !alertCooldown.current) {
        alertCooldown.current = true;
        const a = {
          id           : Date.now(),
          riskScore    : pred.riskScore,
          recoveryScore: pred.recoveryScore,
          heartRate    : s.heartRate,
          timestamp    : new Date().toLocaleTimeString(),
          message      : `Critical vitals — HR: ${s.heartRate} BPM, Risk: ${pred.riskScore}/100.`,
        };
        setModalAlert(a);
        setAlerts(prev => [a, ...prev.slice(0, 9)]);
        addNotification(`🚨 High-risk alert: ${user.name}, HR ${s.heartRate} BPM`, "alert");
        setTimeout(() => { alertCooldown.current = false; }, 12000);
      }
    }, 1300);

    // ── Countdown timer ──
    countdownRef.current = setInterval(() => {
      countdown -= 1;
      setReportTimer(countdown);
      if (countdown <= 0) countdown = interval;
    }, 1000);

    // ── Auto-report ──
    reportRef.current = setInterval(() => {
      generateReport(user, predRef.current);
    }, interval * 1000);
  }, [user, demoMode, generateReport, addNotification]);

  const stop = useCallback(() => {
    clearInterval(intervalRef.current);
    clearInterval(reportRef.current);
    clearInterval(countdownRef.current);
    setRunning(false);
    setReportTimer(null);
  }, []);

  const toggle = useCallback(() => {
    running ? stop() : start();
  }, [running, start, stop]);

  // Cleanup on unmount
  useEffect(() => () => {
    clearInterval(intervalRef.current);
    clearInterval(reportRef.current);
    clearInterval(countdownRef.current);
  }, []);

  const formatTimer = s => {
    if (s == null) return "--:--";
    const m   = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  };

  return {
    running, sensors, history, prediction,
    alerts, setAlerts,
    modalAlert, setModalAlert,
    reports, setReports,
    notifications, setNotifications, addNotification,
    reportTimer, formatTimer,
    toggle, generateReport,
  };
}

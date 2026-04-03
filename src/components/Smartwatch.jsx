import { useState, useEffect } from "react";
import T from "../../constants/theme";
import Btn from "../ui/Btn";

export default function Smartwatch({ sensors, running, onToggle }) {
  const [, setTick] = useState(0);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setTick(p => p + 1), 60);
    return () => clearInterval(id);
  }, [running]);

  const hr  = sensors?.heartRate ?? 72;
  const hrC =
    hr > 110 || hr < 55 ? T.red :
    hr > 95              ? "#f59e0b" : T.green;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1.25rem" }}>

      {/* ── Watch SVG ── */}
      <div style={{ position: "relative" }}>
        {running && (
          <div style={{
            position: "absolute", inset: -14, borderRadius: 50,
            background: `radial-gradient(ellipse, ${T.primary}22, transparent 70%)`,
            animation: "ring 2.2s ease-out infinite",
          }} />
        )}
        <svg viewBox="0 0 180 224" width={170} height={212}>
          {/* Band */}
          <rect x={64} y={0}   width={52} height={32} rx={9} fill="#1e2128" />
          <rect x={69} y={3}   width={42} height={26} rx={7} fill="#141619" />
          <rect x={64} y={192} width={52} height={32} rx={9} fill="#1e2128" />
          <rect x={69} y={194} width={42} height={26} rx={7} fill="#141619" />
          {/* Body */}
          <rect x={18} y={30}  width={144} height={164} rx={38} fill="#16181f" />
          <rect x={22} y={34}  width={136} height={156} rx={34} fill="#1e2028" />
          {/* Screen */}
          <rect x={26} y={38}  width={128} height={148} rx={30} fill="#0a0b10" />
          <defs>
            <linearGradient id="sg" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%"   stopColor={T.primary} stopOpacity=".14" />
              <stop offset="100%" stopColor={T.pc}      stopOpacity=".04" />
            </linearGradient>
          </defs>
          <rect x={26} y={38} width={128} height={148} rx={30} fill="url(#sg)" />

          {/* Live dot */}
          {running && <circle cx={148} cy={52} r={4.5} fill={T.green} className="bl" />}

          {/* Time */}
          <text x={90} y={70} textAnchor="middle" fill="rgba(255,255,255,.4)"
            fontSize={10} fontFamily="DM Sans">
            {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </text>

          {/* BPM */}
          <text x={90} y={108} textAnchor="middle" fill={hrC}
            fontSize={36} fontFamily="Manrope" fontWeight="800"
            className={running ? "hb" : ""}>
            {sensors ? hr : "--"}
          </text>
          <text x={90} y={124} textAnchor="middle" fill="rgba(255,255,255,.38)"
            fontSize={8.5} fontFamily="DM Sans" letterSpacing={2}>BPM</text>
          <text x={90} y={147} textAnchor="middle" fontSize={17}>❤️</text>

          {/* Temp & Move */}
          <text x={56}  y={170} textAnchor="middle" fill="rgba(255,255,255,.55)"
            fontSize={9} fontFamily="Manrope" fontWeight={600}>
            {sensors ? `${sensors.temperature}°` : "--°"}
          </text>
          <text x={56}  y={180} textAnchor="middle" fill="rgba(255,255,255,.28)"
            fontSize={7} fontFamily="DM Sans">TEMP</text>
          <text x={124} y={170} textAnchor="middle" fill="rgba(255,255,255,.55)"
            fontSize={9} fontFamily="Manrope" fontWeight={600}>
            {sensors ? `${sensors.movement}%` : "--%"}
          </text>
          <text x={124} y={180} textAnchor="middle" fill="rgba(255,255,255,.28)"
            fontSize={7} fontFamily="DM Sans">MOVE</text>

          {/* ECG wave */}
          {running && sensors && (
            <polyline
              points="28,158 40,158 47,148 51,168 55,142 59,174 63,158 82,158 98,158 108,158 113,150 117,166 121,158 145,158 154,158"
              fill="none" stroke={hrC} strokeWidth={1.5} strokeLinecap="round"
              style={{ animation: "pulse 0.9s ease infinite" }}
            />
          )}

          {/* Crown buttons */}
          <rect x={14}  y={84}  width={5} height={22} rx={2.5} fill="#2e3240" />
          <rect x={161} y={78}  width={4} height={16} rx={2}   fill="#2e3240" />
          <rect x={161} y={98}  width={4} height={16} rx={2}   fill="#2e3240" />
        </svg>
      </div>

      {/* ── Toggle button ── */}
      <Btn onClick={onToggle} variant={running ? "danger" : "primary"} size="md">
        {running ? "⏹ Stop Simulation" : "▶ Start Simulation"}
      </Btn>

      {/* ── Sensor mini-cards ── */}
      {sensors && (
        <div style={{ width: "100%", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}
          className="su">
          {[
            { ic: "🌡", lbl: "Temp",     val: `${sensors.temperature}°C`, warn: false },
            { ic: "🏃", lbl: "Movement", val: `${sensors.movement}%`,     warn: sensors.movement < 15 },
            { ic: "🎤", lbl: "Distress", val: `${sensors.voiceScore}%`,   warn: sensors.voiceScore > 65 },
            { ic: "🎥", lbl: "Fall Det.", val: sensors.imageFlag ? "⚠ ACTIVE" : "Clear", warn: sensors.imageFlag },
          ].map(m => (
            <div key={m.lbl} style={{
              background  : m.warn ? `${T.red}12` : T.s1,
              borderRadius: 12,
              padding     : "0.55rem 0.7rem",
              ...(m.warn ? { outline: `1.5px solid ${T.red}25` } : {}),
            }}>
              <div style={{ fontSize: "0.68rem", color: T.ink2, fontWeight: 500 }}>{m.ic} {m.lbl}</div>
              <div className="M" style={{ fontWeight: 700, fontSize: "0.82rem", color: m.warn ? T.red : T.ink, marginTop: 2 }}>
                {m.val}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Data-flow animation ── */}
      {running && (
        <div style={{ width: "100%" }}>
          <svg viewBox="0 0 210 36" width="100%">
            <defs>
              <linearGradient id="fg" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%"   stopColor={T.primary} stopOpacity="0" />
                <stop offset="50%"  stopColor={T.primary} stopOpacity="1" />
                <stop offset="100%" stopColor={T.pc}      stopOpacity="0" />
              </linearGradient>
            </defs>
            <text x={8}   y={22} fontSize={14}>⌚</text>
            <path d="M28,18 Q105,6 178,18" stroke={T.outline} strokeWidth={1.5} fill="none" strokeDasharray="4,4" />
            <path d="M28,18 Q105,6 178,18" stroke="url(#fg)"  strokeWidth={2.5} fill="none"
              strokeDasharray="32,180" style={{ animation: "flowDot 1.6s ease infinite" }} />
            <circle cx={28}  cy={18} r={3.5} fill={T.primary} />
            <circle cx={178} cy={18} r={3.5} fill={T.pc} />
            <text x={168} y={22} fontSize={12}>🖥</text>
          </svg>
          <div style={{ textAlign: "center", fontSize: "0.68rem", color: T.ink2, fontWeight: 500 }}>
            📡 Streaming to Health AI Engine
          </div>
        </div>
      )}
    </div>
  );
}

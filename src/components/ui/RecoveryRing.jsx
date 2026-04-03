import T from "../../constants/theme";

export default function RecoveryRing({ score = 0, size = 130 }) {
  const r    = 50;
  const circ = 2 * Math.PI * r;
  const off  = circ - (score / 100) * circ;
  const c    = score >= 70 ? T.green : score >= 40 ? "#f59e0b" : T.red;

  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <svg viewBox="0 0 110 110" width={size} height={size}>
        <circle cx={55} cy={55} r={r} fill="none" stroke={T.s3} strokeWidth={9} />
        <circle
          cx={55} cy={55} r={r}
          fill="none" stroke={c} strokeWidth={9}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={off}
          transform="rotate(-90 55 55)"
          style={{ transition: "stroke-dashoffset .9s ease" }}
        />
      </svg>
      <div
        style={{
          position      : "absolute",
          inset         : 0,
          display       : "flex",
          flexDirection : "column",
          alignItems    : "center",
          justifyContent: "center",
        }}
      >
        <span className="M" style={{ fontWeight: 800, fontSize: size * 0.22, color: c }}>
          {score}
        </span>
        <span
          style={{
            fontSize      : size * 0.065,
            color         : T.ink2,
            textTransform : "uppercase",
            letterSpacing : "0.06em",
            fontWeight    : 600,
          }}
        >
          Recovery
        </span>
      </div>
    </div>
  );
}

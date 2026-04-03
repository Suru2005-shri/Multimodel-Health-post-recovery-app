import T from "../../constants/theme";

export default function SectionTitle({ t, sub, style = {} }) {
  return (
    <div style={{ marginBottom: "1rem", ...style }}>
      <div className="M" style={{ fontWeight: 800, fontSize: "1.05rem", color: T.ink }}>
        {t}
      </div>
      {sub && (
        <div style={{ fontSize: "0.75rem", color: T.ink2, marginTop: 2 }}>{sub}</div>
      )}
    </div>
  );
}

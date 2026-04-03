import T from "../../constants/theme";

export default function Card({ children, style = {}, glow = "" }) {
  return (
    <div
      style={{
        background  : T.s0,
        borderRadius: 20,
        padding     : "1.25rem",
        boxShadow   : "0 4px 16px rgba(0,0,0,.05)",
        ...(glow ? { outline: `1.5px solid ${glow}30` } : {}),
        ...style,
      }}
    >
      {children}
    </div>
  );
}

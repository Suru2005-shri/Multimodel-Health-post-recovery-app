import T from "../../constants/theme";

const VARIANTS = {
  primary: {
    background : `linear-gradient(135deg, ${T.primary}, ${T.pc})`,
    color      : "#fff",
    boxShadow  : `0 6px 20px ${T.primary}38`,
  },
  danger: {
    background : `linear-gradient(135deg, ${T.red}, #e53e3e)`,
    color      : "#fff",
    boxShadow  : `0 6px 20px ${T.red}38`,
  },
  ghost: {
    background : T.s2,
    color      : T.ink2,
  },
  outline: {
    background : "transparent",
    border     : `1.5px solid ${T.outline}`,
    color      : T.ink2,
  },
  green: {
    background : `linear-gradient(135deg, ${T.green}, #28a745)`,
    color      : "#fff",
    boxShadow  : `0 6px 20px ${T.green}38`,
  },
};

const SIZES = {
  sm : { padding: "0.45rem 1rem",  fontSize: "0.78rem" },
  md : { padding: "0.7rem 1.4rem", fontSize: "0.85rem" },
  lg : { padding: "0.9rem 2rem",   fontSize: "0.95rem" },
};

export default function Btn({
  children,
  onClick,
  variant  = "primary",
  size     = "md",
  style    = {},
  disabled = false,
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        border       : "none",
        borderRadius : 50,
        fontFamily   : "Manrope",
        fontWeight   : 700,
        cursor       : disabled ? "not-allowed" : "pointer",
        transition   : "all .25s ease",
        opacity      : disabled ? 0.6 : 1,
        ...VARIANTS[variant],
        ...SIZES[size],
        ...style,
      }}
    >
      {children}
    </button>
  );
}

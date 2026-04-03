export default function Spinner({ size = 14, color = "white" }) {
  return (
    <span
      className="sp"
      style={{
        display      : "inline-block",
        width        : size,
        height       : size,
        border       : `2px solid ${color}35`,
        borderTopColor: color,
        borderRadius : "50%",
      }}
    />
  );
}

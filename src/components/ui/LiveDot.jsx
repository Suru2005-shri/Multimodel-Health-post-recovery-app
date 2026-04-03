import T from "../../constants/theme";

export default function LiveDot({ color = T.green }) {
  return (
    <span
      style={{
        display      : "inline-block",
        width        : 7,
        height       : 7,
        borderRadius : "50%",
        background   : color,
        animation    : "pulse 1.2s ease infinite",
        flexShrink   : 0,
      }}
    />
  );
}

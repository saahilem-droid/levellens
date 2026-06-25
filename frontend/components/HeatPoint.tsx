type Props = {
  x: number;
  y: number;
  visits: number;
  type: string;
};

export default function HeatPoint({
  x,
  y,
  visits,
  type,
}: Props) {

  let color = "#3b82f6"; // blue
if (type === "storm")
  color = "#ff00ff";
else if (visits >= 12)
  color = "#ef4444"; // red
else if (visits >= 8)
  color = "#facc15"; // yellow
else if (visits >= 4)
  color = "#22c55e"; // green

  return (

  <div
    title={
  type === "movement"
    ? `Visits: ${visits}`
    : type === "loot"
    ? `Loots: ${visits}`
    : `Deaths: ${visits}`
}
    style={{
      position: "absolute",
      left: x,
      top: y,
      width: 8,
      height: 8,
      borderRadius: "50%",
      backgroundColor: color,
      cursor: "pointer",
    }}
  />
);
}
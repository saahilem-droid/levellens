type Props = {
  x: number
  y: number
}

export default function PlayerDot({
  x,
  y,
}: Props) {
  return (
    <div
      style={{
        position: "absolute",
        left: `${x}px`,
        top: `${y}px`,
        width: "12px",
        height: "12px",
        backgroundColor: "red",
        borderRadius: "50%",
        zIndex: 9999,
      }}
    />
  )
}
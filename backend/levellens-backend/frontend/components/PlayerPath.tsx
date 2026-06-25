type Point = {
  x: number
  y: number
}

type Props = {
  points: Point[]
}

export default function PlayerPath({
  points,
}: Props) {
  return (
    <svg
      width="1024"
      height="1024"
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        zIndex: 500,
      }}
    >
      <polyline
        points={points
          .map(
            (p) =>
              `${p.x},${p.y}`
          )
          .join(" ")}
        fill="none"
        stroke="lime"
        strokeWidth="4"
      />
    </svg>
  )
}
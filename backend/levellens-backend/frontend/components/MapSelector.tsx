type Props = {
  selected: string
  setSelected: (value: string) => void
}

export default function MapSelector({
  selected,
  setSelected,
}: Props) {
  return (
    <select
      value={selected}
      onChange={(e) =>
        setSelected(e.target.value)
      }
      className="border p-2"
    >
      <option value="AmbroseValley">
        Ambrose Valley
      </option>

      <option value="GrandRift">
        Grand Rift
      </option>

      <option value="Lockdown">
        Lockdown
      </option>
    </select>
  )
}
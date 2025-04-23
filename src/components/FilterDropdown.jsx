export default function FilterDropdown({ label, options }) {
    return (
      <select className="px-3 py-2 border rounded-lg bg-white">
        {options.map(opt => (
          <option key={opt} value={opt.toLowerCase()}>
            {opt}
          </option>
        ))}
      </select>
    )
  }
  
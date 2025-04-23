export default function SearchBar({ placeholder }) {
    return (
      <div className="relative w-64">
        <input
          type="text"
          placeholder={placeholder}
          className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none"
        />
        <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
      </div>
    )
  }
  
import SearchBar      from './SearchBar'
import FilterDropdown from './FilterDropdown'

export default function Navbar() {
  return (
    <header className="flex items-center justify-between px-6 py-4 bg-white border-b">
      <SearchBar placeholder="Search bug reports…" />
      <div className="flex space-x-4">
        <FilterDropdown label="Status"   options={['All','Unresolved','Critical']} />
        <FilterDropdown label="Severity" options={['All','High','Medium','Low']} />
      </div>
    </header>
  )
}

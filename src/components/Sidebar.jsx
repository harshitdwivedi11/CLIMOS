import { NavLink } from 'react-router-dom'

export default function Sidebar() {
  return (
    <aside className="w-64 bg-white border-r">
      <div className="p-4 font-bold text-xl">Bug Tracker</div>
      <nav className="mt-6 flex flex-col space-y-2">
        <NavLink to="/"    className="pl-4 py-2 hover:bg-gray-100">Dashboard</NavLink>
        <NavLink to="/bugs" className="pl-4 py-2 hover:bg-gray-100">Bug Reports</NavLink>
        <NavLink to="/users" className="pl-4 py-2 hover:bg-gray-100">Users</NavLink>
      </nav>
    </aside>
  )
}

import Sidebar   from '@/components/Sidebar'
import Navbar    from '@/components/Navbar'
import { Routes, Route } from 'react-router-dom'
import Dashboard from '@/pages/Dashboard'
import BugReports from '@/pages/BugReports'
import Users     from '@/pages/Users'

export default function App() {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col bg-gray-50">
        <Navbar />
        <main className="p-6 overflow-auto">
          <Routes>
            <Route path="/"       element={<Dashboard />} />
            <Route path="/bugs"   element={<BugReports />} />
            <Route path="/users"  element={<Users />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}

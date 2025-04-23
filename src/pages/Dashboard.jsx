import { useState, useEffect } from 'react'
import { fetchBugs } from '@/services/api'
import BugGrid      from '@/components/BugGrid'

function SummaryCard({ label, count, bgColor }) {
  return (
    <div className={`${bgColor} p-4 rounded-lg shadow-sm flex flex-col justify-between`}>
      <div className="text-sm uppercase font-medium text-gray-700">{label}</div>
      <div className="text-3xl font-bold text-gray-900 mt-2">{count}</div>
    </div>
  )
}

export default function Dashboard() {
  const [bugs, setBugs] = useState([])

  useEffect(() => {
    fetchBugs()
      .then(setBugs)
      .catch(err => {
        console.error('Failed to load bugs:', err)
        setBugs([])
      })
  }, [])

  const totalReports      = bugs.length
  const unresolvedReports = bugs.filter(b => b.status !== 'resolved').length
  const criticalReports   = bugs.filter(b => b.severity === 'high').length
  const sessionsAvailable = bugs.filter(b => b.sessionAvailable).length

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <SummaryCard label="Total Reports"      count={totalReports}      bgColor="bg-blue-50"   />
        <SummaryCard label="Unresolved"         count={unresolvedReports} bgColor="bg-yellow-50" />
        <SummaryCard label="Critical"           count={criticalReports}   bgColor="bg-red-50"    />
        <SummaryCard label="Sessions Available" count={sessionsAvailable}  bgColor="bg-green-50"  />
      </div>
      <section>
        <h2 className="text-xl font-semibold mb-4">Recent Reports</h2>
        {bugs.length > 0
          ? <BugGrid bugs={bugs.slice(0, 6)} />
          : <p className="text-gray-600">No reports to show yet.</p>
        }
      </section>
    </div>
  )
}

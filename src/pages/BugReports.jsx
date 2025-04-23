import BugGrid from '@/components/BugGrid'
import BugList from '@/components/BugList'
import { sampleBugs } from '@/data/sampleBugs'
import { useState } from 'react'

export default function BugReports() {
  const [view, setView] = useState('list')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('All Statuses')
  const [selectedSeverity, setSelectedSeverity] = useState('All Severities')
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  // Filter bugs based on search query and filters
  const filteredBugs = sampleBugs.filter(bug => {
    const matchesSearch = bug.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bug.description.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = selectedStatus === 'All Statuses' || bug.status === selectedStatus
    const matchesSeverity = selectedSeverity === 'All Severities' || bug.severity === selectedSeverity

    return matchesSearch && matchesStatus && matchesSeverity
  })

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-2xl font-bold">Bug Reports</h1>
          <button 
            className="p-2 hover:bg-gray-100 rounded md:hidden"
            onClick={() => setIsFilterOpen(!isFilterOpen)}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
            </svg>
          </button>
        </div>

        {/* Mobile Filters */}
        <div className={`${isFilterOpen ? 'block' : 'hidden'} md:hidden space-y-4 mb-4`}>
          <input
            type="text"
            placeholder="Search bug reports..."
            className="w-full px-4 py-2 border rounded-lg"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <select
            className="w-full px-4 py-2 border rounded-lg"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option>All Statuses</option>
            <option>Open</option>
            <option>In Progress</option>
            <option>Resolved</option>
          </select>
          <select
            className="w-full px-4 py-2 border rounded-lg"
            value={selectedSeverity}
            onChange={(e) => setSelectedSeverity(e.target.value)}
          >
            <option>All Severities</option>
            <option>Critical</option>
            <option>High</option>
            <option>Medium</option>
            <option>Low</option>
          </select>
        </div>

        {/* Desktop Filters */}
        <div className="hidden md:flex items-center space-x-4 mb-6">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Search bug reports..."
              className="w-full px-4 py-2 border rounded-lg"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <svg className="w-5 h-5 absolute right-3 top-2.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          <select
            className="px-4 py-2 border rounded-lg min-w-[140px]"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option>All Statuses</option>
            <option>Open</option>
            <option>In Progress</option>
            <option>Resolved</option>
          </select>

          <select
            className="px-4 py-2 border rounded-lg min-w-[140px]"
            value={selectedSeverity}
            onChange={(e) => setSelectedSeverity(e.target.value)}
          >
            <option>All Severities</option>
            <option>Critical</option>
            <option>High</option>
            <option>Medium</option>
            <option>Low</option>
          </select>

          <button className="p-2 hover:bg-gray-100 rounded">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </button>
        </div>

        <div className="bg-gray-100 inline-flex rounded-lg p-1 mb-4 sm:mb-6 w-full sm:w-auto">
          <button
            onClick={() => setView('list')}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-lg ${view === 'list' ? 'bg-white shadow' : ''}`}
          >
            List View
          </button>
          <button
            onClick={() => setView('grid')}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-lg ${view === 'grid' ? 'bg-white shadow' : ''}`}
          >
            Grid View
          </button>
        </div>

        {view === 'grid' ? <BugGrid bugs={filteredBugs} /> : <BugList bugs={filteredBugs} />}
      </div>
    </main>
  )
}

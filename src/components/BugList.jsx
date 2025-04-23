import React from 'react'

const SeverityBadge = ({ severity }) => {
  const colors = {
    Critical: 'bg-red-100 text-red-700',
    High: 'bg-orange-100 text-orange-700',
    Medium: 'bg-blue-100 text-blue-700',
    Low: 'bg-green-100 text-green-700'
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[severity] || colors.Low}`}>
      {severity}
    </span>
  )
}

export default function BugList({ bugs }) {
  return (
    <div className="space-y-3 sm:space-y-4">
      {bugs.map((bug) => (
        <div key={bug.id} className="bg-white rounded-lg border shadow-sm p-3 sm:p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1 pr-3 sm:pr-4">
              <div className="flex items-start justify-between mb-1">
                <h3 className="text-sm sm:text-base font-medium text-gray-900">{bug.title}</h3>
                <button className="text-gray-400 hover:text-gray-600 flex-shrink-0 ml-3 sm:ml-4">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </button>
              </div>
              <p className="text-xs sm:text-sm text-gray-500 mb-2 sm:mb-3">{bug.description}</p>
              <div className="flex items-center justify-between">
                <SeverityBadge severity={bug.severity} />
                <div className="flex items-center text-gray-500 text-xs">
                  <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  <span className="hidden sm:inline">Session Available</span>
                  <span className="sm:hidden">Session</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

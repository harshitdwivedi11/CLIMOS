export default function BugCard({ title, desc, severity, status, sessionAvailable }) {
    const colorMap = {
      high:   'bg-red-100 text-red-800',
      medium: 'bg-yellow-100 text-yellow-800',
      low:    'bg-green-100 text-green-800'
    }
  
    return (
      <div className="p-4 bg-white rounded-lg shadow-sm flex flex-col justify-between">
        <div>
          <h3 className="font-semibold">{title}</h3>
          <p className="text-sm text-gray-600 mt-1">{desc}</p>
        </div>
        <div className="mt-4 flex items-center justify-between text-sm">
          <span className={`px-2 py-1 rounded ${colorMap[severity]}`}>{severity}</span>
          <span className="italic">{status}</span>
          {sessionAvailable && <span className="text-xs text-blue-500">Session Available</span>}
        </div>
      </div>
    )
  }
  
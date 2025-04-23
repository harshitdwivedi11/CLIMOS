const API_BASE = import.meta.env.VITE_API_BASE

export async function fetchBugs() {
  const res = await fetch(`${API_BASE}/bugs`)
  if (!res.ok) throw new Error('Failed to load bugs')
  return res.json()
}

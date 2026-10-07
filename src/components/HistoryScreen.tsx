import { useState } from 'react'
import { deleteScan, getScans } from '../lib/storage'

export default function HistoryScreen() {
  const [scans, setScans] = useState(getScans())

  return (
    <section className="history">
      <h2>Scan history</h2>
      {scans.length === 0 && <p>No scans yet.</p>}
      <ul className="history-list">
        {[...scans].reverse().map((s) => (
          <li key={s.id}>
            <div className="history-row">
              <div>
                <strong>{s.restaurantName}</strong>
                <span className="muted"> · {new Date(s.timestamp).toLocaleString()}</span>
                <p className="muted preview">{s.menuItems}</p>
              </div>
              <div className="actions-inline">
                <span className="score" style={{ background: s.averageHealthScore >= 70 ? '#16a34a' : s.averageHealthScore >= 40 ? '#f59e0b' : '#dc2626' }}>
                  {Math.round(s.averageHealthScore)}
                </span>
                <button
                  className="small danger"
                  onClick={() => {
                    if (confirm('Delete this scan?')) {
                      deleteScan(s.id)
                      setScans(getScans())
                    }
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}

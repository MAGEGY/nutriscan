import { useState } from 'react'
import ScannerScreen from './components/ScannerScreen'
import HistoryScreen from './components/HistoryScreen'
import ProfileScreen from './components/ProfileScreen'

type Tab = 'scan' | 'history' | 'profile'

export default function App() {
  const [tab, setTab] = useState<Tab>('scan')

  return (
    <div className="app">
      <header className="header">
        <h1>🥗 NutriScan</h1>
        <p className="subtitle">Scan menus, analyze nutrition, score against your goals</p>
      </header>
      <nav className="tabs">
        <button className={tab === 'scan' ? 'tab active' : 'tab'} onClick={() => setTab('scan')}>Scan</button>
        <button className={tab === 'history' ? 'tab active' : 'tab'} onClick={() => setTab('history')}>History</button>
        <button className={tab === 'profile' ? 'tab active' : 'tab'} onClick={() => setTab('profile')}>Profile</button>
      </nav>
      <main>
        {tab === 'scan' && <ScannerScreen />}
        {tab === 'history' && <HistoryScreen />}
        {tab === 'profile' && <ProfileScreen />}
      </main>
      <footer className="footer">Nutrition values are estimates, not medical advice.</footer>
    </div>
  )
}

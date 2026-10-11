import { useState } from 'react'
import ScannerScreen from './components/ScannerScreen'
import HistoryScreen from './components/HistoryScreen'
import ProfileScreen from './components/ProfileScreen'
import FloatingHelp from './components/FloatingHelp'
import type { HelpHowTo } from './components/FloatingHelp'

type Tab = 'scan' | 'history' | 'profile'

const HELP_HOWTOS: HelpHowTo[] = [
  { title: 'Scan a menu', body: 'Tap "Start camera", point at the menu and tap "Capture & scan" — or upload a menu photo. The first scan downloads the OCR model (10-15 MB), afterwards it is instant. Optionally type the restaurant name first so it is saved with the scan.' },
  { title: 'How health scores work', body: 'Every item starts at 50 and gains/loses points: low calories, high protein, high fiber and low sodium raise the score; high calories, sugar, fat and sodium lower it. Your profile goal (lose weight, gain muscle, low carb, heart health) adjusts the score further. If an item contains one of your allergens, its score becomes 0.' },
  { title: 'Get real USDA nutrition data', body: 'By default nutrition values are estimated from the food name. For real data, get a free API key at api.nal.usda.gov, paste it in the Profile tab, and scans will query the USDA FoodData Central database. The key is stored only in your browser.' },
  { title: 'Allergen warnings', body: 'The app detects dairy, gluten, nuts, shellfish, eggs and soy from menu item names. Add your own allergens in the Profile tab (comma separated) — any item containing them scores 0 and is flagged.' },
  { title: 'Scan history', body: 'Every scan is saved with the restaurant name, the items found and the average health score. Open the History tab to review or delete past scans.' },
]

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
      <FloatingHelp
        color="#16a34a"
        functions={[
          { label: 'Scan a menu', description: 'Start the camera or upload a menu photo and analyze nutrition', action: () => setTab('scan') },
          { label: 'Scan history', description: 'Review past scans with average health scores', action: () => setTab('history') },
          { label: 'Your profile & goals', description: 'Set your goal, allergens, calorie target and optional USDA key', action: () => setTab('profile') },
        ]}
        howtos={HELP_HOWTOS}
      />
    </div>
  )
}

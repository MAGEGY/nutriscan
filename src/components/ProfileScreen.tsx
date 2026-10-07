import { useState } from 'react'
import { getProfile, saveProfile } from '../lib/storage'
import { HEALTH_GOAL_LABELS } from '../lib/types'
import type { HealthGoal, UserProfile } from '../lib/types'

export default function ProfileScreen() {
  const [profile, setProfile] = useState<UserProfile>(getProfile())
  const [saved, setSaved] = useState(false)

  function set<K extends keyof UserProfile>(key: K, value: UserProfile[K]) {
    setProfile((p) => ({ ...p, [key]: value }))
    setSaved(false)
  }

  function save() {
    saveProfile(profile)
    setSaved(true)
  }

  return (
    <section className="profile">
      <h2>Your profile</h2>
      <div className="form">
        <label>Name <input value={profile.name} onChange={(e) => set('name', e.target.value)} /></label>
        <div className="form-row">
          <label>Age <input type="number" value={profile.age || ''} onChange={(e) => set('age', Number(e.target.value))} /></label>
          <label>Weight (kg) <input type="number" value={profile.weight || ''} onChange={(e) => set('weight', Number(e.target.value))} /></label>
          <label>Height (cm) <input type="number" value={profile.height || ''} onChange={(e) => set('height', Number(e.target.value))} /></label>
        </div>
        <label>Health goal
          <select value={profile.healthGoal} onChange={(e) => set('healthGoal', e.target.value as HealthGoal)}>
            {Object.entries(HEALTH_GOAL_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
        </label>
        <label>Allergens (comma separated)
          <input
            placeholder="e.g. Nuts, Dairy"
            value={profile.allergens}
            onChange={(e) => set('allergens', e.target.value)}
          />
        </label>
        <label>Daily calorie target
          <input type="number" value={profile.dailyCalorieTarget || ''} onChange={(e) => set('dailyCalorieTarget', Number(e.target.value))} />
        </label>
        <label>USDA API key (optional, for real nutrition data)
          <input
            placeholder="Get a free key at api.nal.usda.gov"
            value={profile.usdaApiKey}
            onChange={(e) => set('usdaApiKey', e.target.value)}
          />
        </label>
        <p className="muted">Without a key, nutrition values are estimated from the food name. Your key is stored only in this browser.</p>
        <button className="primary" onClick={save}>{saved ? 'Saved ✓' : 'Save profile'}</button>
      </div>
    </section>
  )
}

import { DEFAULT_PROFILE } from './types'
import type { ScanHistory, UserProfile } from './types'

const KEYS = {
  profile: 'nutriscan_profile',
  scans: 'nutriscan_scans',
}

export function getProfile(): UserProfile {
  try {
    return { ...DEFAULT_PROFILE, ...JSON.parse(localStorage.getItem(KEYS.profile) ?? '{}') }
  } catch {
    return DEFAULT_PROFILE
  }
}

export function saveProfile(profile: UserProfile): void {
  localStorage.setItem(KEYS.profile, JSON.stringify(profile))
}

export function getScans(): ScanHistory[] {
  try {
    return JSON.parse(localStorage.getItem(KEYS.scans) ?? '[]')
  } catch {
    return []
  }
}

export function saveScan(scan: Omit<ScanHistory, 'id' | 'timestamp'>): void {
  const scans = getScans()
  const id = scans.reduce((max, s) => Math.max(max, s.id), 0) + 1
  scans.push({ ...scan, id, timestamp: Date.now() })
  localStorage.setItem(KEYS.scans, JSON.stringify(scans))
}

export function deleteScan(id: number): void {
  localStorage.setItem(KEYS.scans, JSON.stringify(getScans().filter((s) => s.id !== id)))
}

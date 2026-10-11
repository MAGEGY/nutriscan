import { useEffect, useRef, useState } from 'react'
import type { ChangeEvent } from 'react'
import { parseMenuText } from '../lib/menuParser'
import { fetchNutritionData } from '../lib/nutrition'
import { getProfile, saveScan } from '../lib/storage'
import type { MenuItem } from '../lib/types'

type Status = 'idle' | 'camera' | 'ocr' | 'analyzing' | 'done' | 'error'

function scoreColor(score: number): string {
  if (score >= 70) return '#16a34a'
  if (score >= 40) return '#f59e0b'
  return '#dc2626'
}

export default function ScannerScreen() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [status, setStatus] = useState<Status>('idle')
  const [items, setItems] = useState<MenuItem[]>([])
  const [restaurant, setRestaurant] = useState('')
  const [error, setError] = useState('')

  // Floating help (in App) triggers these via window events
  useEffect(() => {
    const onStartCamera = () => { startCamera() }
    const onUpload = () => fileInputRef.current?.click()
    window.addEventListener('help:start-camera', onStartCamera)
    window.addEventListener('help:upload', onUpload)
    return () => {
      window.removeEventListener('help:start-camera', onStartCamera)
      window.removeEventListener('help:upload', onUpload)
      stopCamera()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function startCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1920 } },
      })
      streamRef.current = stream
      if (videoRef.current) videoRef.current.srcObject = stream
      setStatus('camera')
    } catch {
      setError('Camera not available. Use "Upload image" instead.')
      setStatus('error')
    }
  }

  function stopCamera() {
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
  }

  async function runOcr(canvas: HTMLCanvasElement) {
    setStatus('ocr')
    stopCamera()
    try {
      const result = await window.Tesseract.recognize(canvas, 'eng')
      analyze(result.data.text)
    } catch {
      setError('OCR failed. Please try again.')
      setStatus('error')
    }
  }

  function capture() {
    const video = videoRef.current
    if (!video) return
    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    canvas.getContext('2d')!.drawImage(video, 0, 0)
    runOcr(canvas)
  }

  function onUpload(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height
      canvas.getContext('2d')!.drawImage(img, 0, 0)
      runOcr(canvas)
    }
    img.src = URL.createObjectURL(file)
  }

  async function analyze(text: string) {
    setStatus('analyzing')
    const names = parseMenuText(text)
    if (names.length === 0) {
      setError('No menu items recognized. Try a clearer photo of the menu.')
      setStatus('error')
      return
    }
    const profile = getProfile()
    const analyzed: MenuItem[] = []
    for (const name of names) {
      analyzed.push(await fetchNutritionData(name, profile))
    }
    const avg = analyzed.reduce((s, i) => s + i.healthScore, 0) / analyzed.length
    saveScan({
      restaurantName: restaurant || 'Unknown restaurant',
      menuItems: names.join(', '),
      averageHealthScore: avg,
    })
    setItems(analyzed)
    setStatus('done')
  }

  function reset() {
    setItems([])
    setError('')
    setStatus('idle')
  }

  return (
    <section className="scan">
      {(status === 'idle' || status === 'error') && (
        <div className="actions">
          <input
            className="text-input"
            placeholder="Restaurant name (optional)"
            value={restaurant}
            onChange={(e) => setRestaurant(e.target.value)}
          />
          <div className="actions">
            <button className="primary" onClick={startCamera}>📷 Start camera</button>
            <label className="primary upload">
              🖼 Upload menu photo
              <input ref={fileInputRef} type="file" accept="image/*" onChange={onUpload} hidden />
            </label>
          </div>
          {error && <p className="error">{error}</p>}
        </div>
      )}

      {status === 'camera' && (
        <div className="camera">
          <video ref={videoRef} autoPlay playsInline />
          <div className="actions">
            <button className="primary" onClick={capture}>📸 Capture & scan</button>
            <button onClick={reset}>Cancel</button>
          </div>
        </div>
      )}

      {(status === 'ocr' || status === 'analyzing') && (
        <p className="loading">{status === 'ocr' ? '⏳ Running OCR… first scan downloads the language model.' : '⏳ Analyzing nutrition…'}</p>
      )}

      {status === 'done' && (
        <div className="results">
          <h2>Menu items ({items.length})</h2>
          <ul className="item-list">
            {items.map((item) => (
              <li key={item.name}>
                <div className="item-row">
                  <strong>{item.name}</strong>
                  <span className="score" style={{ background: scoreColor(item.healthScore) }}>
                    {Math.round(item.healthScore)}
                  </span>
                </div>
                {item.nutritionInfo && (
                  <div className="nutrients">
                    <span>{item.nutritionInfo.calories} kcal</span>
                    <span>P {item.nutritionInfo.protein}g</span>
                    <span>C {item.nutritionInfo.carbs}g</span>
                    <span>F {item.nutritionInfo.fat}g</span>
                    <span>Fiber {item.nutritionInfo.fiber}g</span>
                    <span>Sugar {item.nutritionInfo.sugar}g</span>
                    <span>Na {item.nutritionInfo.sodium}mg</span>
                  </div>
                )}
                {item.allergens.length > 0 && (
                  <div className="allergens">⚠️ {item.allergens.join(', ')}</div>
                )}
                <div className="muted source">{item.source === 'usda' ? 'USDA data' : 'estimated'}</div>
              </li>
            ))}
          </ul>
          <button className="primary" onClick={reset}>Scan another menu</button>
        </div>
      )}
    </section>
  )
}

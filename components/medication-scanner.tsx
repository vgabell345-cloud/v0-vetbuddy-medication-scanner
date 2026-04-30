'use client'

import { useState, useCallback, useRef } from 'react'
import Link from 'next/link'
import { Camera, Search, History } from 'lucide-react'
import { CameraCapture } from './camera-capture'
import { LoadingScreen } from './loading-screen'
import { ResultsScreen } from './results-screen'
import { FailureScreen } from './failure-screen'
import { Header } from './header'
import { getApiKeys, hasRequiredKeys } from '@/lib/api-keys'
import { saveHistoryEntry } from '@/lib/db'
import { AppScreen, MedicationInfo } from '@/lib/types'

export function MedicationScanner() {
  const [screen, setScreen] = useState<AppScreen>('home')
  const [loadingStatus, setLoadingStatus] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [thumbnail, setThumbnail] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [medicationName, setMedicationName] = useState<string>('')
  const [medicationInfo, setMedicationInfo] = useState<MedicationInfo | null>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  const resetState = useCallback(() => {
    setScreen('home')
    setLoadingStatus('')
    setError(null)
    setThumbnail(null)
    setSearchQuery('')
    setMedicationName('')
    setMedicationInfo(null)
  }, [])

  const processSearch = useCallback(async (
    medName: string, 
    imageBase64: string | null = null,
    activeIngredients: string = ''
  ) => {
    const keys = getApiKeys()
    
    try {
      // Research with GPT
      setLoadingStatus('Buscando informacion...')
      const researchResponse = await fetch('/api/research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          medicationName: medName,
          brandName: medName,
          activeIngredients: activeIngredients,
          openaiKey: keys.openaiKey
        }),
      })

      if (!researchResponse.ok) {
        const researchError = await researchResponse.json()
        throw new Error(researchError.error || 'Error en la busqueda')
      }

      const data = await researchResponse.json()
      const info: MedicationInfo = {
        result: data.result,
        isVeterinary: data.isVeterinary
      }
      
      setMedicationInfo(info)
      setMedicationName(medName)

      // Save to history
      const historyEntry = {
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        medicationName: medName,
        marca: medName,
        compuestos: [],
        thumbnail: imageBase64,
        medicationInfo: info,
      }
      
      try {
        await saveHistoryEntry(historyEntry)
      } catch (dbError) {
        console.error('Error saving to history:', dbError)
      }

      setScreen('results')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al procesar. Intenta de nuevo.')
      setScreen('home')
    }
  }, [])

  const handleImageCapture = useCallback(async (base64: string) => {
    setThumbnail(base64)
    setScreen('loading')
    setError(null)

    const keysCheck = hasRequiredKeys()
    if (!keysCheck.valid) {
      setError('Configura tu clave API en Configuracion.')
      setScreen('home')
      return
    }

    const keys = getApiKeys()

    try {
      // Step 1: Vision analysis with GPT-4o
      setLoadingStatus('Analizando imagen...')
      const visionResponse = await fetch('/api/vision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          image: base64, 
          openaiKey: keys.openaiKey 
        }),
      })

      if (!visionResponse.ok) {
        const visionError = await visionResponse.json()
        throw new Error(visionError.error || 'Error al analizar imagen')
      }

      const result = await visionResponse.json()
      const brandName = result.brandName || result.medicationInfo || ''
      const activeIngredients = result.activeIngredients || ''

      // Check if it's not a medication
      if (brandName.toLowerCase().includes('no es un medicamento') || 
          brandName.toLowerCase().includes('no reconocido') ||
          brandName.toLowerCase().includes('no identificable') ||
          (!brandName && !activeIngredients)) {
        setScreen('failure')
        return
      }

      // Use brand name as display name, pass active ingredients to research
      const displayName = brandName || activeIngredients.split(' ')[0] || 'medicamento'
      await processSearch(displayName, base64, activeIngredients)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al procesar. Intenta de nuevo.')
      setScreen('home')
    }
  }, [processSearch])

  const handleTextSearch = useCallback(async () => {
    if (!searchQuery.trim()) return

    const keysCheck = hasRequiredKeys()
    if (!keysCheck.valid) {
      setError('Configura tu clave API en Configuracion.')
      return
    }

    setScreen('loading')
    setError(null)

    await processSearch(searchQuery.trim())
  }, [searchQuery, processSearch])

  const handleManualSearch = useCallback(() => {
    setScreen('home')
    setThumbnail(null)
    setTimeout(() => {
      searchInputRef.current?.focus()
    }, 100)
  }, [])

  // Camera screen
  if (screen === 'camera') {
    return (
      <CameraCapture
        onCapture={handleImageCapture}
        onClose={() => setScreen('home')}
      />
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header showSettings={screen === 'home'} />

      {/* Loading screen */}
      {screen === 'loading' && (
        <LoadingScreen thumbnail={thumbnail} status={loadingStatus} />
      )}

      {/* Results screen */}
      {screen === 'results' && medicationInfo && (
        <ResultsScreen
          thumbnail={thumbnail}
          medicationName={medicationName}
          medicationInfo={medicationInfo}
          onScanAnother={resetState}
        />
      )}

      {/* Failure screen */}
      {screen === 'failure' && (
        <FailureScreen
          onRetakePhoto={() => setScreen('camera')}
          onManualSearch={handleManualSearch}
        />
      )}

      {/* Home screen */}
      {screen === 'home' && (
        <div className="flex flex-1 flex-col items-center justify-start px-6 pt-16">
          {/* Error message */}
          {error && (
            <div className="mb-8 w-full max-w-sm rounded-xl border border-destructive/20 bg-destructive/10 p-4 text-center text-sm text-destructive">
              {error}
            </div>
          )}

          {/* Camera button */}
          <div className="mb-8 flex flex-col items-center">
            <button
              onClick={() => setScreen('camera')}
              className="relative flex h-36 w-36 items-center justify-center rounded-full bg-primary shadow-lg transition-all hover:bg-[#388E3C] hover:shadow-xl active:scale-95"
              aria-label="Abrir camara"
            >
              <div className="absolute inset-0 rounded-full bg-primary opacity-50 animate-pulse-ring" />
              <Camera className="h-14 w-14 text-white" />
            </button>
            <p className="mt-4 text-sm text-muted-foreground">
              Escanear medicamento
            </p>
          </div>

          {/* Separator */}
          <div className="my-8 flex w-full max-w-sm items-center gap-4">
            <div className="h-px flex-1 bg-border" />
            <span className="text-sm text-muted-foreground">&mdash; o &mdash;</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          {/* Search input */}
          <div className="w-full max-w-sm px-2">
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleTextSearch()}
              placeholder="Escribe el nombre del medicamento o marca..."
              className="h-12 w-full rounded-xl border border-input bg-background px-4 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            <button
              onClick={handleTextSearch}
              disabled={!searchQuery.trim()}
              className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-3xl bg-primary font-semibold text-primary-foreground transition-all hover:bg-[#388E3C] active:scale-[0.98] disabled:opacity-50"
            >
              <Search className="h-5 w-5" />
              Buscar
            </button>
          </div>

          {/* History link */}
          <Link
            href="/history"
            className="mt-10 flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <History className="h-4 w-4" />
            Historial
          </Link>
        </div>
      )}
    </div>
  )
}



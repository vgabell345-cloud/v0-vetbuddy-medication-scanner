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
import { 
  AppScreen, 
  VisionResult, 
  SearchResult, 
  MedicationInfo 
} from '@/lib/types'

export function MedicationScanner() {
  const [screen, setScreen] = useState<AppScreen>('home')
  const [loadingStatus, setLoadingStatus] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [thumbnail, setThumbnail] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [visionResult, setVisionResult] = useState<VisionResult | null>(null)
  const [medicationInfo, setMedicationInfo] = useState<MedicationInfo | null>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  const resetState = useCallback(() => {
    setScreen('home')
    setLoadingStatus('')
    setError(null)
    setThumbnail(null)
    setSearchQuery('')
    setVisionResult(null)
    setMedicationInfo(null)
  }, [])

  const processSearch = useCallback(async (
    medicationName: string, 
    imageBase64: string | null = null
  ) => {
    const keys = getApiKeys()
    
    try {
      // Step 1: Search
      setLoadingStatus('Buscando información...')
      const searchResponse = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          query: medicationName, 
          braveKey: keys.braveKey 
        }),
      })

      if (!searchResponse.ok) {
        const searchError = await searchResponse.json()
        throw new Error(searchError.error || 'Error en la búsqueda')
      }

      const searchResults: SearchResult[] = await searchResponse.json()

      if (searchResults.length === 0) {
        throw new Error('No se encontró información sobre este medicamento. Intenta con el nombre del compuesto activo.')
      }

      // Step 2: Synthesize with streaming
      setLoadingStatus('Procesando resultados...')
      const synthesizeResponse = await fetch('/api/synthesize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          medicationName,
          searchResults,
          groqKey: keys.groqKey,
        }),
      })

      if (!synthesizeResponse.ok) {
        const synthesizeError = await synthesizeResponse.json()
        throw new Error(synthesizeError.error || 'Error al procesar')
      }

      // Read the stream
      const reader = synthesizeResponse.body?.getReader()
      if (!reader) throw new Error('Error de conexión')

      let fullText = ''
      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        fullText += decoder.decode(value)
      }

      // Parse the JSON response - handle markdown code blocks
      let jsonContent = fullText.trim()
      
      // Remove markdown code blocks if present
      if (jsonContent.startsWith('```json')) {
        jsonContent = jsonContent.replace(/^```json\s*/, '').replace(/```\s*$/, '')
      } else if (jsonContent.startsWith('```')) {
        jsonContent = jsonContent.replace(/^```\s*/, '').replace(/```\s*$/, '')
      }

      let info: MedicationInfo
      try {
        info = JSON.parse(jsonContent)
      } catch {
        // If still fails, try to extract JSON object from the response
        const jsonMatch = jsonContent.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          info = JSON.parse(jsonMatch[0])
        } else {
          throw new Error('Error al procesar la respuesta')
        }
      }
      setMedicationInfo(info)

      // Save to history
      const historyEntry = {
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        medicationName,
        marca: visionResult?.marca || medicationName,
        compuestos: visionResult?.compuestos || info.compuestos_activos || [],
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
  }, [visionResult])

  const handleImageCapture = useCallback(async (base64: string) => {
    setThumbnail(base64)
    setScreen('loading')
    setError(null)

    const keysCheck = hasRequiredKeys(true)
    if (!keysCheck.valid) {
      setError('Configura tus claves API en Configuración.')
      setScreen('home')
      return
    }

    const keys = getApiKeys()

    try {
      // Step 1: Vision analysis
      setLoadingStatus('Analizando imagen...')
      const visionResponse = await fetch('/api/vision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          image: base64, 
          geminiKey: keys.geminiKey 
        }),
      })

      if (!visionResponse.ok) {
        const visionError = await visionResponse.json()
        throw new Error(visionError.error || 'Error al analizar imagen')
      }

      const result: VisionResult = await visionResponse.json()
      setVisionResult(result)

      if (!result.reconocido) {
        setScreen('failure')
        return
      }

      // Build search query from results
      const queryParts: string[] = []
      if (result.marca) queryParts.push(result.marca)
      if (result.compuestos.length > 0) {
        queryParts.push(result.compuestos[0])
      }
      
      const medicationName = queryParts.join(' ') || 'medicamento'
      await processSearch(medicationName, base64)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al procesar. Intenta de nuevo.')
      setScreen('home')
    }
  }, [processSearch])

  const handleTextSearch = useCallback(async () => {
    if (!searchQuery.trim()) return

    const keysCheck = hasRequiredKeys(false)
    if (!keysCheck.valid) {
      setError('Configura tus claves API en Configuración.')
      return
    }

    setScreen('loading')
    setError(null)
    setVisionResult({
      marca: searchQuery.trim(),
      compuestos: [],
      laboratorio: null,
      reconocido: true,
    })

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
          marca={visionResult?.marca || searchQuery}
          compuestos={visionResult?.compuestos || medicationInfo.compuestos_activos || []}
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
              aria-label="Abrir cámara"
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

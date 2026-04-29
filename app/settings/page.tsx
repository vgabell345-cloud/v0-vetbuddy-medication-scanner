'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, Eye, EyeOff, ExternalLink, Trash2 } from 'lucide-react'
import { getApiKeys, setApiKeys, clearApiKeys } from '@/lib/api-keys'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

export default function SettingsPage() {
  const router = useRouter()
  const [claudeKey, setClaudeKey] = useState('')
  const [braveKey, setBraveKey] = useState('')
  const [groqKey, setGroqKey] = useState('')
  const [showClaude, setShowClaude] = useState(false)
  const [showBrave, setShowBrave] = useState(false)
  const [showGroq, setShowGroq] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const keys = getApiKeys()
    setClaudeKey(keys.claudeKey)
    setBraveKey(keys.braveKey)
    setGroqKey(keys.groqKey)
  }, [])

  const handleSave = () => {
    setApiKeys({ claudeKey, braveKey, groqKey })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleClear = () => {
    clearApiKeys()
    setClaudeKey('')
    setBraveKey('')
    setGroqKey('')
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 flex h-14 items-center gap-3 border-b border-border bg-background px-4">
        <Link
          href="/"
          className="flex h-10 w-10 items-center justify-center rounded-full text-foreground transition-colors hover:bg-secondary"
          aria-label="Volver"
        >
          <ChevronLeft className="h-6 w-6" />
        </Link>
        <h1 className="text-xl font-bold text-foreground">Configuración</h1>
      </header>

      <div className="flex-1 px-4 py-6">
        <div className="mx-auto max-w-sm space-y-6">
          {/* Claude API Key */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Clave API de Claude
            </label>
            <div className="relative">
              <input
                type={showClaude ? 'text' : 'password'}
                value={claudeKey}
                onChange={(e) => setClaudeKey(e.target.value)}
                placeholder="sk-ant-..."
                className="h-12 w-full rounded-xl border border-input bg-background px-4 pr-12 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <button
                type="button"
                onClick={() => setShowClaude(!showClaude)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label={showClaude ? 'Ocultar' : 'Mostrar'}
              >
                {showClaude ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            <a
              href="https://console.anthropic.com/keys"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
            >
              Obtener clave en console.anthropic.com
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>

          {/* Brave API Key */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Clave API de Brave Search
            </label>
            <div className="relative">
              <input
                type={showBrave ? 'text' : 'password'}
                value={braveKey}
                onChange={(e) => setBraveKey(e.target.value)}
                placeholder="BSA..."
                className="h-12 w-full rounded-xl border border-input bg-background px-4 pr-12 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <button
                type="button"
                onClick={() => setShowBrave(!showBrave)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label={showBrave ? 'Ocultar' : 'Mostrar'}
              >
                {showBrave ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            <a
              href="https://api.search.brave.com/app/keys"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
            >
              Obtener clave gratis en api.search.brave.com
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>

          {/* Groq API Key */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Clave API de Groq
            </label>
            <div className="relative">
              <input
                type={showGroq ? 'text' : 'password'}
                value={groqKey}
                onChange={(e) => setGroqKey(e.target.value)}
                placeholder="gsk_..."
                className="h-12 w-full rounded-xl border border-input bg-background px-4 pr-12 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <button
                type="button"
                onClick={() => setShowGroq(!showGroq)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label={showGroq ? 'Ocultar' : 'Mostrar'}
              >
                {showGroq ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            <a
              href="https://console.groq.com/keys"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
            >
              Obtener clave gratis en console.groq.com
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>

          {/* Save button */}
          <button
            onClick={handleSave}
            className="h-12 w-full rounded-3xl bg-primary font-semibold text-primary-foreground transition-all hover:bg-[#388E3C] active:scale-[0.98]"
          >
            {saved ? 'Guardado' : 'Guardar'}
          </button>

          {/* Clear button */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button className="flex h-12 w-full items-center justify-center gap-2 rounded-3xl border-2 border-destructive bg-background font-semibold text-destructive transition-all hover:bg-destructive/10 active:scale-[0.98]">
                <Trash2 className="h-5 w-5" />
                Borrar Claves
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Borrar todas las claves</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta acción eliminará todas tus claves API guardadas. Tendrás que 
                  ingresarlas de nuevo para usar la aplicación.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleClear}>
                  Borrar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {/* Privacy notice */}
          <p className="text-center text-xs text-muted-foreground">
            Tus claves API se guardan solo en tu navegador. Nunca se envían a 
            ningún lado excepto a las APIs correspondientes.
          </p>
        </div>
      </div>
    </div>
  )
}

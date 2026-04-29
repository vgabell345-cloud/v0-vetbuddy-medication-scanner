'use client'

import { useState, useEffect } from 'react'
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
  const [openaiKey, setOpenaiKey] = useState('')
  const [showOpenai, setShowOpenai] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const keys = getApiKeys()
    setOpenaiKey(keys.openaiKey)
  }, [])

  const handleSave = () => {
    setApiKeys({ openaiKey })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleClear = () => {
    clearApiKeys()
    setOpenaiKey('')
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
        <h1 className="text-xl font-bold text-foreground">Configuracion</h1>
      </header>

      <div className="flex-1 px-4 py-6">
        <div className="mx-auto max-w-sm space-y-6">
          {/* OpenAI API Key */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Clave API de OpenAI
            </label>
            <div className="relative">
              <input
                type={showOpenai ? 'text' : 'password'}
                value={openaiKey}
                onChange={(e) => setOpenaiKey(e.target.value)}
                placeholder="sk-..."
                className="h-12 w-full rounded-xl border border-input bg-background px-4 pr-12 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <button
                type="button"
                onClick={() => setShowOpenai(!showOpenai)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label={showOpenai ? 'Ocultar' : 'Mostrar'}
              >
                {showOpenai ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            <a
              href="https://platform.openai.com/api-keys"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
            >
              Obtener clave en platform.openai.com
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
                Borrar Clave
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Borrar clave API</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta accion eliminara tu clave API guardada. Tendras que 
                  ingresarla de nuevo para usar la aplicacion.
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
            Tu clave API se guarda solo en tu navegador. Nunca se envia a 
            ningun lado excepto a la API de OpenAI.
          </p>
        </div>
      </div>
    </div>
  )
}

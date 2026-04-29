'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ChevronLeft, Pill, Trash2 } from 'lucide-react'
import { getHistoryEntries, deleteHistoryEntry, clearHistory } from '@/lib/db'
import { HistoryEntry } from '@/lib/types'
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

export default function HistoryPage() {
  const [entries, setEntries] = useState<HistoryEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedEntry, setSelectedEntry] = useState<HistoryEntry | null>(null)

  useEffect(() => {
    loadHistory()
  }, [])

  const loadHistory = async () => {
    try {
      const historyEntries = await getHistoryEntries()
      setEntries(historyEntries)
    } catch (error) {
      console.error('Error loading history:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteHistoryEntry(id)
      setEntries(entries.filter((e) => e.id !== id))
      if (selectedEntry?.id === id) {
        setSelectedEntry(null)
      }
    } catch (error) {
      console.error('Error deleting entry:', error)
    }
  }

  const handleClearAll = async () => {
    try {
      await clearHistory()
      setEntries([])
      setSelectedEntry(null)
    } catch (error) {
      console.error('Error clearing history:', error)
    }
  }

  const formatDate = (timestamp: number) => {
    return new Intl.DateTimeFormat('es', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(timestamp))
  }

  // Detail view
  if (selectedEntry) {
    const info = selectedEntry.medicationInfo
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <header className="sticky top-0 z-50 flex h-14 items-center gap-3 border-b border-border bg-background px-4">
          <button
            onClick={() => setSelectedEntry(null)}
            className="flex h-10 w-10 items-center justify-center rounded-full text-foreground transition-colors hover:bg-secondary"
            aria-label="Volver"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <h1 className="text-xl font-bold text-foreground">Detalle</h1>
        </header>

        <div className="flex-1 px-4 py-6">
          {/* Thumbnail */}
          {selectedEntry.thumbnail && (
            <div className="mb-6 flex justify-center">
              <div className="overflow-hidden rounded-xl shadow-lg">
                <img
                  src={`data:image/jpeg;base64,${selectedEntry.thumbnail}`}
                  alt="Medicamento"
                  className="h-32 w-32 object-cover"
                />
              </div>
            </div>
          )}

          {/* Warning for non-standard */}
          {!info.es_veterinario_estandar && (
            <div className="mb-6 rounded-xl border-[3px] border-[#C62828] bg-[#E53935] p-4">
              <p className="text-sm font-bold text-white">
                ADVERTENCIA: Este medicamento NO es de uso veterinario estándar.
              </p>
            </div>
          )}

          {/* Header */}
          <div className="mb-6 text-center">
            <h2 className="text-xl font-bold text-foreground">
              {selectedEntry.marca || selectedEntry.medicationName}
            </h2>
            {selectedEntry.compuestos.length > 0 && (
              <p className="mt-1 text-sm text-muted-foreground">
                {selectedEntry.compuestos.join(', ')}
              </p>
            )}
            <p className="mt-2 text-xs text-muted-foreground">
              {formatDate(selectedEntry.timestamp)}
            </p>
          </div>

          {/* Info cards */}
          <div className="space-y-4">
            <InfoCard title="Para Qué Se Usa" content={info.para_que_se_usa} />
            <InfoCard title="Especies Objetivo" content={info.especies_objetivo} />
            <InfoCard title="Dosis Típica" content={info.dosis_tipica} />
            <InfoCard title="Efectos Secundarios" content={info.efectos_secundarios} />
            <InfoCard title="Advertencias" content={info.advertencias} />
          </div>
        </div>
      </div>
    )
  }

  // List view
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-50 flex h-14 items-center justify-between border-b border-border bg-background px-4">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex h-10 w-10 items-center justify-center rounded-full text-foreground transition-colors hover:bg-secondary"
            aria-label="Volver"
          >
            <ChevronLeft className="h-6 w-6" />
          </Link>
          <h1 className="text-xl font-bold text-foreground">Historial</h1>
        </div>
        
        {entries.length > 0 && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button 
                className="flex h-10 w-10 items-center justify-center rounded-full text-destructive transition-colors hover:bg-destructive/10"
                aria-label="Borrar historial"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Borrar historial</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta acción eliminará todo tu historial de escaneos. Esta acción 
                  no se puede deshacer.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleClearAll}>
                  Borrar Todo
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </header>

      <div className="flex-1 px-4 py-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : entries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <Pill className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-center text-muted-foreground">
              Aún no has escaneado ningún medicamento
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {entries.map((entry) => (
              <button
                key={entry.id}
                onClick={() => setSelectedEntry(entry)}
                className="flex w-full items-center gap-4 rounded-xl bg-card p-4 text-left shadow-[0_2px_4px_rgba(0,0,0,0.1)] transition-all hover:shadow-md active:scale-[0.99]"
              >
                {entry.thumbnail ? (
                  <img
                    src={`data:image/jpeg;base64,${entry.thumbnail}`}
                    alt=""
                    className="h-14 w-14 shrink-0 rounded-lg object-cover"
                  />
                ) : (
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-secondary">
                    <Pill className="h-6 w-6 text-muted-foreground" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-foreground">
                    {entry.marca || entry.medicationName}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(entry.timestamp)}
                  </p>
                </div>
                <ChevronLeft className="h-5 w-5 rotate-180 shrink-0 text-muted-foreground" />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function InfoCard({ title, content }: { title: string; content: string }) {
  return (
    <div className="rounded-xl bg-card p-4 shadow-[0_2px_4px_rgba(0,0,0,0.1)]">
      <h3 className="mb-2 text-sm font-semibold text-muted-foreground">{title}</h3>
      <p className="text-foreground">{content}</p>
    </div>
  )
}

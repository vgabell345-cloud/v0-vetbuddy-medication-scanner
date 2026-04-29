'use client'

import { MedicationInfo } from '@/lib/types'
import { AlertTriangle, ArrowLeft } from 'lucide-react'

interface ResultsScreenProps {
  thumbnail?: string | null
  medicationName: string
  medicationInfo: MedicationInfo
  onScanAnother: () => void
}

interface ParsedSections {
  paraQueSeUsa: string
  especiesObjetivo: string
  dosisTipica: string
  efectosSecundarios: string
  advertencias: string
}

function parseMarkdownSections(text: string): ParsedSections {
  const sections: ParsedSections = {
    paraQueSeUsa: '',
    especiesObjetivo: '',
    dosisTipica: '',
    efectosSecundarios: '',
    advertencias: '',
  }

  // Split by ## headers
  const parts = text.split('##').filter(p => p.trim())

  parts.forEach(part => {
    const lines = part.trim().split('\n')
    const header = lines[0].toLowerCase()
    const content = lines.slice(1).join('\n').trim()

    if (header.includes('para qué se usa') || header.includes('para que se usa')) {
      sections.paraQueSeUsa = content
    } else if (header.includes('especies')) {
      sections.especiesObjetivo = content
    } else if (header.includes('dosis')) {
      sections.dosisTipica = content
    } else if (header.includes('efectos secundarios')) {
      sections.efectosSecundarios = content
    } else if (header.includes('advertencias') && !header.includes('veterinario')) {
      sections.advertencias = content
    }
  })

  return sections
}

export function ResultsScreen({
  thumbnail,
  medicationName,
  medicationInfo,
  onScanAnother,
}: ResultsScreenProps) {
  const sections = parseMarkdownSections(medicationInfo.result)

  return (
    <div className="flex flex-1 flex-col bg-[#F5F5F5]">
      {/* Header with back button */}
      <div className="flex items-center gap-3 bg-white px-4 py-4 shadow-sm">
        <button
          onClick={onScanAnother}
          className="flex h-10 w-10 items-center justify-center rounded-full text-foreground transition-colors hover:bg-muted"
          aria-label="Volver"
        >
          <ArrowLeft className="h-6 w-6" />
        </button>
        <h1 className="text-lg font-semibold text-foreground">
          Nombre Identificado
        </h1>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {/* Medication Info Card */}
        <div className="mb-4 flex items-center gap-4 rounded-xl bg-white p-4 shadow-sm">
          {thumbnail ? (
            <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl">
              <img
                src={`data:image/jpeg;base64,${thumbnail}`}
                alt="Medicamento escaneado"
                className="h-full w-full object-cover"
              />
            </div>
          ) : (
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl bg-muted">
              <span className="text-2xl text-muted-foreground">Rx</span>
            </div>
          )}
          <div className="min-w-0 flex-1">
            <h2 className="text-xl font-bold leading-tight text-foreground">
              {medicationName}
            </h2>
          </div>
        </div>

        {/* Warning alert for non-standard veterinary medications */}
        {!medicationInfo.isVeterinary && (
          <div 
            className="mb-4 rounded-xl bg-[#E53935] p-4"
            role="alert"
          >
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 h-6 w-6 shrink-0 text-white" />
              <p className="text-sm font-bold leading-relaxed text-white">
                ADVERTENCIA: Este medicamento NO es de uso veterinario estandar. 
                Consulta OBLIGATORIAMENTE con un veterinario licenciado antes de 
                usar en animales.
              </p>
            </div>
          </div>
        )}

        {/* Information Cards */}
        {sections.paraQueSeUsa && (
          <div className="mb-3 rounded-xl bg-white p-4 shadow-sm">
            <h3 className="mb-2 text-base font-bold text-foreground">
              Para Que Se Usa
            </h3>
            <p className="text-sm leading-relaxed text-[#666]">
              {sections.paraQueSeUsa}
            </p>
          </div>
        )}

        {sections.especiesObjetivo && (
          <div className="mb-3 rounded-xl bg-white p-4 shadow-sm">
            <h3 className="mb-2 text-base font-bold text-foreground">
              Especies Objetivo
            </h3>
            <p className="text-sm leading-relaxed text-[#666]">
              {sections.especiesObjetivo}
            </p>
          </div>
        )}

        {sections.dosisTipica && (
          <div className="mb-3 rounded-xl bg-white p-4 shadow-sm">
            <h3 className="mb-2 text-base font-bold text-foreground">
              Dosis Tipica
            </h3>
            <p className="text-sm leading-relaxed text-[#666]">
              {sections.dosisTipica}
            </p>
          </div>
        )}

        {sections.efectosSecundarios && (
          <div className="mb-3 rounded-xl bg-white p-4 shadow-sm">
            <h3 className="mb-2 text-base font-bold text-foreground">
              Efectos Secundarios
            </h3>
            <p className="text-sm leading-relaxed text-[#666]">
              {sections.efectosSecundarios}
            </p>
          </div>
        )}

        {sections.advertencias && (
          <div className="mb-3 rounded-xl bg-[#FCE4EC] p-4 shadow-sm">
            <h3 className="mb-2 text-base font-bold text-foreground">
              Advertencias
            </h3>
            <p className="text-sm leading-relaxed text-[#666]">
              {sections.advertencias}
            </p>
          </div>
        )}

        {/* Fallback if no sections parsed - show raw text */}
        {!sections.paraQueSeUsa && !sections.especiesObjetivo && !sections.dosisTipica && !sections.efectosSecundarios && !sections.advertencias && (
          <div className="mb-3 rounded-xl bg-white p-4 shadow-sm">
            <p className="text-sm leading-relaxed text-[#666]">
              {medicationInfo.result}
            </p>
          </div>
        )}

        {/* Disclaimer */}
        <p className="mt-5 text-center text-xs leading-relaxed text-muted-foreground">
          Esta informacion es solo de referencia. Siempre consulta un veterinario 
          licenciado antes de administrar cualquier medicamento.
        </p>

        {/* Scan another button */}
        <button
          onClick={onScanAnother}
          className="mb-5 mt-5 h-14 w-full rounded-3xl bg-primary text-base font-bold text-primary-foreground transition-all hover:bg-[#388E3C] active:scale-[0.98]"
        >
          Escanear Otro Medicamento
        </button>
      </div>
    </div>
  )
}

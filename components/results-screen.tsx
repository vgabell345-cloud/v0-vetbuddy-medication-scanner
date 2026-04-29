'use client'

import { MedicationInfo } from '@/lib/types'
import { AlertTriangle } from 'lucide-react'

interface ResultsScreenProps {
  thumbnail?: string | null
  medicationName: string
  medicationInfo: MedicationInfo
  onScanAnother: () => void
}

export function ResultsScreen({
  thumbnail,
  medicationName,
  medicationInfo,
  onScanAnother,
}: ResultsScreenProps) {
  return (
    <div className="flex flex-1 flex-col px-4 py-6">
      {/* Thumbnail */}
      {thumbnail && (
        <div className="mb-6 flex justify-center">
          <div className="overflow-hidden rounded-xl shadow-lg">
            <img
              src={`data:image/jpeg;base64,${thumbnail}`}
              alt="Medicamento escaneado"
              className="h-32 w-32 object-cover"
            />
          </div>
        </div>
      )}

      {/* Warning alert for non-standard veterinary medications */}
      {!medicationInfo.isVeterinary && (
        <div 
          className="mb-6 rounded-xl border-[3px] border-[#C62828] bg-[#E53935] p-4"
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

      {/* Medication header */}
      <div className="mb-6 text-center">
        <h2 className="text-xl font-bold text-foreground">{medicationName}</h2>
      </div>

      {/* Info content as plain text paragraphs */}
      <div className="rounded-xl bg-card p-4 shadow-[0_2px_4px_rgba(0,0,0,0.1)]">
        <div className="prose prose-sm max-w-none text-foreground">
          {medicationInfo.result.split('\n').map((paragraph, index) => (
            paragraph.trim() ? (
              <p key={index} className="mb-3 last:mb-0 leading-relaxed">
                {paragraph}
              </p>
            ) : null
          ))}
        </div>
      </div>

      {/* Disclaimer */}
      <p className="mt-6 text-center text-xs text-muted-foreground">
        Esta informacion es solo de referencia. Siempre consulta un veterinario 
        licenciado antes de administrar cualquier medicamento.
      </p>

      {/* Scan another button */}
      <button
        onClick={onScanAnother}
        className="mt-6 h-12 w-full rounded-3xl bg-primary font-semibold text-primary-foreground transition-all hover:bg-[#388E3C] active:scale-[0.98]"
      >
        Escanear Otro Medicamento
      </button>
    </div>
  )
}

'use client'

import { Camera, Keyboard } from 'lucide-react'

interface FailureScreenProps {
  onRetakePhoto: () => void
  onManualSearch: () => void
}

export function FailureScreen({ onRetakePhoto, onManualSearch }: FailureScreenProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-8">
      <div className="mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-muted">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-muted-foreground"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
          <path d="M8 8l6 6" />
          <path d="M14 8l-6 6" />
        </svg>
      </div>
      
      <h2 className="mb-2 text-center text-xl font-bold text-foreground">
        No se pudo identificar el medicamento
      </h2>
      <p className="mb-8 text-center text-muted-foreground">
        Intenta con una foto más clara o escribe el nombre manualmente.
      </p>

      <div className="flex w-full flex-col gap-3">
        <button
          onClick={onRetakePhoto}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-3xl bg-primary font-semibold text-primary-foreground transition-all hover:bg-[#388E3C] active:scale-[0.98]"
        >
          <Camera className="h-5 w-5" />
          Tomar Otra Foto
        </button>
        
        <button
          onClick={onManualSearch}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-3xl border-2 border-border bg-background font-semibold text-foreground transition-all hover:bg-muted active:scale-[0.98]"
        >
          <Keyboard className="h-5 w-5" />
          Escribir Nombre Manualmente
        </button>
      </div>
    </div>
  )
}

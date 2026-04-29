'use client'

import { Spinner } from '@/components/ui/spinner'

interface LoadingScreenProps {
  thumbnail?: string | null
  status: string
}

export function LoadingScreen({ thumbnail, status }: LoadingScreenProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-8">
      {thumbnail && (
        <div className="mb-8 overflow-hidden rounded-xl shadow-lg">
          <img
            src={`data:image/jpeg;base64,${thumbnail}`}
            alt="Imagen capturada"
            className="h-48 w-48 object-cover"
          />
        </div>
      )}
      
      <div className="flex flex-col items-center gap-4">
        <Spinner className="h-10 w-10 text-primary" />
        <p className="text-center text-lg font-medium text-foreground">
          {status}
        </p>
      </div>
    </div>
  )
}

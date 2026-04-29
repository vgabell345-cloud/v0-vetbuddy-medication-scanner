'use client'

import { useRef, useEffect, useState, useCallback } from 'react'
import { X, Camera } from 'lucide-react'

interface CameraCaptureProps {
  onCapture: (base64: string) => void
  onClose: () => void
}

export function CameraCapture({ onCapture, onClose }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isReady, setIsReady] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const streamRef = useRef<MediaStream | null>(null)

  useEffect(() => {
    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'environment',
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
        })
        
        streamRef.current = stream
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          videoRef.current.onloadedmetadata = () => {
            setIsReady(true)
          }
        }
      } catch (err) {
        console.error('Camera error:', err)
        setError('No se pudo acceder a la cámara. Verifica los permisos.')
      }
    }

    startCamera()

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop())
      }
    }
  }, [])

  const handleCapture = useCallback(() => {
    if (!videoRef.current || !canvasRef.current || !isReady) return

    const video = videoRef.current
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')

    if (!ctx) return

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    ctx.drawImage(video, 0, 0)

    const base64 = canvas.toDataURL('image/jpeg', 0.8).split(',')[1]
    
    // Stop the camera stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
    }
    
    onCapture(base64)
  }, [isReady, onCapture])

  const handleClose = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
    }
    onClose()
  }, [onClose])

  if (error) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black">
        <p className="mb-4 px-6 text-center text-white">{error}</p>
        <button
          onClick={handleClose}
          className="rounded-full bg-primary px-6 py-3 font-semibold text-primary-foreground"
        >
          Volver
        </button>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black">
      {/* Close button */}
      <button
        onClick={handleClose}
        className="absolute left-4 top-4 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-black/50 text-white transition-colors hover:bg-black/70"
        aria-label="Cancelar"
      >
        <X className="h-6 w-6" />
      </button>

      {/* Overlay text */}
      <div className="absolute left-0 right-0 top-20 z-10 px-4 text-center">
        <p className="rounded-lg bg-black/60 px-4 py-2 text-sm font-medium text-white">
          Foto frontal, bien iluminada, sin sombras
        </p>
      </div>

      {/* Video preview */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="h-full w-full object-cover"
      />

      {/* Hidden canvas for capture */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Capture button */}
      <div className="absolute bottom-8 left-0 right-0 flex justify-center">
        <button
          onClick={handleCapture}
          disabled={!isReady}
          className="flex h-20 w-20 items-center justify-center rounded-full bg-white transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
          aria-label="Capturar foto"
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-full border-4 border-primary bg-primary">
            <Camera className="h-8 w-8 text-white" />
          </div>
        </button>
      </div>
    </div>
  )
}

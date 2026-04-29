export interface VisionResult {
  marca: string | null
  compuestos: string[]
  laboratorio: string | null
  reconocido: boolean
}

export interface SearchResult {
  title: string
  description: string
  url: string
}

export interface MedicationInfo {
  result: string
  isVeterinary: boolean
}

export interface HistoryEntry {
  id: string
  timestamp: number
  medicationName: string
  marca: string | null
  compuestos: string[]
  thumbnail: string | null
  medicationInfo: MedicationInfo
}

export type AppScreen = 
  | 'home' 
  | 'camera' 
  | 'loading' 
  | 'results' 
  | 'failure'

export interface ApiKeys {
  openaiKey: string
}

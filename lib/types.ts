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
  para_que_se_usa: string
  especies_objetivo: string
  dosis_tipica: string
  efectos_secundarios: string
  advertencias: string
  es_veterinario_estandar: boolean
  compuestos_activos: string[]
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
  claudeKey: string
  braveKey: string
  groqKey: string
}

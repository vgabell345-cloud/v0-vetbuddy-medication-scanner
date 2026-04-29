import { ApiKeys } from './types'

const GEMINI_KEY = 'gemini_key'
const BRAVE_KEY = 'brave_key'
const GROQ_KEY = 'groq_key'

export function getApiKeys(): ApiKeys {
  if (typeof window === 'undefined') {
    return { geminiKey: '', braveKey: '', groqKey: '' }
  }
  
  return {
    geminiKey: localStorage.getItem(GEMINI_KEY) || '',
    braveKey: localStorage.getItem(BRAVE_KEY) || '',
    groqKey: localStorage.getItem(GROQ_KEY) || '',
  }
}

export function setApiKeys(keys: ApiKeys): void {
  if (typeof window === 'undefined') return
  
  localStorage.setItem(GEMINI_KEY, keys.geminiKey)
  localStorage.setItem(BRAVE_KEY, keys.braveKey)
  localStorage.setItem(GROQ_KEY, keys.groqKey)
}

export function clearApiKeys(): void {
  if (typeof window === 'undefined') return
  
  localStorage.removeItem(GEMINI_KEY)
  localStorage.removeItem(BRAVE_KEY)
  localStorage.removeItem(GROQ_KEY)
}

export function hasRequiredKeys(forVision: boolean = false): { valid: boolean; missing: string[] } {
  const keys = getApiKeys()
  const missing: string[] = []
  
  if (forVision && !keys.geminiKey) {
    missing.push('Gemini')
  }
  if (!keys.braveKey) {
    missing.push('Brave Search')
  }
  if (!keys.groqKey) {
    missing.push('Groq')
  }
  
  return {
    valid: missing.length === 0,
    missing,
  }
}

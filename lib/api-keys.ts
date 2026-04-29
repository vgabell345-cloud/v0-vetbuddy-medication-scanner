import { ApiKeys } from './types'

const OPENAI_KEY = 'openai_key'
const BRAVE_KEY = 'brave_key'

export function getApiKeys(): ApiKeys {
  if (typeof window === 'undefined') {
    return { openaiKey: '', braveKey: '' }
  }
  
  return {
    openaiKey: localStorage.getItem(OPENAI_KEY) || '',
    braveKey: localStorage.getItem(BRAVE_KEY) || '',
  }
}

export function setApiKeys(keys: ApiKeys): void {
  if (typeof window === 'undefined') return
  
  localStorage.setItem(OPENAI_KEY, keys.openaiKey)
  localStorage.setItem(BRAVE_KEY, keys.braveKey)
}

export function clearApiKeys(): void {
  if (typeof window === 'undefined') return
  
  localStorage.removeItem(OPENAI_KEY)
  localStorage.removeItem(BRAVE_KEY)
}

export function hasRequiredKeys(forVision: boolean = false): { valid: boolean; missing: string[] } {
  const keys = getApiKeys()
  const missing: string[] = []
  
  if (!keys.openaiKey) {
    missing.push('OpenAI')
  }
  if (!keys.braveKey) {
    missing.push('Brave Search')
  }
  
  return {
    valid: missing.length === 0,
    missing,
  }
}

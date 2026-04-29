import { ApiKeys } from './types'

const OPENAI_KEY = 'openai_key'

export function getApiKeys(): ApiKeys {
  if (typeof window === 'undefined') {
    return { openaiKey: '' }
  }
  
  return {
    openaiKey: localStorage.getItem(OPENAI_KEY) || '',
  }
}

export function setApiKeys(keys: ApiKeys): void {
  if (typeof window === 'undefined') return
  
  localStorage.setItem(OPENAI_KEY, keys.openaiKey)
}

export function clearApiKeys(): void {
  if (typeof window === 'undefined') return
  
  localStorage.removeItem(OPENAI_KEY)
}

export function hasRequiredKeys(): { valid: boolean; missing: string[] } {
  const keys = getApiKeys()
  const missing: string[] = []
  
  if (!keys.openaiKey) {
    missing.push('OpenAI')
  }
  
  return {
    valid: missing.length === 0,
    missing,
  }
}

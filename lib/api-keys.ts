import { ApiKeys } from './types'

const CLAUDE_KEY = 'claude_key'
const BRAVE_KEY = 'brave_key'
const GROQ_KEY = 'groq_key'

export function getApiKeys(): ApiKeys {
  if (typeof window === 'undefined') {
    return { claudeKey: '', braveKey: '', groqKey: '' }
  }
  
  return {
    claudeKey: localStorage.getItem(CLAUDE_KEY) || '',
    braveKey: localStorage.getItem(BRAVE_KEY) || '',
    groqKey: localStorage.getItem(GROQ_KEY) || '',
  }
}

export function setApiKeys(keys: ApiKeys): void {
  if (typeof window === 'undefined') return
  
  localStorage.setItem(CLAUDE_KEY, keys.claudeKey)
  localStorage.setItem(BRAVE_KEY, keys.braveKey)
  localStorage.setItem(GROQ_KEY, keys.groqKey)
}

export function clearApiKeys(): void {
  if (typeof window === 'undefined') return
  
  localStorage.removeItem(CLAUDE_KEY)
  localStorage.removeItem(BRAVE_KEY)
  localStorage.removeItem(GROQ_KEY)
}

export function hasRequiredKeys(forVision: boolean = false): { valid: boolean; missing: string[] } {
  const keys = getApiKeys()
  const missing: string[] = []
  
  if (forVision && !keys.claudeKey) {
    missing.push('Claude')
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

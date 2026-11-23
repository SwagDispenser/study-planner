import { ApiError } from '../api/errors.ts'
import type { AuthSession } from '../types/auth.ts'

// One in-memory session is shared by Auth Context, route loaders and API code.
let session: AuthSession | null = null
const listeners = new Set<() => void>()

export function getSession(): AuthSession | null {
  return session
}

export function setSession(value: AuthSession | null): void {
  session = value
  listeners.forEach((listener) => listener())
}

export function subscribeToSession(listener: () => void): () => void {
  listeners.add(listener)
  return () => { listeners.delete(listener) }
}

export function requireSession(): AuthSession {
  if (!session) throw new ApiError('Увійдіть, щоб змінювати завдання.', 401)
  return session
}

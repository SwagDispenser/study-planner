import { createContext } from 'react'
import type { AuthSession, AuthUser } from '../types/auth'
import type { LoginData } from '../schemas/authSchema'

export interface AuthContextValue {
  user: AuthUser | null
  accessToken: AuthSession['accessToken'] | null
  isAuthenticated: boolean
  login: (credentials: LoginData) => Promise<void>
  logout: () => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)

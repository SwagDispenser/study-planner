import { useSyncExternalStore } from 'react'
import type { ReactNode } from 'react'
import { getSession, setSession, subscribeToSession } from '../auth/authSession'
import { authRepository } from '../repositories/authRepository'
import type { LoginData } from '../schemas/authSchema'
import { AuthContext } from './AuthContext'

function AuthProvider({ children }: { children: ReactNode }) {
  const session = useSyncExternalStore(subscribeToSession, getSession)

  async function login(credentials: LoginData) {
    setSession(await authRepository.login(credentials))
  }

  return (
    <AuthContext.Provider value={{
      user: session?.user ?? null,
      accessToken: session?.accessToken ?? null,
      isAuthenticated: session !== null,
      login,
      logout: () => setSession(null),
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthProvider

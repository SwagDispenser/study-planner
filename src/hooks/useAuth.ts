import { useContext } from 'react'
import { AuthContext } from '../context/AuthContext'

export function useAuth() {
  const value = useContext(AuthContext)
  if (!value) throw new Error('useAuth потрібно використовувати всередині AuthProvider.')
  return value
}

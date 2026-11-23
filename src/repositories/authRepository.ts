import { httpClient } from '../api/httpClient.ts'
import type { HttpClient } from '../api/httpClient.ts'
import { ApiError } from '../api/errors.ts'
import type { AuthSession, AuthUser } from '../types/auth.ts'
import type { LoginData } from '../schemas/authSchema.ts'

export function createAuthRepository(client: HttpClient) {
  return {
    async login(credentials: LoginData): Promise<AuthSession> {
      const response = await client<{ accessToken: string }>('/auth/login', {
        method: 'POST', body: JSON.stringify(credentials),
      })
      if (!response.accessToken) throw new ApiError('API не повернув accessToken.')
      const user = await client<AuthUser>('/auth/me', { accessToken: response.accessToken })
      if (!Number.isSafeInteger(user.id) || !user.username || !user.email) {
        throw new ApiError('API повернув некоректні дані користувача.')
      }
      return {
        accessToken: response.accessToken,
        user: { id: user.id, username: user.username, email: user.email },
      }
    },
  }
}

export const authRepository = createAuthRepository(httpClient)

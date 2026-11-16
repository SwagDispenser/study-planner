import { ApiError, isAbortError } from './errors.ts'

export type HttpClient = <T>(path: string, options?: RequestInit) => Promise<T>

export function createHttpClient(baseUrl: string | undefined): HttpClient {
  return async <T>(path: string, options: RequestInit = {}): Promise<T> => {
    let url: URL
    try {
      if (!baseUrl) throw new Error('Missing API URL')
      url = new URL(`${baseUrl.replace(/\/+$/, '')}/${path.replace(/^\/+/, '')}`)
      if (!['https:', 'http:'].includes(url.protocol)) throw new Error('Invalid protocol')
    } catch {
      throw new ApiError('Перевірте VITE_API_URL у файлі .env та перезапустіть застосунок.')
    }

    try {
      const headers = new Headers(options.headers)
      headers.set('Accept', 'application/json')
      if (options.body) headers.set('Content-Type', 'application/json')
      const response = await fetch(url, { ...options, headers })
      if (!response.ok) {
        const message = response.status === 404
          ? 'Завдання не знайдено на сервері.'
          : `Помилка сервера (HTTP ${response.status}). Спробуйте ще.`
        throw new ApiError(message, response.status)
      }
      if (response.status === 204) return undefined as T
      return await response.json() as T
    } catch (error) {
      if (isAbortError(error) || error instanceof ApiError) throw error
      throw new ApiError('Не вдалося отримати відповідь API. Перевірте з’єднання та спробуйте ще.')
    }
  }
}

export const httpClient = createHttpClient(import.meta.env?.VITE_API_URL)

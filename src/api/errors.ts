export class ApiError extends Error {
  readonly status?: number

  constructor(message: string, status?: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

export function isAbortError(error: unknown): boolean {
  return error instanceof Error && error.name === 'AbortError'
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message
  return 'Не вдалося виконати запит. Перевірте з’єднання та спробуйте ще.'
}

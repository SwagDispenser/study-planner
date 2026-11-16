import { useEffect, useState } from 'react'
import { readStoredValue } from '../utils/storage'

export function useLocalStorage<T>(
  key: string,
  initialValue: T,
  isValid: (value: unknown) => value is T,
) {
  const [value, setValue] = useState<T>(() => readStoredValue(key, initialValue, isValid))

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value))
    } catch {
      console.warn(`Не вдалося зберегти налаштування: ${key}`)
    }
  }, [key, value])

  return [value, setValue] as const
}

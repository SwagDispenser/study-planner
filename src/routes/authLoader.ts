import { redirect } from 'react-router'
import type { LoaderFunctionArgs } from 'react-router'
import { getSession } from '../auth/authSession.ts'

export function profileLoader({ request }: LoaderFunctionArgs) {
  if (!getSession()) {
    const url = new URL(request.url)
    throw redirect(`/login?redirectTo=${encodeURIComponent(url.pathname + url.search)}`)
  }
  return null
}

export function getReturnPath(value: string | null): string {
  if (!value || !value.startsWith('/') || value.startsWith('//') || value.includes('\\') || value.startsWith('/login')) return '/tasks'
  return value
}

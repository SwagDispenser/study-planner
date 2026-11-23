export interface AuthUser {
  id: number
  username: string
  email: string
}

export interface AuthSession {
  user: AuthUser
  accessToken: string
}

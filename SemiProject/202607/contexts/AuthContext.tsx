'use client'

/**
 * 認証（擬似ログイン）の状態管理（React Context + localStorage 永続化）。
 *
 * ログインAPIから返ったユーザーオブジェクトを localStorage に保持するだけの
 * 簡易方式（design/state-management.md の方針）。トークンやセッションは扱わない。
 *
 * 使い方:
 *   const { user, isLoggedIn, login, logout } = useAuth()
 *   await login(email, password)
 *
 * Provider はルートの app/layout.tsx で <AuthProvider> を配置済み。
 * 認証必須ページの制御例は components/README に記載。
 */
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { api } from '@/lib/apiClient'
import type { User, UserResponse } from '@/lib/types'

type AuthContextValue = {
  user: User | null
  isLoggedIn: boolean
  /** 初回マウント時の localStorage 復元が終わったか（チラつき防止に使う） */
  isReady: boolean
  login: (email: string, password: string) => Promise<User>
  signup: (name: string, email: string, password: string) => Promise<User>
  logout: () => void
  /** サーバーから最新のユーザー情報を取り直す */
  refresh: () => Promise<void>
  /** プロフィール更新後などに、保持しているユーザー情報を差し替える */
  setUser: (user: User) => void
}

const STORAGE_KEY = 'finaltest.auth.user'

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<User | null>(null)
  const [isReady, setIsReady] = useState(false)

  // 初回マウント時に localStorage から復元
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) setUserState(JSON.parse(raw) as User)
    } catch {
      setUserState(null)
    } finally {
      setIsReady(true)
    }
  }, [])

  function persist(next: User | null) {
    setUserState(next)
    try {
      if (next) localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      else localStorage.removeItem(STORAGE_KEY)
    } catch {
      // 保存失敗は無視
    }
  }

  async function login(email: string, password: string) {
    const res = await api.post<UserResponse>('/api/auth/login', { email, password })
    persist(res.user)
    return res.user
  }

  async function signup(name: string, email: string, password: string) {
    const res = await api.post<UserResponse>('/api/auth/signup', { name, email, password })
    persist(res.user)
    return res.user
  }

  function logout() {
    persist(null)
  }

  async function refresh() {
    if (!user) return
    const res = await api.get<UserResponse>(`/api/users/${user.id}`)
    persist(res.user)
  }

  function setUser(next: User) {
    persist(next)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoggedIn: user !== null,
        isReady,
        login,
        signup,
        logout,
        refresh,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth は <AuthProvider> の内側で使用してください')
  return ctx
}

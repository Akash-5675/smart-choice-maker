import React, { createContext, useContext, useEffect, useMemo, useState } from "react"

import { api, clearAuthToken, getStoredToken, setAuthToken } from "../api"

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)

  useEffect(() => {
    const initializeAuth = async () => {
      const token = getStoredToken()

      if (!token) {
        setAuthLoading(false)
        return
      }

      setAuthToken(token)

      try {
        const response = await api.get("/auth/me")
        setUser(response.data.user)
      } catch (error) {
        clearAuthToken()
        setUser(null)
      } finally {
        setAuthLoading(false)
      }
    }

    initializeAuth()
  }, [])

  const applyAuthResponse = (payload) => {
    setAuthToken(payload.token)
    setUser(payload.user)
  }

  const logout = async () => {
    try {
      await api.post("/auth/logout")
    } catch (error) {
      // Clear the local session even if the server token is already stale.
    } finally {
      clearAuthToken()
      setUser(null)
    }
  }

  const value = useMemo(
    () => ({
      user,
      isLoggedIn: Boolean(user),
      authLoading,
      applyAuthResponse,
      logout
    }),
    [authLoading, user]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider")
  }

  return context
}

import React, { useEffect, useMemo, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"

import { api } from "../api"
import { useAuth } from "../context/AuthContext"

function AuthPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { applyAuthResponse, isLoggedIn } = useAuth()
  const [email, setEmail] = useState("")
  const [name, setName] = useState("")
  const [password, setPassword] = useState("")
  const [mode, setMode] = useState("lookup")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const redirectTarget = useMemo(() => {
    return location.state?.from || "/dashboard"
  }, [location.state])

  useEffect(() => {
    if (isLoggedIn) {
      navigate("/dashboard", { replace: true })
    }
  }, [isLoggedIn, navigate])

  const validateEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())

  const handleLookup = async () => {
    if (!validateEmail(email)) {
      setError("Enter a valid email address.")
      return
    }

    setLoading(true)
    setError("")

    try {
      const response = await api.post("/auth/lookup", {
        email: email.trim()
      })

      setMode(response.data.exists ? "login" : "register")
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to continue right now.")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async () => {
    if (!validateEmail(email)) {
      setError("Enter a valid email address.")
      return
    }

    if (password.trim().length < 8) {
      setError("Password must be at least 8 characters long.")
      return
    }

    if (mode === "register" && name.trim().length < 2) {
      setError("Name must be at least 2 characters long.")
      return
    }

    setLoading(true)
    setError("")

    try {
      const response = await api.post(
        mode === "login" ? "/auth/login" : "/auth/register",
        mode === "login"
          ? {
              email: email.trim(),
              password
            }
          : {
              name: name.trim(),
              email: email.trim(),
              password
            }
      )

      applyAuthResponse(response.data)
      navigate(redirectTarget, { replace: true })
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Authentication failed.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="auth-page">
      <div className="auth-card">
        <p className="eyebrow">Account access</p>
        <h1>{mode === "login" ? "Welcome back" : mode === "register" ? "Create your account" : "Start with your email"}</h1>
        <p className="auth-copy">
          If your email already exists, we will take you to login. If not, we
          will continue with registration.
        </p>

        <div className="form-grid">
          <label className="field">
            <span>Email address</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
            />
          </label>

          {mode === "register" && (
            <label className="field">
              <span>Full name</span>
              <input
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Enter your name"
              />
            </label>
          )}

          {mode !== "lookup" && (
            <label className="field">
              <span>Password</span>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="At least 8 characters"
              />
            </label>
          )}
        </div>

        {error && <div className="alert alert--error">{error}</div>}

        <div className="auth-actions">
          {mode === "lookup" ? (
            <button type="button" className="button button--primary" onClick={handleLookup} disabled={loading}>
              {loading ? "Checking..." : "Continue"}
            </button>
          ) : (
            <>
              <button type="button" className="button button--primary" onClick={handleSubmit} disabled={loading}>
                {loading
                  ? mode === "login"
                    ? "Signing in..."
                    : "Creating account..."
                  : mode === "login"
                    ? "Log In"
                    : "Register"}
              </button>
              <button
                type="button"
                className="button button--ghost"
                onClick={() => {
                  setMode("lookup")
                  setPassword("")
                  setName("")
                  setError("")
                }}
              >
                Change Email
              </button>
            </>
          )}
        </div>
      </div>
    </section>
  )
}

export default AuthPage

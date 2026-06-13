import React, { useState } from "react"
import { Link, useNavigate, useSearchParams } from "react-router-dom"

import { api } from "../api"
import { useAuth } from "../context/AuthContext"

function ForgotPasswordPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { applyAuthResponse } = useAuth()

  const tokenFromUrl = searchParams.get("token") || ""

  const [mode, setMode] = useState(tokenFromUrl ? "reset" : "request")
  const [email, setEmail] = useState("")
  const [token, setToken] = useState(tokenFromUrl)
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const handleRequest = async () => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Enter a valid email address.")
      return
    }

    setLoading(true)
    setError("")

    try {
      const response = await api.post("/auth/forgot-password", { email: email.trim() })
      setSuccess(response.data.message)
    } catch (err) {
      setError(err.response?.data?.message || "Unable to process request.")
    } finally {
      setLoading(false)
    }
  }

  const handleReset = async () => {
    if (!token.trim()) {
      setError("Reset token is required.")
      return
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.")
      return
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.")
      return
    }

    setLoading(true)
    setError("")

    try {
      const response = await api.post("/auth/reset-password", { token: token.trim(), password })
      applyAuthResponse(response.data)
      navigate("/dashboard", { replace: true })
    } catch (err) {
      setError(err.response?.data?.message || "Unable to reset password.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="auth-page">
      <div className="auth-card">
        <p className="eyebrow">Account access</p>
        <h1>{mode === "request" ? "Reset your password" : "Set new password"}</h1>
        <p className="auth-copy">
          {mode === "request"
            ? "Enter your email and we will send you a reset link."
            : "Enter your new password below."}
        </p>

        <div className="form-grid">
          {mode === "request" ? (
            <label className="field">
              <span>Email address</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
            </label>
          ) : (
            <>
              <label className="field">
                <span>New password</span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
                />
              </label>
              <label className="field">
                <span>Confirm password</span>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat your new password"
                />
              </label>
            </>
          )}
        </div>

        {error && <div className="alert alert--error">{error}</div>}
        {success && !error && (
          <div className="alert alert--success">{success}</div>
        )}

        <div className="auth-actions">
          {mode === "request" ? (
            <button
              type="button"
              className="button button--primary"
              onClick={handleRequest}
              disabled={loading}
            >
              {loading ? "Sending..." : "Send reset link"}
            </button>
          ) : (
            <button
              type="button"
              className="button button--primary"
              onClick={handleReset}
              disabled={loading}
            >
              {loading ? "Updating..." : "Set new password"}
            </button>
          )}
          <Link to="/auth" className="button button--ghost">
            Back to login
          </Link>
        </div>
      </div>
    </section>
  )
}

export default ForgotPasswordPage

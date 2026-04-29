import React from "react"
import { Navigate, useLocation } from "react-router-dom"

import { useAuth } from "../context/AuthContext"

function ProtectedRoute({ children }) {
  const { isLoggedIn, authLoading } = useAuth()
  const location = useLocation()

  if (authLoading) {
    return <div className="status-card">Checking your session...</div>
  }

  if (!isLoggedIn) {
    return <Navigate to="/auth" replace state={{ from: location.pathname }} />
  }

  return children
}

export default ProtectedRoute

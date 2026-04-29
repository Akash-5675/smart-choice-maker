import React from "react"
import { BrowserRouter as Router, Navigate, Route, Routes } from "react-router-dom"

import AppShell from "./components/AppShell"
import ProtectedRoute from "./components/ProtectedRoute"
import { AuthProvider } from "./context/AuthContext"
import AccountPage from "./pages/AccountPage"
import AuthPage from "./pages/AuthPage"
import CreateDecision from "./pages/CreateDecision"
import Dashboard from "./pages/Dashboard"
import DecisionWorkspace from "./pages/DecisionWorkspace"
import LandingPage from "./pages/LandingPage"

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<AppShell />}>
            <Route index element={<LandingPage />} />
            <Route path="auth" element={<AuthPage />} />
            <Route
              path="dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="create"
              element={
                <ProtectedRoute>
                  <CreateDecision />
                </ProtectedRoute>
              }
            />
            <Route
              path="decision/:id"
              element={
                <ProtectedRoute>
                  <DecisionWorkspace />
                </ProtectedRoute>
              }
            />
            <Route
              path="account"
              element={
                <ProtectedRoute>
                  <AccountPage />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App

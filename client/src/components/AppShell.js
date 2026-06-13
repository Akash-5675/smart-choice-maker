import React, { useState } from "react"
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom"

import { useAuth } from "../context/AuthContext"

function AppShell() {
  const { user, isLoggedIn, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleStartClick = () => {
    navigate(isLoggedIn ? "/create" : "/auth", {
      state: !isLoggedIn ? { from: location.pathname } : undefined
    })
  }

  const handleLogout = async () => {
    await logout()
    setMenuOpen(false)
    navigate("/")
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <Link to="/" className="brand-mark">
          <span className="brand-mark__badge">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" style={{width:"100%",height:"100%",display:"block"}} aria-hidden="true">
              <defs>
                <linearGradient id="scm-a" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#f59e0b"/>
                  <stop offset="100%" stopColor="#92400e"/>
                </linearGradient>
                <linearGradient id="scm-b" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#136f63"/>
                  <stop offset="100%" stopColor="#0d4d44"/>
                </linearGradient>
              </defs>
              <path d="M32 7 L57 32 L32 57 L7 32 Z" fill="url(#scm-a)"/>
              <path d="M32 7 L7 32 L32 32 Z" fill="url(#scm-b)" opacity="0.35"/>
              <polyline points="18,32 27,43 47,20" fill="none" stroke="white" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </span>
          <span>
            <strong>Smart Choice Maker</strong>
            <small>Weighted decisions made clearer</small>
          </span>
        </Link>

        <nav className="topbar__nav">
          <NavLink
            to="/"
            end
            className={({ isActive }) => (isActive ? "topbar__link active" : "topbar__link")}
          >
            Home
          </NavLink>

          {isLoggedIn && (
            <NavLink
              to="/dashboard"
              className={({ isActive }) => (isActive ? "topbar__link active" : "topbar__link")}
            >
              Decisions
            </NavLink>
          )}

          <button type="button" className="button button--ghost" onClick={handleStartClick}>
            Start a Decision
          </button>

          {isLoggedIn ? (
            <div className="account-menu">
              <button
                type="button"
                className="account-menu__trigger"
                onClick={() => setMenuOpen((current) => !current)}
              >
                <span className="account-menu__avatar">
                  {user?.name?.trim()?.[0]?.toUpperCase() || "A"}
                </span>
                <span className="account-menu__meta">
                  <strong>{user?.name}</strong>
                  <small>{user?.email}</small>
                </span>
              </button>

              {menuOpen && (
                <div className="account-menu__panel">
                  <Link
                    to="/account"
                    className="account-menu__item"
                    onClick={() => setMenuOpen(false)}
                  >
                    Account Page
                  </Link>
                  <button
                    type="button"
                    className="account-menu__item account-menu__item--button"
                    onClick={handleLogout}
                  >
                    Log Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/auth" className="button button--primary">
              Login / Register
            </Link>
          )}
        </nav>
      </header>

      <main className="page-frame">
        <Outlet />
      </main>
    </div>
  )
}

export default AppShell

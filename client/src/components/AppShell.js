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
          <span className="brand-mark__badge">SCM</span>
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

import React from "react"
import { useNavigate } from "react-router-dom"

import { useAuth } from "../context/AuthContext"

function LandingPage() {
  const navigate = useNavigate()
  const { isLoggedIn } = useAuth()

  const handlePrimaryAction = () => {
    navigate(isLoggedIn ? "/create" : "/auth")
  }

  return (
    <section className="landing-page">
      <div className="hero-card">
        <div className="hero-card__content">
          <p className="eyebrow">Decision support that shows its work</p>
          <h1>Choose with confidence instead of guesswork.</h1>
          <p className="hero-copy">
            Smart Choice Maker helps you compare options using weighted criteria,
            side-by-side scoring, and an auto-generated report that explains why
            the winning option came out on top.
          </p>

          <div className="hero-actions">
            <button type="button" className="button button--primary" onClick={handlePrimaryAction}>
              Create a Decision
            </button>
            <button
              type="button"
              className="button button--ghost"
              onClick={() => navigate("/auth")}
            >
              Login / Register
            </button>
          </div>
        </div>

        <div className="hero-card__panel">
          <div className="metric-card">
            <span>Step 1</span>
            <strong>Set the decision</strong>
            <p>Define what you are choosing and what matters most.</p>
          </div>
          <div className="metric-card">
            <span>Step 2</span>
            <strong>Score the options</strong>
            <p>Rate each option against each criterion on a consistent scale.</p>
          </div>
          <div className="metric-card">
            <span>Step 3</span>
            <strong>Download the report</strong>
            <p>Get a PDF summary with totals, reasoning, and decision facts.</p>
          </div>
        </div>
      </div>
    </section>
  )
}

export default LandingPage

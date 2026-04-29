import React, { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { api } from "../api"

function Dashboard() {
  const [decisions, setDecisions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchDecisions()
  }, [])

  const fetchDecisions = async () => {
    try {
      setLoading(true)
      const response = await api.get("/decisions")
      setDecisions(response.data)
      setError("")
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to load your decisions.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="stack-page">
      <div className="section-header section-header--row">
        <div>
          <p className="eyebrow">Dashboard</p>
          <h1>Your decisions</h1>
          <p>Review saved comparisons or create a new one.</p>
        </div>

        <Link to="/create" className="button button--primary">
          Create New Decision
        </Link>
      </div>

      {error && <div className="alert alert--error">{error}</div>}

      {loading ? (
        <div className="status-card">Loading your saved decisions...</div>
      ) : decisions.length === 0 ? (
        <div className="status-card">
          <h2>No decisions yet</h2>
          <p>Create your first decision to start comparing options.</p>
        </div>
      ) : (
        <div className="card-grid">
          {decisions.map((decision) => (
            <article key={decision._id} className="decision-card">
              <div>
                <p className="decision-card__label">Saved comparison</p>
                <h2>{decision.title}</h2>
                <p>{decision.description || "No description added yet."}</p>
              </div>

              <Link to={`/decision/${decision._id}`} className="button button--ghost">
                Open Decision
              </Link>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}

export default Dashboard

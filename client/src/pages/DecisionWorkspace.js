import React, { useEffect, useState } from "react"
import { useParams, Link, useLocation } from "react-router-dom"

import AddCriteria from "./AddCriteria"
import AddOption from "./AddOption"
import DecisionMatrix from "./DecisionMatrix"
import Results from "./Results"
import { api } from "../api"

function DecisionWorkspace() {
  const { id } = useParams()
  const { state } = useLocation()

  const [decision, setDecision] = useState(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const [error, setError] = useState("")
  const [suggestedCriteria, setSuggestedCriteria] = useState(
    state?.mlSuggestions || []
  )

  useEffect(() => {
    const loadDecision = async () => {
      try {
        const res = await api.get(`/decisions/${id}`)
        setDecision(res.data)
        setError("")
      } catch (requestError) {
        setError(requestError.response?.data?.message || "Unable to load this decision.")
      }
    }

    loadDecision()
  }, [id])

  useEffect(() => {
    const loadSuggestions = async () => {
      if (!decision?.title || suggestedCriteria.length > 0) {
        return
      }

      try {
        const response = await api.post("/ml/recommend-criteria", {
          decision: decision.title
        })

        setSuggestedCriteria(response.data.criteria || [])
      } catch (error) {
        setSuggestedCriteria([])
      }
    }

    loadSuggestions()
  }, [decision, suggestedCriteria.length])

  const handleDataChanged = () => {
    setRefreshKey((current) => current + 1)
  }

  return (
    <section className="stack-page">
      <div className="section-header">
        <Link to="/dashboard" className="text-link">
          Back to Dashboard
        </Link>
        <p className="eyebrow">Decision workspace</p>
        <h1>{decision ? decision.title : "Loading decision..."}</h1>
        {decision?.description && <p>{decision.description}</p>}
      </div>

      {error && <div className="alert alert--error">{error}</div>}

      <div className="workspace-grid">
        <div className="panel">
          <AddCriteria
            decisionId={id}
            suggestedCriteria={suggestedCriteria}
            onCriteriaAdded={handleDataChanged}
          />
        </div>

        <div className="panel">
          <AddOption decisionId={id} onOptionAdded={handleDataChanged} />
        </div>
      </div>

      <div className="panel">
        <DecisionMatrix
          decisionId={id}
          refreshKey={refreshKey}
          onRatingSaved={handleDataChanged}
        />
      </div>

      <div className="panel">
        <Results decisionId={id} refreshKey={refreshKey} />
      </div>
    </section>
  )
}

export default DecisionWorkspace

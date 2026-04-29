import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import { api } from "../api"

function CreateDecision() {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [loadingSuggestions, setLoadingSuggestions] = useState(false)
  const [creatingDecision, setCreatingDecision] = useState(false)
  const [suggestions, setSuggestions] = useState([])
  const [error, setError] = useState("")

  const navigate = useNavigate()

  const loadSuggestions = async () => {
    const decisionTitle = title.trim()

    if (!decisionTitle) {
      setSuggestions([])
      setError("Enter a decision title first to get criteria suggestions.")
      return
    }

    setLoadingSuggestions(true)
    setError("")

    try {
      const response = await api.post("/ml/recommend-criteria", {
        decision: decisionTitle
      })

      setSuggestions(response.data.criteria || [])
    } catch (requestError) {
      setSuggestions([])
      setError(
        requestError.response?.data?.message ||
          "ML suggestions are unavailable right now. You can still create the decision normally."
      )
    } finally {
      setLoadingSuggestions(false)
    }
  }

  const createDecision = async () => {
    if (!title.trim()) {
      setError("Enter a decision title before creating it.")
      return
    }

    try {
      setCreatingDecision(true)
      setError("")
      const response = await api.post("/decisions/create", {
        title,
        description
      })

      navigate(`/decision/${response.data._id}`, {
        state: {
          mlSuggestions: suggestions
        }
      })
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to create the decision.")
    } finally {
      setCreatingDecision(false)
    }

  }

  return (
    <section className="stack-page">
      <div className="section-header">
        <p className="eyebrow">New decision</p>
        <h1>Create your comparison workspace</h1>
        <p>Start with the decision title, then optionally load ML-based criteria suggestions.</p>
      </div>

      <div className="panel">
        <div className="form-grid">
          <label className="field">
            <span>Decision title</span>
            <input
              placeholder="Example: Which laptop should I buy?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </label>

          <label className="field">
            <span>Description</span>
            <textarea
              placeholder="Add context, constraints, or what this choice is about."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows="4"
            />
          </label>
        </div>

        <div className="inline-actions">
          <button type="button" className="button button--ghost" onClick={loadSuggestions} disabled={loadingSuggestions}>
            {loadingSuggestions ? "Loading..." : "Suggest Criteria"}
          </button>
          <button type="button" className="button button--primary" onClick={createDecision} disabled={creatingDecision}>
            {creatingDecision ? "Creating..." : "Create Decision"}
          </button>
        </div>

        {error && <div className="alert alert--error">{error}</div>}

        {suggestions.length > 0 && (
          <div className="subsection">
            <h2>Suggested Criteria</h2>
            <p>
              These are optional ML suggestions based on your decision title. You can edit or ignore them later.
            </p>
            <div className="chip-row">
              {suggestions.map((suggestion) => (
                <span key={suggestion} className="chip">
                  {suggestion}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

export default CreateDecision

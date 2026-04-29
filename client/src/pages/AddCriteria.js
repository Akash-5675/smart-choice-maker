import React, { useState } from "react"
import { api } from "../api"
import { SCALE_MAX, SCALE_MIN, WEIGHT_GUIDE } from "../constants"

function AddCriteria({ decisionId, suggestedCriteria = [], onCriteriaAdded }) {
  const [name, setName] = useState("")
  const [weight, setWeight] = useState(SCALE_MIN)
  const [statusMessage, setStatusMessage] = useState("")
  const [loading, setLoading] = useState(false)

  const addCriteria = async () => {
    if (!name.trim()) {
      setStatusMessage("Enter a criteria name before saving.")
      return
    }

    try {
      setLoading(true)
      await api.post("/criteria/create", {
        decisionId,
        name: name.trim(),
        weight: Number(weight)
      })

      setStatusMessage(`Saved "${name.trim()}" with weight ${weight}.`)

      setName("")
      setWeight(SCALE_MIN)
      onCriteriaAdded?.()
    } catch (requestError) {
      setStatusMessage(
        requestError.response?.data?.message || "Unable to save the criteria."
      )
    } finally {
      setLoading(false)
    }

  }

  return (
    <div className="stack-form">
      <div>
        <h2>Add criteria</h2>
        <p>Define the factors that matter and assign how important each one is.</p>
      </div>

      <label className="field">
        <span>Criteria name</span>
        <input
          placeholder="Example: Cost"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </label>

      <label className="field">
        <span>Weight</span>
        <input
          placeholder="Weight"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          type="number"
          min={SCALE_MIN}
          max={SCALE_MAX}
        />
      </label>

      <button type="button" className="button button--primary" onClick={addCriteria} disabled={loading}>
        {loading ? "Saving..." : "Add Criteria"}
      </button>

      <p className="helper-text">
        Weight scale: {WEIGHT_GUIDE.map((item) => `${item.value} = ${item.label}`).join(", ")}
      </p>

      {suggestedCriteria.length > 0 && (
        <div className="subsection">
          <h3>Suggested Criteria</h3>
          <p>
            Click a suggestion to prefill the criteria name, then choose a weight and save it.
          </p>
          <div className="chip-row">
            {suggestedCriteria.map((criteria) => (
              <button
                key={criteria}
                type="button"
                className="chip chip--button"
                onClick={() => setName(criteria)}
              >
                {criteria}
              </button>
            ))}
          </div>
        </div>
      )}

      {statusMessage && <p className="helper-text">{statusMessage}</p>}
    </div>
  )
}

export default AddCriteria

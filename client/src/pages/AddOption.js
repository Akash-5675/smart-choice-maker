import React, { useState } from "react"
import { api } from "../api"

function AddOption({ decisionId, onOptionAdded }) {
  const [name, setName] = useState("")
  const [statusMessage, setStatusMessage] = useState("")
  const [loading, setLoading] = useState(false)

  const addOption = async () => {
    if (!name.trim()) {
      setStatusMessage("Enter an option name before saving.")
      return
    }

    try {
      setLoading(true)
      await api.post("/options/create", {
        decisionId,
        name: name.trim()
      })

      setStatusMessage(`Saved option "${name.trim()}".`)

      setName("")
      onOptionAdded?.()
    } catch (requestError) {
      setStatusMessage(
        requestError.response?.data?.message || "Unable to save the option."
      )
    } finally {
      setLoading(false)
    }

  }

  return (
    <div className="stack-form">
      <div>
        <h2>Add options</h2>
        <p>List the choices you want to compare in this decision.</p>
      </div>

      <label className="field">
        <span>Option name</span>
        <input
          placeholder="Example: Option A"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </label>

      <button type="button" className="button button--primary" onClick={addOption} disabled={loading}>
        {loading ? "Saving..." : "Add Option"}
      </button>

      {statusMessage && <p className="helper-text">{statusMessage}</p>}
    </div>
  )
}

export default AddOption

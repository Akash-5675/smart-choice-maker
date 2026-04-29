import React, { useEffect, useState } from "react"
import { api } from "../api"
import { RATING_GUIDE, SCALE_MAX, SCALE_MIN } from "../constants"

function DecisionMatrix({ decisionId, refreshKey, onRatingSaved }) {
  const [criteria, setCriteria] = useState([])
  const [options, setOptions] = useState([])
  const [ratings, setRatings] = useState({})
  const [statusMessage, setStatusMessage] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadMatrix = async () => {
      try {
        setLoading(true)
        const [criteriaRes, optionRes, ratingsRes] = await Promise.all([
          api.get(`/criteria/${decisionId}`),
          api.get(`/options/${decisionId}`),
          api.get(`/ratings/${decisionId}`)
        ])

        const existingRatings = {}

        ratingsRes.data.forEach((rating) => {
          existingRatings[`${rating.criteriaId}-${rating.optionId}`] = rating.value
        })

        setCriteria(criteriaRes.data)
        setOptions(optionRes.data)
        setRatings(existingRatings)
      } catch (requestError) {
        setStatusMessage(
          requestError.response?.data?.message || "Unable to load the decision matrix."
        )
      } finally {
        setLoading(false)
      }
    }

    loadMatrix()
  }, [decisionId, refreshKey])

  const saveRating = async (criteriaId, optionId, value) => {

    const numericValue = Number(value)

    if (
      Number.isNaN(numericValue) ||
      numericValue < SCALE_MIN ||
      numericValue > SCALE_MAX
    ) {
      setStatusMessage(`Ratings must stay between ${SCALE_MIN} and ${SCALE_MAX}.`)
      return
    }

    await api.post("/ratings/create", {
      decisionId,
      criteriaId,
      optionId,
      value: numericValue
    })

    setRatings((current) => ({
      ...current,
      [`${criteriaId}-${optionId}`]: numericValue
    }))
    setStatusMessage(`Saved rating ${numericValue}.`)
    onRatingSaved?.()
  }

  return (
    <div className="stack-form">
      <div>
        <h2>Decision matrix</h2>
        <p>
          Rating guide: {RATING_GUIDE.map((item) => `${item.value} = ${item.label}`).join(", ")}
        </p>
        <p>Final score = sum of each rating multiplied by its criteria weight.</p>
      </div>

      {loading ? (
        <div className="status-card">Loading matrix data...</div>
      ) : criteria.length === 0 || options.length === 0 ? (
        <div className="status-card">
          Add at least one criterion and one option to start scoring the matrix.
        </div>
      ) : (
        <div className="table-wrap">
          <table className="decision-table">
            <thead>
              <tr>
                <th>Criteria</th>
                {options.map((option) => (
                  <th key={option._id}>{option.name}</th>
                ))}
              </tr>
            </thead>

            <tbody>
              {criteria.map((c) => (
                <tr key={c._id}>
                  <td>
                    <strong>{c.name}</strong>
                    <small>Weight: {c.weight}</small>
                  </td>

                  {options.map((o) => (
                    <td key={o._id}>
                      <input
                        type="number"
                        min={SCALE_MIN}
                        max={SCALE_MAX}
                        value={ratings[`${c._id}-${o._id}`] ?? ""}
                        onChange={(e) =>
                          setRatings((current) => ({
                            ...current,
                            [`${c._id}-${o._id}`]: e.target.value
                          }))
                        }
                        onBlur={(e) => saveRating(c._id, o._id, e.target.value)}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {statusMessage && <p className="helper-text">{statusMessage}</p>}
    </div>
  )
}

export default DecisionMatrix

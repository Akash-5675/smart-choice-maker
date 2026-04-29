import React, { useEffect, useState } from "react"
import { api } from "../api"

function Results({ decisionId, refreshKey }) {
  const [criteria, setCriteria] = useState([])
  const [options, setOptions] = useState([])
  const [scoreRows, setScoreRows] = useState([])
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    const loadResults = async () => {
      try {
        setLoading(true)
        const [c, o, r, reportResponse] = await Promise.all([
          api.get(`/criteria/${decisionId}`),
          api.get(`/options/${decisionId}`),
          api.get(`/ratings/${decisionId}`),
          api.get(`/decisions/${decisionId}/report`)
        ])

        setCriteria(c.data)
        setOptions(o.data)
        setReport(reportResponse.data)
        calculateScores(c.data, o.data, r.data)
        setError("")
      } catch (requestError) {
        setError(requestError.response?.data?.message || "Unable to load the results.")
      } finally {
        setLoading(false)
      }
    }

    loadResults()
  }, [decisionId, refreshKey])

  const calculateScores = (criteria, options, ratings) => {

    const result = options.map((option) => {
      const breakdown = criteria.map((criterion) => {
        const rating = ratings.find(
          (entry) =>
            entry.optionId === option._id && entry.criteriaId === criterion._id
        )

        const ratingValue = rating?.value || 0
        const contribution = ratingValue * criterion.weight

        return {
          criteriaName: criterion.name,
          weight: criterion.weight,
          rating: ratingValue,
          contribution
        }
      })

      const total = breakdown.reduce(
        (sum, entry) => sum + entry.contribution,
        0
      )

      return {
        name: option.name,
        total,
        breakdown
      }
    }).sort((first, second) => second.total - first.total)

    setScoreRows(result)

  }

  const bestOption = scoreRows[0]?.name || ""

  const downloadReport = async () => {
    try {
      setDownloading(true)
      const response = await api.get(`/decisions/${decisionId}/report/download`, {
        responseType: "blob"
      })
      const fileUrl = window.URL.createObjectURL(new Blob([response.data], { type: "application/pdf" }))
      const link = document.createElement("a")
      link.href = fileUrl
      link.download = `${report?.decision?.title || "decision-report"}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(fileUrl)
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to download the PDF report.")
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div className="stack-form">
      <div className="results-header">
        <div>
          <h2>Results and report</h2>
          <p>See the weighted ranking and download the generated PDF explanation.</p>
        </div>

        <button type="button" className="button button--primary" onClick={downloadReport} disabled={downloading || loading}>
          {downloading ? "Preparing PDF..." : "Download PDF Report"}
        </button>
      </div>

      {error && <div className="alert alert--error">{error}</div>}

      {loading ? (
        <div className="status-card">Calculating results...</div>
      ) : criteria.length === 0 || options.length === 0 ? (
        <div className="status-card">Add criteria and options to see results.</div>
      ) : (
        <>
          <div className="card-grid">
            {scoreRows.map((row) => (
              <article key={row.name} className="result-card">
                <div className="result-card__header">
                  <h3>{row.name}</h3>
                  <span className="score-badge">{row.total}</span>
                </div>
                {row.breakdown.map((entry) => (
                  <p key={`${row.name}-${entry.criteriaName}`}>
                    {entry.criteriaName}: {entry.rating} x {entry.weight} = {entry.contribution}
                  </p>
                ))}
              </article>
            ))}
          </div>

          <div className="summary-banner">
            <strong>Best Option:</strong> {bestOption || "Not available yet"}
          </div>

          {report && (
            <div className="report-layout">
              <article className="report-card">
                <h3>Generated explanation</h3>
                {report.narrative.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </article>

              <article className="report-card">
                <h3>Key facts</h3>
                <ul className="report-list">
                  <li>Criteria compared: {report.facts.criteriaCount}</li>
                  <li>Options compared: {report.facts.optionsCount}</li>
                  <li>
                    Ratings completed: {report.facts.ratingsCompleted} / {report.facts.ratingSlots}
                  </li>
                  <li>Completion rate: {report.facts.completionRate}%</li>
                  {report.facts.highestWeightedCriterion && (
                    <li>
                      Highest weighted criterion: {report.facts.highestWeightedCriterion.name} (
                      {report.facts.highestWeightedCriterion.weight})
                    </li>
                  )}
                </ul>
              </article>

              <article className="report-card">
                <h3>How the final decision was reached</h3>
                <ul className="report-list">
                  {report.insights.map((insight) => (
                    <li key={insight}>{insight}</li>
                  ))}
                </ul>
              </article>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default Results

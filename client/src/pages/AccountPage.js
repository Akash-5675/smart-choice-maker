import React, { useEffect, useState } from "react"

import { api } from "../api"
import { useAuth } from "../context/AuthContext"

function AccountPage() {
  const { user } = useAuth()
  const [decisionCount, setDecisionCount] = useState(0)

  useEffect(() => {
    const loadDecisionCount = async () => {
      const response = await api.get("/decisions")
      setDecisionCount(response.data.length)
    }

    loadDecisionCount()
  }, [])

  return (
    <section className="stack-page">
      <div className="section-header">
        <p className="eyebrow">Your account</p>
        <h1>Profile and activity</h1>
        <p>Manage the account details being used across your decision workspace.</p>
      </div>

      <div className="card-grid card-grid--two">
        <article className="info-card">
          <h2>Account Information</h2>
          <dl className="info-list">
            <div>
              <dt>Name</dt>
              <dd>{user?.name}</dd>
            </div>
            <div>
              <dt>Email</dt>
              <dd>{user?.email}</dd>
            </div>
            <div>
              <dt>Workspace</dt>
              <dd>Smart Choice Maker</dd>
            </div>
          </dl>
        </article>

        <article className="info-card">
          <h2>Decision Snapshot</h2>
          <dl className="info-list">
            <div>
              <dt>Total decisions</dt>
              <dd>{decisionCount}</dd>
            </div>
            <div>
              <dt>Saved reports</dt>
              <dd>Available per decision</dd>
            </div>
            <div>
              <dt>Status</dt>
              <dd>Logged in</dd>
            </div>
          </dl>
        </article>
      </div>
    </section>
  )
}

export default AccountPage

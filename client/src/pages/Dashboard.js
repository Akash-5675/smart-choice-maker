import React, { useEffect, useState } from "react"
import axios from "axios"
import { Link } from "react-router-dom"

function Dashboard() {

  const [decisions, setDecisions] = useState([])

  useEffect(() => {
    fetchDecisions()
  }, [])

  const fetchDecisions = async () => {
    const response = await axios.get("http://localhost:5000/decisions")
    setDecisions(response.data)
  }

  return (
    <div style={{ padding: "20px" }}>

      <h2>Your Decisions</h2>

      {/* Create new decision button */}
      <Link to="/create">
        <button style={{marginBottom:"20px"}}>
          Create New Decision
        </button>
      </Link>

      {decisions.map((decision) => (
        <div
          key={decision._id}
          style={{
            border: "1px solid gray",
            padding: "10px",
            marginBottom: "10px"
          }}
        >

          <h3>{decision.title}</h3>
          <p>{decision.description}</p>

          {/* open decision workspace */}
          <Link to={`/decision/${decision._id}`}>
            <button>Open Decision</button>
          </Link>

        </div>
      ))}

    </div>
  )
}

export default Dashboard
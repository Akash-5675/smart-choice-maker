import React from "react"
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"

import Dashboard from "./pages/Dashboard"
import CreateDecision from "./pages/CreateDecision"
import DecisionWorkspace from "./pages/DecisionWorkspace"

function App() {

  return (
    <Router>

      <div style={{ padding: "20px" }}>

        <h1 style={{ textAlign: "center" }}>
          Smart Choice Maker
        </h1>

        <Routes>

          <Route path="/" element={<Dashboard />} />

          <Route path="/create" element={<CreateDecision />} />

          <Route path="/decision/:id" element={<DecisionWorkspace />} />

        </Routes>

      </div>

    </Router>
  )

}

export default App
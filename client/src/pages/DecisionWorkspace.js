import React, { useEffect, useState } from "react"
import { useParams, Link } from "react-router-dom"
import axios from "axios"

import AddCriteria from "./AddCriteria"
import AddOption from "./AddOption"
import DecisionMatrix from "./DecisionMatrix"
import Results from "./Results"

function DecisionWorkspace() {

  const { id } = useParams()

  const [decision,setDecision] = useState(null)

  useEffect(()=>{
    fetchDecision()
  },[])

  const fetchDecision = async () => {

    const res = await axios.get("http://localhost:5000/decisions")

    const found = res.data.find(d => d._id === id)

    if(found){
      setDecision(found)
    }

  }

  return (

    <div style={{padding:"20px"}}>

      <Link to="/">← Back to Dashboard</Link>

      <h2>
        Decision: {decision ? decision.title : "Loading..."}
      </h2>

      <AddCriteria decisionId={id}/>

      <hr/>

      <AddOption decisionId={id}/>

      <hr/>

      <DecisionMatrix decisionId={id}/>

      <hr/>

      <Results decisionId={id}/>

    </div>

  )

}

export default DecisionWorkspace
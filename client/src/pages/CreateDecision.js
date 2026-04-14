import React, { useState } from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom"

function CreateDecision() {

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")

  const navigate = useNavigate()

  const createDecision = async () => {

    await axios.post("http://localhost:5000/decisions/create", {
      title,
      description
    })

    // after creating, go back to dashboard
    navigate("/")

  }

  return (

    <div style={{padding:"20px"}}>

      <h2>Create Decision</h2>

      <input
        placeholder="Decision Title"
        value={title}
        onChange={(e)=>setTitle(e.target.value)}
      />

      <br/><br/>

      <input
        placeholder="Description"
        value={description}
        onChange={(e)=>setDescription(e.target.value)}
      />

      <br/><br/>

      <button onClick={createDecision}>
        Create Decision
      </button>

    </div>

  )

}

export default CreateDecision
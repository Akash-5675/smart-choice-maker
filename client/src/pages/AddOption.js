import React, { useState } from "react"
import axios from "axios"

function AddOption({ decisionId }) {

  const [name,setName] = useState("")

  const addOption = async () => {

    await axios.post("http://localhost:5000/options/create",{
      decisionId,
      name
    })

    alert("Option added")

    setName("")

    window.location.reload()

  }

  return (

    <div>

      <h3>Add Option</h3>

      <input
        placeholder="Option name"
        value={name}
        onChange={(e)=>setName(e.target.value)}
      />

      <button onClick={addOption}>
        Add Option
      </button>

    </div>

  )

}

export default AddOption
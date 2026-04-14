import React, { useState } from "react"
import axios from "axios"

function AddCriteria({ decisionId }) {

  const [name,setName] = useState("")
  const [weight,setWeight] = useState("")

  const addCriteria = async () => {

    await axios.post("http://localhost:5000/criteria/create",{
      decisionId,
      name,
      weight
    })

    alert("Criteria added")

    setName("")
    setWeight("")

    window.location.reload()

  }

  return (

    <div>

      <h3>Add Criteria</h3>

      <input
        placeholder="Criteria name"
        value={name}
        onChange={(e)=>setName(e.target.value)}
      />

      <br/><br/>

      <input
        placeholder="Weight"
        value={weight}
        onChange={(e)=>setWeight(e.target.value)}
      />

      <br/><br/>

      <button onClick={addCriteria}>
        Add Criteria
      </button>

    </div>

  )

}

export default AddCriteria
import React, { useEffect, useState } from "react"
import axios from "axios"

function DecisionMatrix({ decisionId }) {

  const [criteria, setCriteria] = useState([])
  const [options, setOptions] = useState([])

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {

    const criteriaRes = await axios.get(
      `http://localhost:5000/criteria/${decisionId}`
    )

    const optionRes = await axios.get(
      `http://localhost:5000/options/${decisionId}`
    )

    setCriteria(criteriaRes.data)
    setOptions(optionRes.data)

  }

  const saveRating = async (criteriaId, optionId, value) => {

    await axios.post("http://localhost:5000/ratings/create", {
      decisionId,
      criteriaId,
      optionId,
      value
    })

  }

  return (

    <div>

      <h2>Decision Matrix</h2>

      <table border="1" cellPadding="10">

        <thead>

          <tr>
            <th>Criteria</th>

            {options.map(option => (
              <th key={option._id}>{option.name}</th>
            ))}

          </tr>

        </thead>

        <tbody>

          {criteria.map(c => (

            <tr key={c._id}>

              <td>{c.name}</td>

              {options.map(o => (

                <td key={o._id}>

                  <input
                    type="number"
                    onBlur={(e) =>
                      saveRating(c._id, o._id, e.target.value)
                    }
                  />

                </td>

              ))}

            </tr>

          ))}

        </tbody>

      </table>

    </div>

  )

}

export default DecisionMatrix
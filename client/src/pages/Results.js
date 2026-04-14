import React, { useEffect, useState } from "react"
import axios from "axios"

function Results({ decisionId }) {

  const [criteria, setCriteria] = useState([])
  const [options, setOptions] = useState([])
  const [ratings, setRatings] = useState([])
  const [scores, setScores] = useState({})

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {

    const c = await axios.get(`http://localhost:5000/criteria/${decisionId}`)
    const o = await axios.get(`http://localhost:5000/options/${decisionId}`)
    const r = await axios.get(`http://localhost:5000/ratings/${decisionId}`)

    setCriteria(c.data)
    setOptions(o.data)
    setRatings(r.data)

    calculateScores(c.data, o.data, r.data)
  }

  const calculateScores = (criteria, options, ratings) => {

    let result = {}

    options.forEach(option => {

      let score = 0

      ratings.forEach(r => {

        if (r.optionId === option._id) {

          const c = criteria.find(cr => cr._id === r.criteriaId)

          if (c) {
            score += r.value * c.weight
          }

        }

      })

      result[option.name] = score

    })

    setScores(result)

  }

  const bestOption = Object.keys(scores).reduce((a,b) =>
    scores[a] > scores[b] ? a : b
  , "")

  return (

    <div>

      <h2>Results</h2>

      {Object.keys(scores).map(name => (

        <p key={name}>
          {name} : {scores[name]}
        </p>

      ))}

      <h3>Best Option: {bestOption}</h3>

    </div>

  )

}

export default Results
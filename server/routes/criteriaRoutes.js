const express = require("express")
const router = express.Router()

const Criteria = require("../models/Criteria")

// create criteria
router.post("/create", async (req, res) => {

  try {

    const criteria = new Criteria(req.body)

    await criteria.save()

    res.json(criteria)

  } catch (error) {

    res.status(500).json(error)

  }

})


// get criteria by decision
router.get("/:decisionId", async (req, res) => {

  const criteria = await Criteria.find({
    decisionId: req.params.decisionId
  })

  res.json(criteria)

})

module.exports = router
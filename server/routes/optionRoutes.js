const express = require("express")
const router = express.Router()

const Option = require("../models/Option")

// create option
router.post("/create", async (req, res) => {

  try {

    const option = new Option(req.body)

    await option.save()

    res.json(option)

  } catch (error) {

    res.status(500).json(error)

  }

})

// get options for decision
router.get("/:decisionId", async (req, res) => {

  const options = await Option.find({
    decisionId: req.params.decisionId
  })

  res.json(options)

})

module.exports = router
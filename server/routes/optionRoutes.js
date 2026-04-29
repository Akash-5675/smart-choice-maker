const express = require("express")
const router = express.Router()

const Option = require("../models/Option")
const Decision = require("../models/Decision")
const { requireAuth } = require("../middleware/auth")

router.use(requireAuth)

// create option
router.post("/create", async (req, res) => {

  try {
    const decisionId = req.body?.decisionId
    const name = req.body?.name?.trim()

    const decision = await Decision.findOne({
      _id: decisionId,
      userId: req.user._id
    })

    if (!decision) {
      return res.status(404).json({
        message: "Decision not found."
      })
    }

    if (!name) {
      return res.status(400).json({
        message: "Option name is required."
      })
    }

    const option = new Option({
      decisionId,
      name
    })

    await option.save()

    res.json(option)

  } catch (error) {

    res.status(500).json({
      message: "Unable to save the option."
    })

  }

})

// get options for decision
router.get("/:decisionId", async (req, res) => {
  const decision = await Decision.findOne({
    _id: req.params.decisionId,
    userId: req.user._id
  })

  if (!decision) {
    return res.status(404).json({
      message: "Decision not found."
    })
  }

  const options = await Option.find({
    decisionId: req.params.decisionId
  }).sort({ createdAt: 1, _id: 1 })

  res.json(options)

})

module.exports = router

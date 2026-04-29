const express = require("express")
const router = express.Router()

const Criteria = require("../models/Criteria")
const Decision = require("../models/Decision")
const { requireAuth } = require("../middleware/auth")

router.use(requireAuth)

// create criteria
router.post("/create", async (req, res) => {

  try {
    const decisionId = req.body?.decisionId
    const name = req.body?.name?.trim()
    const weight = Number(req.body?.weight)

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
        message: "Criteria name is required."
      })
    }

    if (Number.isNaN(weight) || weight < 1 || weight > 10) {
      return res.status(400).json({
        message: "Weight must be between 1 and 10."
      })
    }

    const criteria = new Criteria({
      decisionId,
      name,
      weight
    })

    await criteria.save()

    res.json(criteria)

  } catch (error) {

    res.status(500).json({
      message: "Unable to save the criteria."
    })

  }

})


// get criteria by decision
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

  const criteria = await Criteria.find({
    decisionId: req.params.decisionId
  }).sort({ createdAt: 1, _id: 1 })

  res.json(criteria)

})

module.exports = router

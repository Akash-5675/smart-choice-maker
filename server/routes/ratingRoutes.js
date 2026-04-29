const express = require("express")
const router = express.Router()

const Rating = require("../models/Rating")
const Criteria = require("../models/Criteria")
const Decision = require("../models/Decision")
const Option = require("../models/Option")
const { requireAuth } = require("../middleware/auth")

router.use(requireAuth)

// create rating
router.post("/create", async (req, res) => {

  try {

    const { decisionId, criteriaId, optionId } = req.body
    const value = Number(req.body?.value)

    const decision = await Decision.findOne({
      _id: decisionId,
      userId: req.user._id
    })

    if (!decision) {
      return res.status(404).json({
        message: "Decision not found."
      })
    }

    const [criteria, option] = await Promise.all([
      Criteria.findOne({ _id: criteriaId, decisionId }),
      Option.findOne({ _id: optionId, decisionId })
    ])

    if (!criteria || !option) {
      return res.status(400).json({
        message: "Criteria or option is invalid for this decision."
      })
    }

    if (Number.isNaN(value) || value < 1 || value > 10) {
      return res.status(400).json({
        message: "Rating must be between 1 and 10."
      })
    }

    const rating = await Rating.findOneAndUpdate(
      {
        decisionId,
        criteriaId,
        optionId
      },
      {
        decisionId,
        criteriaId,
        optionId,
        value
      },
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true
      }
    )

    res.json(rating)

  } catch (error) {

    res.status(500).json({
      message: "Unable to save the rating."
    })

  }

})

// get ratings for decision
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

  const ratings = await Rating.find({
    decisionId: req.params.decisionId
  })

  res.json(ratings)

})

module.exports = router

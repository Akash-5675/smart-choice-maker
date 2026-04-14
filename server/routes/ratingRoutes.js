const express = require("express")
const router = express.Router()

const Rating = require("../models/Rating")

// create rating
router.post("/create", async (req, res) => {

  try {

    const rating = new Rating(req.body)

    await rating.save()

    res.json(rating)

  } catch (error) {

    res.status(500).json(error)

  }

})

// get ratings for decision
router.get("/:decisionId", async (req, res) => {

  const ratings = await Rating.find({
    decisionId: req.params.decisionId
  })

  res.json(ratings)

})

module.exports = router
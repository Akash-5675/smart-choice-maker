const express = require("express")
const router = express.Router()
const Decision = require("../models/Decision")

router.post("/create", async (req, res) => {
  try {
    const decision = new Decision(req.body)
    await decision.save()
    res.json(decision)
  } catch (error) {
    res.status(500).json(error)
  }
})

router.get("/", async (req, res) => {
  const decisions = await Decision.find()
  res.json(decisions)
})

module.exports = router
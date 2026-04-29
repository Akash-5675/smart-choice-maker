const express = require("express")
const router = express.Router()
const Criteria = require("../models/Criteria")
const Decision = require("../models/Decision")
const Option = require("../models/Option")
const Rating = require("../models/Rating")
const { requireAuth } = require("../middleware/auth")
const { buildDecisionReport, buildPdfBuffer } = require("../utils/decisionReport")

router.use(requireAuth)

router.post("/create", async (req, res) => {
  try {
    const title = req.body?.title?.trim()
    const description = req.body?.description?.trim() || ""

    if (!title) {
      return res.status(400).json({
        message: "Decision title is required."
      })
    }

    const decision = new Decision({
      title,
      description,
      userId: req.user._id
    })

    await decision.save()
    res.json(decision)
  } catch (error) {
    res.status(500).json({
      message: "Unable to create the decision."
    })
  }
})

router.get("/", async (req, res) => {
  const decisions = await Decision.find({ userId: req.user._id }).sort({
    createdAt: -1
  })
  res.json(decisions)
})

router.get("/:id", async (req, res) => {
  const decision = await Decision.findOne({
    _id: req.params.id,
    userId: req.user._id
  })

  if (!decision) {
    return res.status(404).json({
      message: "Decision not found."
    })
  }

  res.json(decision)
})

router.get("/:id/report", async (req, res) => {
  const decision = await Decision.findOne({
    _id: req.params.id,
    userId: req.user._id
  })

  if (!decision) {
    return res.status(404).json({
      message: "Decision not found."
    })
  }

  const [criteria, options, ratings] = await Promise.all([
    Criteria.find({ decisionId: decision._id }),
    Option.find({ decisionId: decision._id }),
    Rating.find({ decisionId: decision._id })
  ])

  const report = buildDecisionReport({
    decision,
    criteria,
    options,
    ratings,
    user: req.user
  })

  res.json(report)
})

router.get("/:id/report/download", async (req, res) => {
  const decision = await Decision.findOne({
    _id: req.params.id,
    userId: req.user._id
  })

  if (!decision) {
    return res.status(404).json({
      message: "Decision not found."
    })
  }

  const [criteria, options, ratings] = await Promise.all([
    Criteria.find({ decisionId: decision._id }),
    Option.find({ decisionId: decision._id }),
    Rating.find({ decisionId: decision._id })
  ])

  const report = buildDecisionReport({
    decision,
    criteria,
    options,
    ratings,
    user: req.user
  })
  const pdfBuffer = buildPdfBuffer(report)
  const safeTitle = decision.title.replace(/[^a-z0-9]+/gi, "-").toLowerCase()

  res.setHeader("Content-Type", "application/pdf")
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="${safeTitle || "decision-report"}-report.pdf"`
  )
  res.send(pdfBuffer)
})

module.exports = router

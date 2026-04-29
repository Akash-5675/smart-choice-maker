const express = require("express")
const axios = require("axios")

const router = express.Router()

const ML_SERVICE_URL = "http://localhost:8000/predict"

router.post("/recommend-criteria", async (req, res) => {
  const decision = req.body?.decision?.trim()

  if (!decision) {
    return res.status(400).json({
      message: "Decision title is required for ML suggestions."
    })
  }

  try {
    const response = await axios.post(ML_SERVICE_URL, { decision })

    res.json({
      criteria: response.data?.criteria || []
    })
  } catch (error) {
    res.status(503).json({
      message:
        "ML service is not reachable. Start the Python service to enable criteria suggestions."
    })
  }
})

module.exports = router

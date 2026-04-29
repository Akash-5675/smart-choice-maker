const express = require("express")

const User = require("../models/User")
const { requireAuth } = require("../middleware/auth")

const router = express.Router()

function normalizeEmail(email = "") {
  return email.trim().toLowerCase()
}

function buildUserResponse(user, token) {
  return {
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email
    }
  }
}

router.post("/lookup", async (req, res) => {
  const email = normalizeEmail(req.body?.email)

  if (!email) {
    return res.status(400).json({
      message: "Email is required."
    })
  }

  const existingUser = await User.findOne({ email })

  res.json({
    exists: Boolean(existingUser)
  })
})

router.post("/register", async (req, res) => {
  const name = req.body?.name?.trim()
  const email = normalizeEmail(req.body?.email)
  const password = req.body?.password || ""

  if (!name || name.length < 2) {
    return res.status(400).json({
      message: "Name must be at least 2 characters long."
    })
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({
      message: "Enter a valid email address."
    })
  }

  if (password.length < 8) {
    return res.status(400).json({
      message: "Password must be at least 8 characters long."
    })
  }

  const existingUser = await User.findOne({ email })

  if (existingUser) {
    return res.status(409).json({
      message: "An account with this email already exists. Please log in instead."
    })
  }

  const passwordRecord = User.createPasswordRecord(password)
  const user = new User({
    name,
    email,
    ...passwordRecord,
    sessions: []
  })
  const token = user.createSessionToken()

  await user.save()

  res.status(201).json(buildUserResponse(user, token))
})

router.post("/login", async (req, res) => {
  const email = normalizeEmail(req.body?.email)
  const password = req.body?.password || ""

  if (!email || !password) {
    return res.status(400).json({
      message: "Email and password are required."
    })
  }

  const user = await User.findOne({ email })

  if (!user || !user.verifyPassword(password)) {
    return res.status(401).json({
      message: "Incorrect email or password."
    })
  }

  const token = user.createSessionToken()
  await user.save()

  res.json(buildUserResponse(user, token))
})

router.get("/me", requireAuth, async (req, res) => {
  res.json({
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email
    }
  })
})

router.post("/logout", requireAuth, async (req, res) => {
  req.user.sessions = req.user.sessions.filter(
    (session) => session.token !== req.authToken
  )
  await req.user.save()

  res.json({
    success: true
  })
})

module.exports = router

const crypto = require("crypto")
const express = require("express")
const nodemailer = require("nodemailer")

const mailer = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS
  }
})

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
  try {
    const email = normalizeEmail(req.body?.email)

    if (!email) {
      return res.status(400).json({ message: "Email is required." })
    }

    const existingUser = await User.findOne({ email })
    res.json({ exists: Boolean(existingUser) })
  } catch (err) {
    res.status(500).json({ message: "Server error." })
  }
})

router.post("/register", async (req, res) => {
  try {
    const name = req.body?.name?.trim()
    const email = normalizeEmail(req.body?.email)
    const password = req.body?.password || ""

    if (!name || name.length < 2) {
      return res.status(400).json({ message: "Name must be at least 2 characters long." })
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ message: "Enter a valid email address." })
    }

    if (password.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters long." })
    }

    const existingUser = await User.findOne({ email })

    if (existingUser) {
      return res.status(409).json({
        message: "An account with this email already exists. Please log in instead."
      })
    }

    const passwordRecord = User.createPasswordRecord(password)
    const user = new User({ name, email, ...passwordRecord, sessions: [] })
    const token = user.createSessionToken()

    await user.save()
    res.status(201).json(buildUserResponse(user, token))
  } catch (err) {
    res.status(500).json({ message: "Server error." })
  }
})

router.post("/login", async (req, res) => {
  try {
    const email = normalizeEmail(req.body?.email)
    const password = req.body?.password || ""

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." })
    }

    const user = await User.findOne({ email })

    if (!user || !user.verifyPassword(password)) {
      return res.status(401).json({ message: "Incorrect email or password." })
    }

    const token = user.createSessionToken()
    await user.save()
    res.json(buildUserResponse(user, token))
  } catch (err) {
    res.status(500).json({ message: "Server error." })
  }
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
  try {
    req.user.sessions = req.user.sessions.filter(
      (session) => session.token !== req.authToken
    )
    await req.user.save()
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ message: "Server error." })
  }
})

router.post("/forgot-password", async (req, res) => {
  try {
    const email = normalizeEmail(req.body?.email)

    if (!email) {
      return res.status(400).json({ message: "Email is required." })
    }

    const user = await User.findOne({ email })

    // Always return success to avoid leaking which emails exist
    if (!user) {
      return res.json({ message: "If that email exists, a reset link has been sent." })
    }

    const resetToken = crypto.randomBytes(32).toString("hex")
    user.resetToken = resetToken
    user.resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000) // 1 hour
    await user.save()

    const resetLink = `${process.env.CLIENT_URL || "http://localhost:3000"}/forgot-password?token=${resetToken}`

    await mailer.sendMail({
      from: '"Smart Choice Maker" <akashramesh445@gmail.com>',
      to: user.email,
      subject: "Reset your password",
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto">
          <h2 style="color:#b45309">Smart Choice Maker</h2>
          <p>Hi ${user.name},</p>
          <p>Click the button below to reset your password. This link expires in <strong>1 hour</strong>.</p>
          <a href="${resetLink}" style="display:inline-block;margin:1rem 0;padding:0.75rem 1.5rem;background:#b45309;color:white;border-radius:999px;text-decoration:none;font-weight:600">
            Reset Password
          </a>
          <p style="color:#888;font-size:0.85rem">If you didn't request this, ignore this email — your password won't change.</p>
        </div>
      `
    })

    res.json({ message: "If that email exists, a reset link has been sent." })
  } catch (err) {
    res.status(500).json({ message: "Server error." })
  }
})

router.post("/reset-password", async (req, res) => {
  try {
    const { token, password } = req.body || {}

    if (!token) {
      return res.status(400).json({ message: "Reset token is required." })
    }

    if (!password || password.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters long." })
    }

    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: new Date() }
    })

    if (!user) {
      return res.status(400).json({ message: "Reset link is invalid or has expired." })
    }

    const passwordRecord = User.createPasswordRecord(password)
    user.passwordHash = passwordRecord.passwordHash
    user.passwordSalt = passwordRecord.passwordSalt
    user.resetToken = null
    user.resetTokenExpiry = null
    user.sessions = [] // invalidate all existing sessions

    const newToken = user.createSessionToken()
    await user.save()

    res.json({ message: "Password updated successfully.", ...buildUserResponse(user, newToken) })
  } catch (err) {
    res.status(500).json({ message: "Server error." })
  }
})

module.exports = router

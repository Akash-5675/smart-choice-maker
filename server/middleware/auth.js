const User = require("../models/User")

async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization || ""
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.slice("Bearer ".length).trim()
    : ""

  if (!token) {
    return res.status(401).json({
      message: "Authentication required."
    })
  }

  const user = await User.findOne({ "sessions.token": token })

  if (!user) {
    return res.status(401).json({
      message: "Session is invalid or has expired."
    })
  }

  const session = user.sessions.find((entry) => entry.token === token)

  if (session) {
    session.lastUsedAt = new Date()
    await user.save()
  }

  req.user = user
  req.authToken = token

  next()
}

module.exports = {
  requireAuth
}

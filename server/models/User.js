const crypto = require("crypto")
const mongoose = require("mongoose")

const SessionSchema = new mongoose.Schema(
  {
    token: {
      type: String,
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    lastUsedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    _id: false
  }
)

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  passwordHash: {
    type: String,
    required: true
  },
  passwordSalt: {
    type: String,
    required: true
  },
  sessions: [SessionSchema]
})

UserSchema.statics.hashPassword = function hashPassword(password, salt) {
  return crypto.scryptSync(password, salt, 64).toString("hex")
}

UserSchema.statics.createPasswordRecord = function createPasswordRecord(password) {
  const salt = crypto.randomBytes(16).toString("hex")

  return {
    passwordSalt: salt,
    passwordHash: this.hashPassword(password, salt)
  }
}

UserSchema.methods.verifyPassword = function verifyPassword(password) {
  const attemptedHash = this.constructor.hashPassword(password, this.passwordSalt)

  return crypto.timingSafeEqual(
    Buffer.from(attemptedHash, "hex"),
    Buffer.from(this.passwordHash, "hex")
  )
}

UserSchema.methods.createSessionToken = function createSessionToken() {
  const token = crypto.randomBytes(32).toString("hex")

  this.sessions.push({
    token,
    createdAt: new Date(),
    lastUsedAt: new Date()
  })

  return token
}

module.exports = mongoose.model("User", UserSchema)

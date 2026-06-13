require("dotenv").config()
const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
const authRoutes = require("./routes/authRoutes")
const criteriaRoutes = require("./routes/criteriaRoutes")
const decisionRoutes = require("./routes/decisionRoutes")
const mlRoutes = require("./routes/mlRoutes")
const optionRoutes = require("./routes/optionRoutes")
const ratingRoutes = require("./routes/ratingRoutes")

const app = express()

app.use(cors())
app.use(express.json())

mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/smartchoice")

mongoose.connection.once("open", () => {
  console.log("MongoDB connected")
})

app.use("/auth", authRoutes)
app.use("/decisions", decisionRoutes)
app.use("/criteria", criteriaRoutes)
app.use("/ml", mlRoutes)
app.use("/options", optionRoutes)
app.use("/ratings", ratingRoutes)
app.use((err, req, res, next) => {
  console.error(err)
  res.status(500).json({ message: "Unexpected server error." })
})

app.listen(5000, () => {
  console.log("Server running on port 5000")
})

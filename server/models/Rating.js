const mongoose = require("mongoose")

const RatingSchema = new mongoose.Schema({

  decisionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Decision"
  },

  criteriaId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Criteria"
  },

  optionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Option"
  },

  value: Number

})

module.exports = mongoose.model("Rating", RatingSchema)
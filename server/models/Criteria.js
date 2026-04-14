const mongoose = require("mongoose")

const CriteriaSchema = new mongoose.Schema({

  decisionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Decision"
  },

  name: String,

  weight: Number

})

module.exports = mongoose.model("Criteria", CriteriaSchema)
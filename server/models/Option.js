const mongoose = require("mongoose")

const OptionSchema = new mongoose.Schema({

  decisionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Decision"
  },

  name: String

})

module.exports = mongoose.model("Option", OptionSchema)
const mongoose = require("mongoose");

const entrySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: false,
  },

  date: {
    type: Date,
    default: Date.now,
  },

  stress: {
    type: Number, 
    required: true,
  },

  workload: {
    type: Number, 
    required: true,
  },

  sleepHours: {
    type: Number,
    required: true,
  },

  energy: {
    type: Number, 
    required: true,
  },

  burnoutScore: {
    type: Number,
    default: 0,
  },

  burnoutLevel: {
    type: String,
    enum: ["Low", "Medium", "High"],
    default: "Low",
  },
});

module.exports = mongoose.model("Entry", entrySchema);
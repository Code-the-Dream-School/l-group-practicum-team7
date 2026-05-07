const mongoose = require("mongoose");

const EntrySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    date: {
      type: Date,
      required: [true, "Please provide a date"],
    },
    stress: {
      type: Number,
      required: [true, "Please provide stress level"],
      min: 1,
      max: 5,
    },
    workload: {
      type: Number,
      required: [true, "Please provide workload level"],
      min: 1,
      max: 5,
    },
    sleepHours: {
      type: Number,
      required: [true, "Please provide sleep hours"],
      min: 0,
      max: 24,
    },
    sleepScore: {
      type: Number,
      min: 1,
      max: 5,
    },
    energy: {
      type: Number,
      required: [true, "Please provide energy level"],
      min: 1,
      max: 5,
    },
    burnoutScore: {
      type: Number,
    },
    burnoutLevel: {
      type: String,
      enum: ["Low", "Medium", "High"],
    },
  },
  {
    timestamps: true,
  }
);

EntrySchema.statics.getAverageBurnout = async function (userId) {
  const stats = await this.aggregate([
    { $match: { userId } },
    {
      $group: {
        _id: "$userId",
        averageScore: { $avg: "$burnoutScore" },
      },
    },
  ]);

  if (stats.length > 0) {
    return parseFloat(stats[0].averageScore.toFixed(2));
  }

  //removed to services/burnoutService.js
  return 0;
};

module.exports = mongoose.model("Entry", EntrySchema);
const mongoose = require("mongoose");

const userToolSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    key: {
      type: String,
      required: true,
    },

    title: {
      type: String,
      required: true,
    },

    sourceDialogue: {
      type: String,
      default: null,
    },

    unlockedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

userToolSchema.index({ userId: 1, key: 1 }, { unique: true });

module.exports = mongoose.model("UserTool", userToolSchema);
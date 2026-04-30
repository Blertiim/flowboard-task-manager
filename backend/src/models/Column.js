const mongoose = require("mongoose");

const columnSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Column title is required."],
      trim: true,
      maxlength: [50, "Column title must be 50 characters or fewer."]
    },
    description: {
      type: String,
      trim: true,
      maxlength: [160, "Column description must be 160 characters or fewer."],
      default: ""
    },
    accent: {
      type: String,
      enum: ["coral", "ocean", "mint", "amber", "rose", "violet", "slate"],
      default: "slate"
    },
    isDefault: {
      type: Boolean,
      default: false
    },
    systemKey: {
      type: String,
      enum: ["todo", "in-progress", "done"],
      default: undefined
    },
    position: {
      type: Number,
      required: true,
      default: 1024
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Column", columnSchema);

const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Task title is required."],
      trim: true,
      maxlength: [120, "Task title must be 120 characters or fewer."]
    },
    description: {
      type: String,
      trim: true,
      maxlength: [2000, "Description must be 2000 characters or fewer."]
    },
    link: {
      type: String,
      trim: true,
      maxlength: [500, "Link must be 500 characters or fewer."]
    },
    dueDate: {
      type: Date,
      default: null
    },
    priority: {
      type: String,
      enum: ["critical", "important", "not-important"],
      default: "important"
    },
    columnId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Column",
      default: null
    },
    status: {
      type: String,
      trim: true,
      default: ""
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

module.exports = mongoose.model("Task", taskSchema);

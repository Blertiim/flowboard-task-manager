const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
  {
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    authorName: {
      type: String,
      required: true,
      trim: true,
      maxlength: [80, "Author name must be 80 characters or fewer."]
    },
    body: {
      type: String,
      required: [true, "Comment body is required."],
      trim: true,
      maxlength: [1200, "Comment must be 1200 characters or fewer."]
    }
  },
  {
    timestamps: true
  }
);

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
    type: {
      type: String,
      enum: ["task", "bug", "feature"],
      default: "task"
    },
    columnId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Column",
      default: null
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
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
    },
    comments: {
      type: [commentSchema],
      default: []
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Task", taskSchema);

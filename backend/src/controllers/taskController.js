const mongoose = require("mongoose");
const Column = require("../models/Column");
const Task = require("../models/Task");
const { ensurePositionGap, getTopPosition } = require("../utils/taskOrdering");

function normalizeTaskInput(payload = {}) {
  return {
    title: typeof payload.title === "string" ? payload.title.trim() : "",
    description: typeof payload.description === "string" ? payload.description.trim() : "",
    link: typeof payload.link === "string" ? payload.link.trim() : "",
    dueDate: payload.dueDate ? new Date(payload.dueDate) : null,
    priority: typeof payload.priority === "string" ? payload.priority.trim() : "",
    type: typeof payload.type === "string" ? payload.type.trim() : "",
    columnId: typeof payload.columnId === "string" ? payload.columnId.trim() : ""
  };
}

function validateUrl(link) {
  if (!link) {
    return true;
  }

  try {
    const url = new URL(link);
    return ["http:", "https:"].includes(url.protocol);
  } catch (error) {
    return false;
  }
}

function validateDueDate(dueDate) {
  if (!dueDate) {
    return true;
  }

  return !Number.isNaN(dueDate.getTime());
}

function validateColumnId(columnId) {
  return mongoose.Types.ObjectId.isValid(columnId);
}

function validatePriority(priority) {
  return ["critical", "important", "not-important"].includes(priority);
}

function validateTaskType(type) {
  return ["task", "bug", "feature"].includes(type);
}

async function getColumnOrNull(columnId) {
  if (!validateColumnId(columnId)) {
    return null;
  }

  return Column.findById(columnId);
}

async function listTasks(_request, response, next) {
  try {
    const tasks = await Task.find({}).sort({ position: 1, createdAt: 1 });
    response.json(tasks);
  } catch (error) {
    next(error);
  }
}

async function createTask(request, response, next) {
  try {
    const taskData = normalizeTaskInput(request.body);

    if (!taskData.title) {
      return response.status(400).json({ message: "Task title is required." });
    }

    if (!validateColumnId(taskData.columnId)) {
      return response.status(400).json({ message: "Task column is invalid." });
    }

    if (!validatePriority(taskData.priority)) {
      return response.status(400).json({ message: "Task priority is invalid." });
    }

    if (!validateTaskType(taskData.type)) {
      return response.status(400).json({ message: "Task type is invalid." });
    }

    if (!validateUrl(taskData.link)) {
      return response.status(400).json({ message: "Link must be a valid http or https URL." });
    }

    if (!validateDueDate(taskData.dueDate)) {
      return response.status(400).json({ message: "Due date must be a valid date/time." });
    }

    const column = await getColumnOrNull(taskData.columnId);

    if (!column) {
      return response.status(400).json({ message: "Task column was not found." });
    }

    const task = await Task.create({
      ...taskData,
      link: taskData.link || "",
      description: taskData.description || "",
      status: "",
      position: await getTopPosition(taskData.columnId)
    });

    response.status(201).json(task);
  } catch (error) {
    next(error);
  }
}

async function updateTask(request, response, next) {
  try {
    const { id } = request.params;
    const existingTask = await Task.findById(id);

    if (!existingTask) {
      return response.status(404).json({ message: "Task not found." });
    }

    const updates = normalizeTaskInput(request.body);

    if (!updates.title) {
      return response.status(400).json({ message: "Task title is required." });
    }

    if (!validateColumnId(updates.columnId)) {
      return response.status(400).json({ message: "Task column is invalid." });
    }

    if (!validatePriority(updates.priority)) {
      return response.status(400).json({ message: "Task priority is invalid." });
    }

    if (!validateTaskType(updates.type)) {
      return response.status(400).json({ message: "Task type is invalid." });
    }

    if (!validateUrl(updates.link)) {
      return response.status(400).json({ message: "Link must be a valid http or https URL." });
    }

    if (!validateDueDate(updates.dueDate)) {
      return response.status(400).json({ message: "Due date must be a valid date/time." });
    }

    const column = await getColumnOrNull(updates.columnId);

    if (!column) {
      return response.status(400).json({ message: "Task column was not found." });
    }

    const nextColumnId = updates.columnId;
    const columnChanged = String(nextColumnId) !== String(existingTask.columnId);

    existingTask.title = updates.title;
    existingTask.description = updates.description || "";
    existingTask.link = updates.link || "";
    existingTask.dueDate = updates.dueDate;
    existingTask.priority = updates.priority;
    existingTask.type = updates.type;
    existingTask.columnId = nextColumnId;
    existingTask.status = "";

    if (columnChanged) {
      existingTask.position = await getTopPosition(nextColumnId);
    }

    await existingTask.save();
    response.json(existingTask);
  } catch (error) {
    next(error);
  }
}

async function moveTask(request, response, next) {
  try {
    const { id } = request.params;
    const { destinationColumnId, destinationIndex } = request.body;

    const task = await Task.findById(id);

    if (!task) {
      return response.status(404).json({ message: "Task not found." });
    }

    if (!validateColumnId(destinationColumnId)) {
      return response.status(400).json({ message: "Destination column is invalid." });
    }

    const column = await getColumnOrNull(destinationColumnId);

    if (!column) {
      return response.status(400).json({ message: "Destination column was not found." });
    }

    const targetTasks = await Task.find({ columnId: destinationColumnId }).sort({ position: 1, createdAt: 1 });
    const tasksWithoutCurrent = targetTasks.filter((columnTask) => String(columnTask._id) !== id);
    const targetIndex = Number.isInteger(destinationIndex)
      ? destinationIndex
      : tasksWithoutCurrent.length;
    const nextPosition = await ensurePositionGap(
      destinationColumnId,
      Math.max(0, Math.min(targetIndex, tasksWithoutCurrent.length)),
      id
    );

    task.columnId = destinationColumnId;
    task.status = "";
    task.position = nextPosition;
    await task.save();

    response.json(task);
  } catch (error) {
    next(error);
  }
}

async function deleteTask(request, response, next) {
  try {
    const { id } = request.params;
    const deletedTask = await Task.findByIdAndDelete(id);

    if (!deletedTask) {
      return response.status(404).json({ message: "Task not found." });
    }

    response.status(204).send();
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createTask,
  deleteTask,
  listTasks,
  moveTask,
  updateTask
};

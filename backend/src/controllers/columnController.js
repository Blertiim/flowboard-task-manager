const Column = require("../models/Column");
const Task = require("../models/Task");
const { POSITION_GAP } = require("../utils/taskOrdering");

const VALID_ACCENTS = ["coral", "ocean", "mint", "amber", "rose", "violet", "slate"];

function normalizeColumnInput(payload = {}) {
  return {
    title: typeof payload.title === "string" ? payload.title.trim() : "",
    description: typeof payload.description === "string" ? payload.description.trim() : "",
    accent: typeof payload.accent === "string" ? payload.accent.trim() : "slate"
  };
}

function validateAccent(accent) {
  return VALID_ACCENTS.includes(accent);
}

async function listColumns(_request, response, next) {
  try {
    const columns = await Column.find({ ownerId: _request.user._id }).sort({ position: 1, createdAt: 1 });
    response.json(columns);
  } catch (error) {
    next(error);
  }
}

async function createColumn(request, response, next) {
  try {
    const columnData = normalizeColumnInput(request.body);

    if (!columnData.title) {
      return response.status(400).json({ message: "Column title is required." });
    }

    if (!validateAccent(columnData.accent)) {
      return response.status(400).json({ message: "Column accent is invalid." });
    }

    const lastColumn = await Column.findOne({ ownerId: request.user._id }).sort({ position: -1, createdAt: -1 });
    const column = await Column.create({
      ...columnData,
      isDefault: false,
      position: lastColumn ? lastColumn.position + POSITION_GAP : POSITION_GAP,
      ownerId: request.user._id
    });

    response.status(201).json(column);
  } catch (error) {
    next(error);
  }
}

async function updateColumn(request, response, next) {
  try {
    const { id } = request.params;
    const column = await Column.findOne({ _id: id, ownerId: request.user._id });

    if (!column) {
      return response.status(404).json({ message: "Column not found." });
    }

    const updates = normalizeColumnInput(request.body);

    if (!updates.title) {
      return response.status(400).json({ message: "Column title is required." });
    }

    if (!validateAccent(updates.accent)) {
      return response.status(400).json({ message: "Column accent is invalid." });
    }

    column.title = updates.title;
    column.description = updates.description;
    column.accent = updates.accent;
    await column.save();

    response.json(column);
  } catch (error) {
    next(error);
  }
}

async function deleteColumn(request, response, next) {
  try {
    const { id } = request.params;
    const column = await Column.findOne({ _id: id, ownerId: request.user._id });

    if (!column) {
      return response.status(404).json({ message: "Column not found." });
    }

    if (column.isDefault) {
      return response.status(400).json({ message: "Default columns cannot be deleted." });
    }

    const totalColumns = await Column.countDocuments({ ownerId: request.user._id });

    if (totalColumns <= 1) {
      return response.status(400).json({ message: "Keep at least one column on the board." });
    }

    const taskCount = await Task.countDocuments({ columnId: id, ownerId: request.user._id });

    if (taskCount > 0) {
      return response.status(400).json({ message: "Move or delete the tasks in this column first." });
    }

    await Column.findOneAndDelete({ _id: id, ownerId: request.user._id });

    response.status(204).send();
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createColumn,
  deleteColumn,
  listColumns,
  updateColumn,
  VALID_ACCENTS
};

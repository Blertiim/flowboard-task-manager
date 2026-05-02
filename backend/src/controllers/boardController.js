const Column = require("../models/Column");
const Task = require("../models/Task");

function serializeTask(task) {
  const taskId = String(task._id);

  return {
    id: taskId,
    _id: taskId,
    title: task.title,
    description: task.description || "",
    type: task.type || "task",
    priority: task.priority || "important",
    link: task.link || "",
    dueDate: task.dueDate,
    columnId: String(task.columnId),
    position: task.position,
    createdAt: task.createdAt,
    updatedAt: task.updatedAt
  };
}

function serializeColumn(column, tasks) {
  const columnId = String(column._id);
  const cards = tasks;

  return {
    id: columnId,
    _id: columnId,
    name: column.title,
    title: column.title,
    description: column.description || "",
    accent: column.accent,
    isDefault: Boolean(column.isDefault),
    systemKey: column.systemKey || null,
    cards,
    tasks: cards
  };
}

async function buildBoardPayload(ownerId) {
  const [columns, tasks] = await Promise.all([
    Column.find({ ownerId }).sort({ position: 1, createdAt: 1 }),
    Task.find({ ownerId }).sort({ position: 1, createdAt: 1 })
  ]);

  const groupedTasks = tasks.reduce((accumulator, task) => {
    const key = String(task.columnId);

    if (!accumulator[key]) {
      accumulator[key] = [];
    }

    accumulator[key].push(serializeTask(task));
    return accumulator;
  }, {});

  return {
    columns: columns.map((column) =>
      serializeColumn(column, groupedTasks[String(column._id)] || [])
    )
  };
}

async function getBoard(request, response, next) {
  try {
    response.json(await buildBoardPayload(request.user._id));
  } catch (error) {
    next(error);
  }
}

module.exports = {
  buildBoardPayload,
  getBoard
};

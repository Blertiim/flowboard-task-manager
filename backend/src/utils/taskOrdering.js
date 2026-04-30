const Task = require("../models/Task");

const POSITION_GAP = 1024;
const MIN_GAP = 0.0001;

async function getColumnTasks(columnId) {
  return Task.find({ columnId }).sort({ position: 1, createdAt: 1 });
}

async function getColumnTasksExcluding(columnId, excludedTaskId) {
  const tasks = await getColumnTasks(columnId);
  return tasks.filter((task) => String(task._id) !== String(excludedTaskId));
}

async function getTopPosition(columnId) {
  const firstTask = await Task.findOne({ columnId }).sort({ position: 1, createdAt: 1 });

  if (!firstTask) {
    return POSITION_GAP;
  }

  return firstTask.position - POSITION_GAP;
}

function getPositionForIndex(tasks, index) {
  if (tasks.length === 0) {
    return POSITION_GAP;
  }

  if (index <= 0) {
    return tasks[0].position - POSITION_GAP;
  }

  if (index >= tasks.length) {
    return tasks[tasks.length - 1].position + POSITION_GAP;
  }

  return (tasks[index - 1].position + tasks[index].position) / 2;
}

async function normalizeColumn(columnId) {
  const tasks = await getColumnTasks(columnId);

  if (tasks.length === 0) {
    return;
  }

  const operations = tasks.map((task, index) => ({
    updateOne: {
      filter: { _id: task._id },
      update: { position: (index + 1) * POSITION_GAP }
    }
  }));

  await Task.bulkWrite(operations);
}

async function ensurePositionGap(columnId, index, excludedTaskId) {
  const tasks = excludedTaskId
    ? await getColumnTasksExcluding(columnId, excludedTaskId)
    : await getColumnTasks(columnId);
  let nextPosition = getPositionForIndex(tasks, index);

  if (index > 0 && index < tasks.length) {
    const gap = Math.abs(tasks[index].position - tasks[index - 1].position);

    if (gap < MIN_GAP) {
      await normalizeColumn(columnId);
      const normalizedTasks = excludedTaskId
        ? await getColumnTasksExcluding(columnId, excludedTaskId)
        : await getColumnTasks(columnId);
      nextPosition = getPositionForIndex(normalizedTasks, index);
    }
  }

  return nextPosition;
}

module.exports = {
  POSITION_GAP,
  ensurePositionGap,
  getColumnTasks,
  getColumnTasksExcluding,
  getTopPosition,
  normalizeColumn
};

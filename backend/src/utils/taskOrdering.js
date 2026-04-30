const Task = require("../models/Task");

const POSITION_GAP = 1024;
const MIN_GAP = 0.0001;

async function getColumnTasks(columnId, ownerId) {
  return Task.find({ columnId, ownerId }).sort({ position: 1, createdAt: 1 });
}

async function getColumnTasksExcluding(columnId, excludedTaskId, ownerId) {
  const tasks = await getColumnTasks(columnId, ownerId);
  return tasks.filter((task) => String(task._id) !== String(excludedTaskId));
}

async function getTopPosition(columnId, ownerId) {
  const firstTask = await Task.findOne({ columnId, ownerId }).sort({ position: 1, createdAt: 1 });

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

async function normalizeColumn(columnId, ownerId) {
  const tasks = await getColumnTasks(columnId, ownerId);

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

async function ensurePositionGap(columnId, index, excludedTaskId, ownerId) {
  const tasks = excludedTaskId
    ? await getColumnTasksExcluding(columnId, excludedTaskId, ownerId)
    : await getColumnTasks(columnId, ownerId);
  let nextPosition = getPositionForIndex(tasks, index);

  if (index > 0 && index < tasks.length) {
    const gap = Math.abs(tasks[index].position - tasks[index - 1].position);

    if (gap < MIN_GAP) {
      await normalizeColumn(columnId, ownerId);
      const normalizedTasks = excludedTaskId
        ? await getColumnTasksExcluding(columnId, excludedTaskId, ownerId)
        : await getColumnTasks(columnId, ownerId);
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

const Column = require("../models/Column");
const Task = require("../models/Task");
const { POSITION_GAP } = require("./taskOrdering");

const DEFAULT_COLUMNS = [
  {
    systemKey: "todo",
    title: "Todo",
    description: "Ideas and next actions waiting for focus.",
    accent: "coral",
    isDefault: true
  },
  {
    systemKey: "in-progress",
    title: "In Progress",
    description: "The work currently getting your attention.",
    accent: "ocean",
    isDefault: true
  },
  {
    systemKey: "done",
    title: "Done",
    description: "Finished tasks and small wins worth keeping.",
    accent: "mint",
    isDefault: true
  }
];

async function ensureUserDefaultColumns(ownerId) {
  const ownerKey = String(ownerId);
  const existingColumns = await Column.find({ ownerId: ownerKey }).sort({ position: 1, createdAt: 1 });
  const existingSystemKeys = new Set(existingColumns.map((column) => column.systemKey).filter(Boolean));
  const missingDefaults = DEFAULT_COLUMNS.filter((column) => !existingSystemKeys.has(column.systemKey));

  if (missingDefaults.length === 0) {
    return existingColumns;
  }

  const lastPosition = existingColumns[existingColumns.length - 1]?.position || 0;

  await Column.insertMany(
    missingDefaults.map((column, index) => ({
      ...column,
      ownerId: ownerKey,
      position: lastPosition + POSITION_GAP * (index + 1)
    }))
  );

  return Column.find({ ownerId: ownerKey }).sort({ position: 1, createdAt: 1 });
}

async function migrateTaskPriority() {
  await Task.updateMany(
    {
      $or: [{ priority: { $exists: false } }, { priority: null }, { priority: "" }]
    },
    {
      $set: { priority: "important" }
    }
  );
}

async function migrateTaskType() {
  await Task.updateMany(
    {
      $or: [{ type: { $exists: false } }, { type: null }, { type: "" }]
    },
    {
      $set: { type: "task" }
    }
  );
}

async function ensureBoardSetup() {
  await migrateTaskPriority();
  await migrateTaskType();
}

async function ensureUserBoardSetup(ownerId) {
  await ensureBoardSetup();
  return ensureUserDefaultColumns(ownerId);
}

module.exports = {
  DEFAULT_COLUMNS,
  ensureBoardSetup,
  ensureUserBoardSetup
};

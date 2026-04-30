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

async function migrateDefaultColumnMetadata(columns) {
  const defaultBySystemKey = Object.fromEntries(
    DEFAULT_COLUMNS.map((column) => [column.systemKey, column])
  );
  const unmatchedDefaults = new Map(DEFAULT_COLUMNS.map((column) => [column.title, column]));
  const operations = [];

  columns.forEach((column) => {
    if (column.systemKey && defaultBySystemKey[column.systemKey]) {
      unmatchedDefaults.delete(defaultBySystemKey[column.systemKey].title);

      if (!column.isDefault) {
        operations.push({
          updateOne: {
            filter: { _id: column._id },
            update: { isDefault: true }
          }
        });
      }

      return;
    }

    const matchedDefault = unmatchedDefaults.get(column.title);

    if (matchedDefault) {
      operations.push({
        updateOne: {
          filter: { _id: column._id },
          update: {
            isDefault: true,
            systemKey: matchedDefault.systemKey
          }
        }
      });
      unmatchedDefaults.delete(column.title);
    }
  });

  if (operations.length > 0) {
    await Column.bulkWrite(operations);
  }
}

async function ensureDefaultColumns() {
  const existingColumns = await Column.find({}).sort({ position: 1, createdAt: 1 });

  if (existingColumns.length > 0) {
    await migrateDefaultColumnMetadata(existingColumns);

    const refreshedColumns = await Column.find({}).sort({ position: 1, createdAt: 1 });
    const existingSystemKeys = new Set(
      refreshedColumns.map((column) => column.systemKey).filter(Boolean)
    );
    const missingDefaults = DEFAULT_COLUMNS.filter(
      (column) => !existingSystemKeys.has(column.systemKey)
    );

    if (missingDefaults.length === 0) {
      return refreshedColumns;
    }

    const lastPosition = refreshedColumns[refreshedColumns.length - 1]?.position || 0;

    await Column.insertMany(
      missingDefaults.map((column, index) => ({
        ...column,
        position: lastPosition + POSITION_GAP * (index + 1)
      }))
    );

    return Column.find({}).sort({ position: 1, createdAt: 1 });
  }

  const columns = await Column.insertMany(
    DEFAULT_COLUMNS.map((column, index) => ({
      ...column,
      position: (index + 1) * POSITION_GAP
    }))
  );

  return columns;
}

async function migrateLegacyTasks(columns) {
  const legacyTasks = await Task.find({
    $or: [{ columnId: { $exists: false } }, { columnId: null }]
  });

  if (legacyTasks.length === 0) {
    return;
  }

  const defaultColumnMap = {
    todo: columns.find((column) => column.title === "Todo"),
    "in-progress": columns.find((column) => column.title === "In Progress"),
    done: columns.find((column) => column.title === "Done")
  };
  const fallbackColumn = columns[0];

  if (!fallbackColumn) {
    return;
  }

  await Task.bulkWrite(
    legacyTasks.map((task) => ({
      updateOne: {
        filter: { _id: task._id },
        update: {
          columnId: defaultColumnMap[task.status]?._id || fallbackColumn._id,
          priority: task.priority || "important"
        }
      }
    }))
  );
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

async function ensureBoardSetup() {
  const columns = await ensureDefaultColumns();
  await migrateLegacyTasks(columns);
  await migrateTaskPriority();
}

module.exports = {
  DEFAULT_COLUMNS,
  ensureBoardSetup,
  ensureDefaultColumns
};

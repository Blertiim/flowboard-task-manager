export const TASK_TYPE_OPTIONS = [
  {
    value: "task",
    label: "Task",
    badgeClass: "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-200"
  },
  {
    value: "bug",
    label: "Bug",
    badgeClass: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-200"
  },
  {
    value: "feature",
    label: "Feature",
    badgeClass: "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-200"
  }
];

const taskTypeMap = Object.fromEntries(TASK_TYPE_OPTIONS.map((item) => [item.value, item]));

export function getTaskTypeStyle(type) {
  return taskTypeMap[type] || taskTypeMap.task;
}

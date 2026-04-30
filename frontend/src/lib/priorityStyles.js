export const PRIORITY_OPTIONS = [
  {
    value: "critical",
    label: "Critical",
    icon: "!",
    badgeClass: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-200"
  },
  {
    value: "important",
    label: "Important",
    icon: "~",
    badgeClass: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-200"
  },
  {
    value: "not-important",
    label: "Not Important",
    icon: "+",
    badgeClass: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200"
  }
];

const priorityMap = Object.fromEntries(PRIORITY_OPTIONS.map((priority) => [priority.value, priority]));

export function getPriorityStyle(priority) {
  return priorityMap[priority] || priorityMap.important;
}

import { createPortal } from "react-dom";
import { getPriorityStyle } from "../lib/priorityStyles";

function formatDueDate(dueDate) {
  if (!dueDate) {
    return null;
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(dueDate));
}

function isOverdue(dueDate, columnTitle) {
  if (!dueDate || String(columnTitle).toLowerCase() === "done") {
    return false;
  }

  return new Date(dueDate).getTime() < Date.now();
}

export default function TaskCard({
  column,
  dragHandleProps,
  innerRef,
  isDragging,
  provided,
  snapshot,
  task,
  onEdit
}) {
  const dueLabel = formatDueDate(task.dueDate);
  const overdue = isOverdue(task.dueDate, column.title);
  const priorityStyle = getPriorityStyle(task.priority);
  const card = (
    <article
      ref={innerRef}
      {...provided.draggableProps}
      {...dragHandleProps}
      onClick={() => onEdit(task)}
      className={`cursor-pointer rounded-[16px] border p-3.5 shadow-card transition duration-200 ${
        isDragging || snapshot.isDragging
          ? "rotate-[1deg] border-board-ocean bg-white shadow-2xl dark:bg-slate-900"
          : "border-slate-200/80 bg-white hover:-translate-y-0.5 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900/90 dark:hover:border-slate-700"
      }`}
    >
      <div className="flex items-start gap-3">
        <h3 className="min-w-0 flex-1 text-sm font-semibold leading-6 text-slate-900 dark:text-slate-50">
          {task.title}
        </h3>
        <span
          className={`shrink-0 self-start rounded-full px-2.5 py-1 text-[10px] font-semibold leading-none ${priorityStyle.badgeClass}`}
        >
          {priorityStyle.icon} {priorityStyle.label}
        </span>
      </div>

      {task.description ? (
        <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-600 dark:text-slate-300">{task.description}</p>
      ) : (
        <p className="mt-2 text-sm italic text-slate-400 dark:text-slate-500">No description yet.</p>
      )}

      <div className="mt-3 flex flex-wrap gap-2">
        {task.link ? (
          <span className="rounded-full bg-board-ocean/10 px-3 py-1 text-xs font-semibold text-board-ocean dark:bg-board-ocean/20">
            Link attached
          </span>
        ) : null}

        {dueLabel ? (
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              overdue
                ? "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-200"
                : "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-200"
            }`}
          >
            {overdue ? "Overdue" : "Due"} {dueLabel}
          </span>
        ) : null}
      </div>

      <div className="mt-3 text-xs text-slate-400 dark:text-slate-500">
        Created{" "}
        {new Intl.DateTimeFormat(undefined, {
          dateStyle: "medium",
          timeStyle: "short"
        }).format(new Date(task.createdAt))}
      </div>
    </article>
  );

  if (isDragging || snapshot.isDragging) {
    return createPortal(card, document.body);
  }

  return card;
}

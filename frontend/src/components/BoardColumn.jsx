import { useEffect, useState } from "react";
import { Draggable, Droppable } from "@hello-pangea/dnd";
import { COLUMN_ACCENTS, getAccentStyle } from "../lib/columnStyles";
import TaskCard from "./TaskCard";

function buildDraftColumn(column) {
  return {
    title: column.title || "",
    description: column.description || "",
    accent: column.accent || "slate"
  };
}

export default function BoardColumn({
  column,
  dragDisabled,
  onDeleteColumn,
  onOpenCard,
  onQuickAddCard,
  onUpdateColumn,
  tasks
}) {
  const accentStyle = getAccentStyle(column.accent);
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [composerTitle, setComposerTitle] = useState("");
  const [composerBusy, setComposerBusy] = useState(false);
  const [composerError, setComposerError] = useState("");
  const [isEditingColumn, setIsEditingColumn] = useState(false);
  const [columnBusy, setColumnBusy] = useState(false);
  const [columnError, setColumnError] = useState("");
  const [draftColumn, setDraftColumn] = useState(() => buildDraftColumn(column));

  useEffect(() => {
    if (!isEditingColumn) {
      setDraftColumn(buildDraftColumn(column));
    }
  }, [column, isEditingColumn]);

  async function handleQuickAdd() {
    if (!composerTitle.trim()) {
      setComposerError("Card title is required.");
      return;
    }

    try {
      setComposerBusy(true);
      setComposerError("");
      await onQuickAddCard(column._id, composerTitle.trim());
      setComposerTitle("");
      setIsComposerOpen(false);
    } catch (error) {
      setComposerError(error.message);
    } finally {
      setComposerBusy(false);
    }
  }

  async function handleColumnSave() {
    if (!draftColumn.title.trim()) {
      setColumnError("List title is required.");
      return;
    }

    try {
      setColumnBusy(true);
      setColumnError("");
      await onUpdateColumn(column._id, {
        title: draftColumn.title.trim(),
        description: draftColumn.description.trim(),
        accent: draftColumn.accent
      });
      setIsEditingColumn(false);
    } catch (error) {
      setColumnError(error.message);
    } finally {
      setColumnBusy(false);
    }
  }

  function cancelColumnEdit() {
    setDraftColumn(buildDraftColumn(column));
    setColumnError("");
    setIsEditingColumn(false);
  }

  return (
    <section className="flex min-h-[calc(100vh-250px)] w-[320px] shrink-0 flex-col rounded-[20px] border border-white/70 bg-[#f7f8fb]/88 p-3 shadow-board backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/84">
      <div className={`rounded-[16px] border px-3 py-3 ${accentStyle.headerClass} ${accentStyle.borderClass}`}>
        {isEditingColumn ? (
          <div className="space-y-3">
            <input
              type="text"
              value={draftColumn.title}
              maxLength={50}
              onChange={(event) =>
                setDraftColumn((current) => ({ ...current, title: event.target.value }))
              }
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-800 outline-none transition focus:border-board-ocean dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
            />
            <textarea
              rows="2"
              maxLength={160}
              value={draftColumn.description}
              onChange={(event) =>
                setDraftColumn((current) => ({ ...current, description: event.target.value }))
              }
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-board-ocean dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
              placeholder="Optional list description"
            />
            <div className="flex flex-wrap gap-2">
              {COLUMN_ACCENTS.map((accent) => {
                const accentChoice = getAccentStyle(accent.value);
                const selected = draftColumn.accent === accent.value;

                return (
                  <button
                    key={accent.value}
                    type="button"
                    onClick={() =>
                      setDraftColumn((current) => ({ ...current, accent: accent.value }))
                    }
                    className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                      selected
                        ? "border-slate-950 bg-slate-950 text-white dark:border-slate-100 dark:bg-slate-100 dark:text-slate-950"
                        : "border-slate-200 bg-white text-slate-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
                    }`}
                  >
                    <span className={`h-2.5 w-2.5 rounded-full ${accentChoice.dotClass}`} />
                    {accent.label}
                  </button>
                );
              })}
            </div>
            {columnError ? (
              <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-200">
                {columnError}
              </div>
            ) : null}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleColumnSave}
                disabled={columnBusy}
                className="rounded-xl bg-slate-950 px-3 py-2 text-sm font-semibold text-white transition hover:bg-board-ocean disabled:cursor-not-allowed disabled:opacity-60 dark:bg-board-ocean dark:hover:bg-board-coral"
              >
                {columnBusy ? "Saving..." : "Save"}
              </button>
              <button
                type="button"
                onClick={cancelColumnEdit}
                className="rounded-xl px-3 py-2 text-sm font-semibold text-slate-500 transition hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
              >
                Cancel
              </button>
              {!column.isDefault ? (
                <button
                  type="button"
                  onClick={() => onDeleteColumn(column)}
                  className="rounded-xl px-3 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-50 dark:text-rose-300 dark:hover:bg-rose-950/20"
                >
                  Delete list
                </button>
              ) : null}
            </div>
          </div>
        ) : (
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className={`h-3 w-3 shrink-0 rounded-full ${accentStyle.dotClass}`} />
                <h2 className="truncate font-['Space_Grotesk'] text-lg font-bold text-board-ink dark:text-slate-50">
                  {column.title}
                </h2>
                {column.isDefault ? (
                  <span className="rounded-full bg-slate-950 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white dark:bg-slate-100 dark:text-slate-950">
                    Default
                  </span>
                ) : null}
              </div>
              {column.description ? (
                <p className="mt-1 text-sm leading-5 text-slate-500 dark:text-slate-400">
                  {column.description}
                </p>
              ) : null}
            </div>

            <div className="flex items-center gap-2">
              <span className="rounded-full bg-white/80 px-2.5 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-950 dark:text-slate-300">
                {tasks.length}
              </span>
              <button
                type="button"
                onClick={() => setIsEditingColumn(true)}
                className="rounded-xl px-2.5 py-2 text-xs font-semibold text-slate-500 transition hover:bg-white/80 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-950 dark:hover:text-white"
              >
                Edit
              </button>
            </div>
          </div>
        )}
      </div>

      <Droppable droppableId={column._id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`board-scroll mt-3 flex min-h-[220px] flex-1 flex-col gap-3 overflow-y-auto rounded-[16px] px-1 py-1 transition ${
              snapshot.isDraggingOver
                ? "bg-board-ocean/8 dark:bg-board-ocean/12"
                : "bg-transparent"
            }`}
          >
            {tasks.map((task, index) => (
              <Draggable
                key={task._id}
                draggableId={task._id}
                index={index}
                isDragDisabled={dragDisabled}
              >
                {(draggableProvided, draggableSnapshot) => (
                  <TaskCard
                    column={column}
                    task={task}
                    onEdit={onOpenCard}
                    provided={draggableProvided}
                    snapshot={draggableSnapshot}
                    innerRef={draggableProvided.innerRef}
                    dragHandleProps={draggableProvided.dragHandleProps}
                    isDragging={draggableSnapshot.isDragging}
                  />
                )}
              </Draggable>
            ))}

            {!tasks.length ? (
              <div className="pointer-events-none rounded-[16px] border border-dashed border-slate-300 bg-white/55 px-4 py-6 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-950/40 dark:text-slate-400">
                No cards yet. Add one below or drop one here.
              </div>
            ) : null}

            {provided.placeholder}
          </div>
        )}
      </Droppable>

      <div className="mt-3">
        {isComposerOpen ? (
          <div className="rounded-[16px] border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-700 dark:bg-slate-950">
            <textarea
              rows="3"
              value={composerTitle}
              autoFocus
              placeholder="Enter a title for this card..."
              onChange={(event) => setComposerTitle(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  handleQuickAdd();
                }
              }}
              className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-800 outline-none transition focus:border-board-ocean dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
            />
            {composerError ? (
              <div className="mt-3 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-200">
                {composerError}
              </div>
            ) : null}
            <div className="mt-3 flex items-center gap-3">
              <button
                type="button"
                onClick={handleQuickAdd}
                disabled={composerBusy}
                className="rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-board-ocean disabled:cursor-not-allowed disabled:opacity-60 dark:bg-board-ocean dark:hover:bg-board-coral"
              >
                {composerBusy ? "Adding..." : "Add card"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setComposerTitle("");
                  setComposerError("");
                  setIsComposerOpen(false);
                }}
                className="rounded-xl px-3 py-2 text-sm font-semibold text-slate-500 transition hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setIsComposerOpen(true)}
            className="flex w-full items-center gap-2 rounded-[16px] px-3 py-3 text-left text-sm font-semibold text-slate-500 transition hover:bg-white/70 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-950 dark:hover:text-white"
          >
            <span className="text-lg leading-none">+</span>
            Add a card
          </button>
        )}
      </div>
    </section>
  );
}

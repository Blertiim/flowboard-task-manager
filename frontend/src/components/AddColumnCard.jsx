import { useState } from "react";
import { COLUMN_ACCENTS, getAccentStyle } from "../lib/columnStyles";

const DEFAULT_FORM = {
  title: "",
  description: "",
  accent: "slate"
};

export default function AddColumnCard({ disabled, onCreateColumn }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [form, setForm] = useState(DEFAULT_FORM);

  function resetComposer() {
    setForm(DEFAULT_FORM);
    setErrorMessage("");
    setIsOpen(false);
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!form.title.trim()) {
      setErrorMessage("List title is required.");
      return;
    }

    try {
      setIsSaving(true);
      setErrorMessage("");
      await onCreateColumn({
        title: form.title.trim(),
        description: form.description.trim(),
        accent: form.accent
      });
      resetComposer();
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsSaving(false);
    }
  }

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        disabled={disabled}
        className="flex h-[fit-content] w-[320px] shrink-0 items-center gap-3 rounded-[20px] border border-white/70 bg-white/68 px-4 py-4 text-left shadow-board backdrop-blur-xl transition hover:-translate-y-0.5 hover:bg-white/84 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-800 dark:bg-slate-900/70 dark:hover:bg-slate-900/82"
      >
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-950 text-xl font-light text-white dark:bg-slate-100 dark:text-slate-950">
          +
        </span>
        <div>
          <div className="font-semibold text-board-ink dark:text-slate-50">Add another list</div>
          <div className="text-sm text-slate-500 dark:text-slate-400">
            Create a new Trello-style lane inline.
          </div>
        </div>
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-[320px] shrink-0 rounded-[20px] border border-white/70 bg-white/88 p-4 shadow-board backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/86"
    >
      <input
        type="text"
        value={form.title}
        autoFocus
        maxLength={50}
        placeholder="Enter list title..."
        onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-board-ocean dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
      />

      <textarea
        rows="3"
        maxLength={160}
        value={form.description}
        placeholder="Optional description"
        onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
        className="mt-3 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-board-ocean dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
      />

      <div className="mt-3 flex flex-wrap gap-2">
        {COLUMN_ACCENTS.map((accent) => {
          const accentStyle = getAccentStyle(accent.value);
          const selected = form.accent === accent.value;

          return (
            <button
              key={accent.value}
              type="button"
              onClick={() => setForm((current) => ({ ...current, accent: accent.value }))}
              className={`flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-semibold transition ${
                selected
                  ? "border-slate-950 bg-slate-950 text-white dark:border-slate-100 dark:bg-slate-100 dark:text-slate-950"
                  : "border-slate-200 bg-white text-slate-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
              }`}
            >
              <span className={`h-2.5 w-2.5 rounded-full ${accentStyle.dotClass}`} />
              {accent.label}
            </button>
          );
        })}
      </div>

      {errorMessage ? (
        <div className="mt-3 rounded-2xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-200">
          {errorMessage}
        </div>
      ) : null}

      <div className="mt-4 flex items-center gap-3">
        <button
          type="submit"
          disabled={isSaving || disabled}
          className="rounded-2xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-board-ocean disabled:cursor-not-allowed disabled:opacity-60 dark:bg-board-ocean dark:hover:bg-board-coral"
        >
          {isSaving ? "Adding..." : "Add list"}
        </button>
        <button
          type="button"
          onClick={resetComposer}
          className="rounded-2xl px-3 py-2.5 text-sm font-semibold text-slate-500 transition hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

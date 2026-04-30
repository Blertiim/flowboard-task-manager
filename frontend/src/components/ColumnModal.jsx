import { COLUMN_ACCENTS, getAccentStyle } from "../lib/columnStyles";

export default function ColumnModal({
  form,
  isEditing,
  isOpen,
  isSaving,
  onChange,
  onClose,
  onSubmit
}) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/50 p-4 backdrop-blur-sm sm:items-center">
      <div className="w-full max-w-xl rounded-[32px] border border-white/60 bg-white p-6 shadow-board dark:border-slate-800 dark:bg-slate-900 sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-board-ocean">
              {isEditing ? "Edit column" : "Create column"}
            </p>
            <h2 className="mt-2 font-['Space_Grotesk'] text-3xl font-bold text-board-ink dark:text-slate-50">
              {isEditing ? "Update this workflow lane" : "Add a new workflow lane"}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-slate-400 hover:text-slate-950 dark:border-slate-700 dark:text-slate-300 dark:hover:border-slate-500 dark:hover:text-white"
          >
            Close
          </button>
        </div>

        <form
          className="mt-6 grid gap-5"
          onSubmit={(event) => {
            event.preventDefault();
            onSubmit();
          }}
        >
          <label className="grid gap-2">
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Column name</span>
            <input
              type="text"
              required
              maxLength={50}
              value={form.title}
              onChange={(event) => onChange("title", event.target.value)}
              placeholder="Critical"
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-board-ocean dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
            />
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Description</span>
            <textarea
              rows="3"
              maxLength={160}
              value={form.description}
              onChange={(event) => onChange("description", event.target.value)}
              placeholder="High-impact work that needs attention first."
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-board-ocean dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
            />
          </label>

          <div className="grid gap-3">
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Accent</span>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {COLUMN_ACCENTS.map((accent) => {
                const style = getAccentStyle(accent.value);
                const selected = form.accent === accent.value;

                return (
                  <button
                    key={accent.value}
                    type="button"
                    onClick={() => onChange("accent", accent.value)}
                    className={`flex items-center gap-3 rounded-2xl border px-3 py-3 text-sm font-semibold transition ${
                      selected
                        ? "border-slate-950 bg-slate-950 text-white dark:border-slate-100 dark:bg-slate-100 dark:text-slate-950"
                        : "border-slate-200 bg-white text-slate-700 hover:border-slate-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:border-slate-500"
                    }`}
                  >
                    <span className={`h-3 w-3 rounded-full ${style.dotClass}`} />
                    {accent.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:text-slate-950 dark:border-slate-700 dark:text-slate-200 dark:hover:border-slate-500 dark:hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-board-ocean disabled:cursor-not-allowed disabled:opacity-60 dark:bg-board-ocean dark:hover:bg-board-coral"
            >
              {isSaving ? "Saving..." : isEditing ? "Save column" : "Create column"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

import { getPriorityStyle, PRIORITY_OPTIONS } from "../lib/priorityStyles";
import { getTaskTypeStyle, TASK_TYPE_OPTIONS } from "../lib/taskTypeStyles";

function toDateTimeLocalValue(dateValue) {
  if (!dateValue) {
    return "";
  }

  const date = new Date(dateValue);
  const pad = (value) => String(value).padStart(2, "0");

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function SectionLabel({ children }) {
  return (
    <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">
      {children}
    </div>
  );
}

function FieldLabel({ icon, children }) {
  return (
    <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
      <span className="text-slate-400">{icon}</span>
      <span>{children}</span>
    </div>
  );
}

function IconCalendar() {
  return (
    <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="2.25" y="3.25" width="11.5" height="10.5" rx="2" />
      <path d="M5 2.5v2M11 2.5v2M2.5 6.5h11" />
    </svg>
  );
}

function IconLink() {
  return (
    <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M6.25 9.75 4.5 11.5a2.475 2.475 0 1 1-3.5-3.5l2-2a2.475 2.475 0 0 1 3.5 0" />
      <path d="M9.75 6.25 11.5 4.5a2.475 2.475 0 1 1 3.5 3.5l-2 2a2.475 2.475 0 0 1-3.5 0" />
      <path d="m6 10 4-4" />
    </svg>
  );
}

function IconPriority() {
  return (
    <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M4 13.25V2.75" />
      <path d="M4.75 3.25h5.9l-1.4 2.5 1.4 2.5h-5.9" />
    </svg>
  );
}

function IconStatus() {
  return (
    <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="8" cy="8" r="5.75" />
      <path d="m5.75 8 1.5 1.5 3-3" />
    </svg>
  );
}

function IconDescription() {
  return (
    <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M3 4.25h10M3 8h10M3 11.75h6.5" />
    </svg>
  );
}

function IconType() {
  return (
    <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M3 4.25h10" />
      <path d="M5.5 4.25V11.75" />
      <path d="M10.5 4.25V11.75" />
      <path d="M3 11.75h10" />
    </svg>
  );
}

export default function TaskModal({
  columns,
  form,
  isOpen,
  isSaving,
  isEditing,
  onChange,
  onClose,
  onDelete,
  onSubmit
}) {
  if (!isOpen) {
    return null;
  }

  const titleError = !form.title.trim() ? "A summary is required." : "";
  const selectedPriority = getPriorityStyle(form.priority);
  const selectedType = getTaskTypeStyle(form.type);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/24 p-4 backdrop-blur-[1px] sm:items-center">
      <div className="max-h-[94vh] w-full max-w-[860px] overflow-hidden rounded-2xl border border-slate-200 bg-[#F4F5F7] shadow-[0_18px_48px_rgba(9,30,66,0.16)]">
        <div className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
              {isEditing ? "Issue Details" : "Create Issue"}
            </div>
            <h2 className="mt-1 text-lg font-semibold text-slate-900">
              {isEditing ? "Edit task" : "Create task"}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
          >
            Close
          </button>
        </div>

        <form
          className="max-h-[calc(94vh-73px)] overflow-y-auto"
          onSubmit={(event) => {
            event.preventDefault();

            if (titleError) {
              return;
            }

            onSubmit();
          }}
        >
          <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_280px]">
            <div className="bg-white px-6 py-6">
              <div className="space-y-6">
                <section className="space-y-3">
                  <SectionLabel>Issue details</SectionLabel>
                  <div className="space-y-2">
                    <input
                      type="text"
                      required
                      maxLength={120}
                      value={form.title}
                      onChange={(event) => onChange("title", event.target.value)}
                      placeholder="What needs to be done?"
                      className={`w-full rounded-md border bg-white px-3 py-3 text-[28px] font-medium leading-tight text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#0C66E4] focus:ring-2 focus:ring-[#85B8FF] ${
                        titleError ? "border-rose-300" : "border-slate-300"
                      }`}
                    />
                    {titleError ? (
                      <div className="text-sm font-medium text-rose-600">{titleError}</div>
                    ) : null}
                  </div>
                </section>

                <div className="border-t border-slate-200" />

                <section className="space-y-3">
                  <FieldLabel icon={<IconDescription />}>Description</FieldLabel>
                  <textarea
                    rows="10"
                    value={form.description}
                    onChange={(event) => onChange("description", event.target.value)}
                    placeholder="Add a description..."
                    className="w-full rounded-md border border-slate-300 bg-white px-3 py-3 text-sm leading-6 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#0C66E4] focus:ring-2 focus:ring-[#85B8FF]"
                  />
                </section>

                <div className="border-t border-slate-200" />

                <section className="space-y-4">
                  <SectionLabel>Attachments and references</SectionLabel>
                  <div className="grid gap-4 md:grid-cols-2">
                    <label className="grid gap-2">
                      <FieldLabel icon={<IconLink />}>Link</FieldLabel>
                      <input
                        type="url"
                        value={form.link}
                        onChange={(event) => onChange("link", event.target.value)}
                        placeholder="https://example.com"
                        className="w-full rounded-md border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#0C66E4] focus:ring-2 focus:ring-[#85B8FF]"
                      />
                    </label>

                    <label className="grid gap-2">
                      <FieldLabel icon={<IconCalendar />}>Due date</FieldLabel>
                      <input
                        type="datetime-local"
                        value={toDateTimeLocalValue(form.dueDate)}
                        onChange={(event) => onChange("dueDate", event.target.value)}
                        className="w-full rounded-md border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-[#0C66E4] focus:ring-2 focus:ring-[#85B8FF]"
                      />
                    </label>
                  </div>
                </section>
              </div>
            </div>

            <aside className="border-t border-slate-200 bg-[#F7F8F9] px-6 py-6 lg:border-l lg:border-t-0">
              <div className="space-y-6">
                <section className="space-y-4">
                  <SectionLabel>Metadata</SectionLabel>

                  <label className="grid gap-2">
                    <FieldLabel icon={<IconPriority />}>Priority</FieldLabel>
                    <div className="relative">
                      <select
                        value={form.priority}
                        onChange={(event) => onChange("priority", event.target.value)}
                        className={`w-full appearance-none rounded-md border border-slate-300 bg-white px-3 py-2.5 pr-10 text-sm font-medium text-slate-800 outline-none transition focus:border-[#0C66E4] focus:ring-2 focus:ring-[#85B8FF] ${selectedPriority.badgeClass}`}
                      >
                        {PRIORITY_OPTIONS.map((priority) => (
                          <option key={priority.value} value={priority.value}>
                            {priority.label}
                          </option>
                        ))}
                      </select>
                      <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-xs font-semibold text-current">
                        {selectedPriority.icon}
                      </span>
                      <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-slate-400">
                        <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <path d="m4.5 6 3.5 4 3.5-4" />
                        </svg>
                      </span>
                    </div>
                  </label>

                  <label className="grid gap-2">
                    <FieldLabel icon={<IconType />}>Type</FieldLabel>
                    <div className="relative">
                      <select
                        value={form.type}
                        onChange={(event) => onChange("type", event.target.value)}
                        className={`w-full appearance-none rounded-md border border-slate-300 bg-white px-3 py-2.5 pr-10 text-sm font-medium text-slate-800 outline-none transition focus:border-[#0C66E4] focus:ring-2 focus:ring-[#85B8FF] ${selectedType.badgeClass}`}
                      >
                        {TASK_TYPE_OPTIONS.map((item) => (
                          <option key={item.value} value={item.value}>
                            {item.label}
                          </option>
                        ))}
                      </select>
                      <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-slate-400">
                        <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <path d="m4.5 6 3.5 4 3.5-4" />
                        </svg>
                      </span>
                    </div>
                  </label>

                  <label className="grid gap-2">
                    <FieldLabel icon={<IconStatus />}>Status</FieldLabel>
                    <select
                      value={form.columnId}
                      onChange={(event) => onChange("columnId", event.target.value)}
                      className="w-full rounded-md border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-[#0C66E4] focus:ring-2 focus:ring-[#85B8FF]"
                    >
                      {columns.map((column) => (
                        <option key={column._id} value={column._id}>
                          {column.title}
                        </option>
                      ))}
                    </select>
                  </label>

                  <div className="grid gap-2">
                    <FieldLabel icon={<IconCalendar />}>Created</FieldLabel>
                    <div className="rounded-md border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-600">
                      {form.createdAt
                        ? new Intl.DateTimeFormat(undefined, {
                            dateStyle: "medium",
                            timeStyle: "short"
                          }).format(new Date(form.createdAt))
                        : "Saved after creation"}
                    </div>
                  </div>
                </section>

                <div className="border-t border-slate-200" />

                <section className="space-y-4">
                  <SectionLabel>Actions</SectionLabel>
                  <div className="flex flex-col gap-3">
                    <button
                      type="button"
                      onClick={onClose}
                      className="order-2 rounded-md border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSaving || Boolean(titleError)}
                      className="order-1 rounded-md bg-[#0C66E4] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0055CC] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isSaving ? "Saving..." : isEditing ? "Save changes" : "Create issue"}
                    </button>
                    {isEditing ? (
                      <button
                        type="button"
                        onClick={onDelete}
                        disabled={isSaving}
                        className="rounded-md px-1 py-2 text-left text-sm font-medium text-rose-600 transition hover:text-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        Delete issue
                      </button>
                    ) : null}
                  </div>
                </section>
              </div>
            </aside>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function HeaderBar({
  darkMode,
  dueReminderEnabled,
  currentUser,
  onPriorityFilterChange,
  onSearchChange,
  onSignOut,
  onToggleDarkMode,
  onToggleDueReminders,
  priorityFilter,
  searchValue,
  taskCount
}) {
  return (
    <header className="rounded-[28px] border border-white/70 bg-white/82 px-5 py-4 shadow-board backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/82">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
            Trello-Style Board
          </p>
          <div className="mt-1 flex flex-wrap items-center gap-3">
            <h1 className="font-['Space_Grotesk'] text-3xl font-bold text-board-ink dark:text-slate-50">
              FlowBoard
            </h1>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              {taskCount} cards
            </span>
          </div>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
            Move cards visually across lists, add new ones inline, and keep details one click away.
          </p>
          {currentUser ? (
            <p className="mt-2 text-sm font-medium text-slate-500 dark:text-slate-400">
              Signed in as {currentUser.name} ({currentUser.email})
            </p>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <label className="flex min-w-[240px] items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm dark:border-slate-700 dark:bg-slate-950">
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              className="h-5 w-5 text-slate-400"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="M20 20l-3.5-3.5" />
            </svg>
            <input
              type="search"
              value={searchValue}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Search cards"
              className="w-full border-none bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400 dark:text-slate-100 dark:placeholder:text-slate-500"
            />
          </label>

          <select
            value={priorityFilter}
            onChange={(event) => onPriorityFilterChange(event.target.value)}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
          >
            <option value="all">All priorities</option>
            <option value="critical">Critical</option>
            <option value="important">Important</option>
            <option value="not-important">Not Important</option>
          </select>

          <button
            type="button"
            onClick={onToggleDarkMode}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:text-slate-950 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:border-slate-500 dark:hover:text-white"
          >
            {darkMode ? "Light" : "Dark"}
          </button>

          <button
            type="button"
            onClick={onToggleDueReminders}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:text-slate-950 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:border-slate-500 dark:hover:text-white"
          >
            {dueReminderEnabled ? "Reminders on" : "Reminders"}
          </button>

          <button
            type="button"
            onClick={onSignOut}
            className="rounded-2xl border border-rose-200 bg-white px-4 py-3 text-sm font-semibold text-rose-700 transition hover:border-rose-400 hover:bg-rose-50 dark:border-rose-900 dark:bg-slate-950 dark:text-rose-300 dark:hover:bg-rose-950/20"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}

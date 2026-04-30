import { useState } from "react";

const DEFAULT_FORM = {
  name: "",
  email: "",
  password: ""
};

export default function AuthScreen({ errorMessage, isLoading, onLogin, onRegister }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState(DEFAULT_FORM);
  const [formError, setFormError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setFormError("");

    if (mode === "register" && !form.name.trim()) {
      setFormError("Name is required.");
      return;
    }

    if (!form.email.trim() || !form.password) {
      setFormError("Email and password are required.");
      return;
    }

    if (mode === "register" && form.password.length < 6) {
      setFormError("Password must be at least 6 characters.");
      return;
    }

    const payload = {
      name: form.name.trim(),
      email: form.email.trim(),
      password: form.password
    };

    if (mode === "login") {
      await onLogin(payload);
      return;
    }

    await onRegister(payload);
  }

  function switchMode(nextMode) {
    setMode(nextMode);
    setFormError("");
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(54,164,255,0.16),_transparent_28%),radial-gradient(circle_at_top_right,_rgba(43,214,153,0.16),_transparent_22%),linear-gradient(180deg,_#edf5ff_0%,_#e8eff8_44%,_#dde7f4_100%)] px-4 py-10 text-slate-900 dark:bg-[radial-gradient(circle_at_top_left,_rgba(54,164,255,0.14),_transparent_20%),radial-gradient(circle_at_top_right,_rgba(43,214,153,0.14),_transparent_18%),linear-gradient(180deg,_#081221_0%,_#0e1728_42%,_#111827_100%)] dark:text-slate-50">
      <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-[28px] border border-white/70 bg-white/80 p-8 shadow-board backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/82">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
            Shared Workspace
          </p>
          <h1 className="mt-3 font-['Space_Grotesk'] text-4xl font-bold text-board-ink dark:text-slate-50">
            FlowBoard for two separate task spaces
          </h1>
          <p className="mt-4 max-w-xl text-base leading-7 text-slate-600 dark:text-slate-300">
            Sign in with your own account and each person will only see their own board,
            columns, and cards. This keeps your work and your cousin's work separate.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {[
              ["Private board", "Every account gets its own Todo, In Progress, and Done lanes."],
              ["Own tasks", "Bug, feature, and task cards stay tied to the signed-in user."],
              ["Easy sharing", "You can both use the same app URL without mixing work."]
            ].map(([title, description]) => (
              <div
                key={title}
                className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-950/60"
              >
                <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">{title}</div>
                <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[28px] border border-white/70 bg-white/88 p-6 shadow-board backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/88">
          <div className="flex items-center gap-2 rounded-2xl bg-slate-100 p-1 dark:bg-slate-800/90">
            <button
              type="button"
              onClick={() => switchMode("login")}
              className={`flex-1 rounded-2xl px-4 py-2.5 text-sm font-semibold transition ${
                mode === "login"
                  ? "bg-white text-slate-900 shadow-sm dark:bg-slate-950 dark:text-white"
                  : "text-slate-500 dark:text-slate-300"
              }`}
            >
              Sign in
            </button>
            <button
              type="button"
              onClick={() => switchMode("register")}
              className={`flex-1 rounded-2xl px-4 py-2.5 text-sm font-semibold transition ${
                mode === "register"
                  ? "bg-white text-slate-900 shadow-sm dark:bg-slate-950 dark:text-white"
                  : "text-slate-500 dark:text-slate-300"
              }`}
            >
              Create account
            </button>
          </div>

          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            {mode === "register" ? (
              <label className="grid gap-2">
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Name</span>
                <input
                  type="text"
                  value={form.name}
                  onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-board-ocean dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                  placeholder="Blerti"
                />
              </label>
            ) : null}

            <label className="grid gap-2">
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Email</span>
              <input
                type="email"
                value={form.email}
                onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-board-ocean dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                placeholder="name@example.com"
              />
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Password</span>
              <input
                type="password"
                value={form.password}
                onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-board-ocean dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                placeholder="At least 6 characters"
              />
            </label>

            {formError || errorMessage ? (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-200">
                {formError || errorMessage}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-board-ocean disabled:cursor-not-allowed disabled:opacity-60 dark:bg-board-ocean dark:hover:bg-board-coral"
            >
              {isLoading
                ? "Please wait..."
                : mode === "login"
                  ? "Sign in to your board"
                  : "Create account and open board"}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}

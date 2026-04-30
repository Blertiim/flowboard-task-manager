import { useEffect, useState } from "react";
import { DragDropContext } from "@hello-pangea/dnd";
import AddColumnCard from "./components/AddColumnCard";
import AuthScreen from "./components/AuthScreen";
import BoardColumn from "./components/BoardColumn";
import HeaderBar from "./components/HeaderBar";
import TaskModal from "./components/TaskModal";
import {
  clearAuthToken,
  createColumn,
  createTask,
  deleteColumn,
  deleteTask,
  fetchBoard,
  fetchCurrentUser,
  hasAuthToken,
  loginUser,
  moveTask,
  registerUser,
  saveAuthToken,
  updateColumn,
  updateTask
} from "./lib/api";

const DEFAULT_TASK_FORM = {
  title: "",
  description: "",
  link: "",
  dueDate: "",
  priority: "important",
  type: "task",
  columnId: "",
  createdAt: ""
};

function normalizeInputValue(value) {
  return value || "";
}

function normalizeColumn(column) {
  const columnId = String(column._id || column.id);

  return {
    ...column,
    _id: columnId,
    id: columnId,
    title: column.title || column.name || "",
    description: normalizeInputValue(column.description),
    accent: normalizeInputValue(column.accent) || "slate",
    isDefault: Boolean(column.isDefault),
    systemKey: column.systemKey || null
  };
}

function normalizeTask(task) {
  const taskId = String(task._id || task.id);

  return {
    ...task,
    _id: taskId,
    id: taskId,
    title: task.title || "",
    description: normalizeInputValue(task.description),
    link: normalizeInputValue(task.link),
    dueDate: task.dueDate || "",
    priority: normalizeInputValue(task.priority) || "important",
    type: normalizeInputValue(task.type) || "task",
    columnId: String(task.columnId),
    position: typeof task.position === "number" ? task.position : 1024,
    createdAt: task.createdAt || "",
    updatedAt: task.updatedAt || ""
  };
}

function buildTaskGroups(columns, tasks = []) {
  const grouped = columns.reduce((accumulator, column) => {
    accumulator[column._id] = [];
    return accumulator;
  }, {});

  tasks.forEach((task) => {
    const key = String(task.columnId);

    if (!grouped[key]) {
      grouped[key] = [];
    }

    grouped[key].push(normalizeTask(task));
  });

  Object.values(grouped).forEach((columnTasks) => {
    columnTasks.sort((left, right) => left.position - right.position);
  });

  return grouped;
}

function buildBoardState(boardPayload) {
  const boardColumns = Array.isArray(boardPayload?.columns) ? boardPayload.columns : [];
  const normalizedColumns = boardColumns.map(normalizeColumn);
  const tasks = boardColumns.flatMap((column) =>
    (column.cards || column.tasks || []).map((task) =>
      normalizeTask({
        ...task,
        columnId: task.columnId || column.id || column._id
      })
    )
  );

  return {
    columns: normalizedColumns,
    taskGroups: buildTaskGroups(normalizedColumns, tasks)
  };
}

function flattenTasks(taskGroups) {
  return Object.values(taskGroups).flat();
}

function replaceTask(taskGroups, task, columns) {
  const normalizedTask = normalizeTask(task);
  const nextTasks = [
    ...flattenTasks(taskGroups).filter((item) => item._id !== normalizedTask._id),
    normalizedTask
  ];

  return buildTaskGroups(columns, nextTasks);
}

function removeTask(taskGroups, taskId, columns) {
  const nextTasks = flattenTasks(taskGroups).filter((task) => task._id !== taskId);
  return buildTaskGroups(columns, nextTasks);
}

function countTasks(taskGroups) {
  return Object.values(taskGroups).reduce((total, columnTasks) => total + columnTasks.length, 0);
}

function getSearchableText(task) {
  return [task.title, task.description, task.link].filter(Boolean).join(" ").toLowerCase();
}

function buildTaskForm(task, fallbackColumnId = "") {
  if (!task) {
    return { ...DEFAULT_TASK_FORM, columnId: fallbackColumnId };
  }

  return {
    title: normalizeInputValue(task.title),
    description: normalizeInputValue(task.description),
    link: normalizeInputValue(task.link),
    dueDate: task.dueDate || "",
    priority: normalizeInputValue(task.priority) || "important",
    type: normalizeInputValue(task.type) || "task",
    columnId: String(task.columnId || fallbackColumnId),
    createdAt: task.createdAt || ""
  };
}

function reorderTaskGroups(taskGroups, source, destination) {
  const sourceTasks = [...(taskGroups[source.droppableId] || [])];
  const destinationTasks =
    source.droppableId === destination.droppableId
      ? sourceTasks
      : [...(taskGroups[destination.droppableId] || [])];
  const [movedTask] = sourceTasks.splice(source.index, 1);

  if (!movedTask) {
    return taskGroups;
  }

  const updatedTask = {
    ...movedTask,
    columnId: destination.droppableId
  };

  destinationTasks.splice(destination.index, 0, updatedTask);

  return {
    ...taskGroups,
    [source.droppableId]:
      source.droppableId === destination.droppableId ? destinationTasks : sourceTasks,
    [destination.droppableId]: destinationTasks
  };
}

function shouldNotifyTask(task, columnTitle) {
  if (!task.dueDate || String(columnTitle).toLowerCase() === "done") {
    return false;
  }

  const dueTime = new Date(task.dueDate).getTime();
  const now = Date.now();
  const minutesUntilDue = (dueTime - now) / (1000 * 60);

  return minutesUntilDue <= 15 && minutesUntilDue >= -15;
}

function readReminderCache() {
  try {
    const rawValue = localStorage.getItem("flowboard-notified-tasks");
    return rawValue ? JSON.parse(rawValue) : {};
  } catch (error) {
    return {};
  }
}

function writeReminderCache(cache) {
  localStorage.setItem("flowboard-notified-tasks", JSON.stringify(cache));
}

export default function App() {
  const [columns, setColumns] = useState([]);
  const [taskGroups, setTaskGroups] = useState({});
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthSubmitting, setIsAuthSubmitting] = useState(false);
  const [isSavingTask, setIsSavingTask] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [taskForm, setTaskForm] = useState(DEFAULT_TASK_FORM);
  const [darkMode, setDarkMode] = useState(() => {
    const storedMode = localStorage.getItem("flowboard-theme");
    return storedMode ? storedMode === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches;
  });
  const [dueReminderEnabled, setDueReminderEnabled] = useState(
    () => localStorage.getItem("flowboard-due-reminders") === "enabled"
  );

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    localStorage.setItem("flowboard-theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem("flowboard-due-reminders", dueReminderEnabled ? "enabled" : "disabled");
  }, [dueReminderEnabled]);

  useEffect(() => {
    let cancelled = false;

    async function restoreSession() {
      if (!hasAuthToken()) {
        if (!cancelled) {
          setCurrentUser(null);
          setIsAuthLoading(false);
        }
        return;
      }

      try {
        const { user } = await fetchCurrentUser();

        if (!cancelled) {
          setCurrentUser(user);
          setErrorMessage("");
        }
      } catch (_error) {
        clearAuthToken();

        if (!cancelled) {
          setCurrentUser(null);
        }
      } finally {
        if (!cancelled) {
          setIsAuthLoading(false);
        }
      }
    }

    restoreSession();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadBoard() {
      if (!currentUser) {
        if (!cancelled) {
          setColumns([]);
          setTaskGroups({});
          setIsLoading(false);
        }
        return;
      }

      try {
        setIsLoading(true);
        setErrorMessage("");

        const board = await fetchBoard();

        if (!cancelled) {
          const nextState = buildBoardState(board);
          setColumns(nextState.columns);
          setTaskGroups(nextState.taskGroups);
        }
      } catch (error) {
        if (!cancelled) {
          setErrorMessage(error.message);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    loadBoard();

    return () => {
      cancelled = true;
    };
  }, [currentUser]);

  useEffect(() => {
    if (!dueReminderEnabled || typeof Notification === "undefined") {
      return undefined;
    }

    const columnMap = Object.fromEntries(columns.map((column) => [column._id, column]));

    const checkDueTasks = () => {
      if (Notification.permission !== "granted") {
        return;
      }

      const cache = readReminderCache();
      const allTasks = flattenTasks(taskGroups);

      allTasks.forEach((task) => {
        const reminderKey = `${task._id}:${task.dueDate || "none"}`;
        const columnTitle = columnMap[String(task.columnId)]?.title || "";

        if (shouldNotifyTask(task, columnTitle) && !cache[reminderKey]) {
          new Notification(`Task due soon: ${task.title}`, {
            body: task.dueDate
              ? `Due ${new Intl.DateTimeFormat(undefined, {
                  dateStyle: "medium",
                  timeStyle: "short"
                }).format(new Date(task.dueDate))}`
              : "Open FlowBoard to review the task."
          });
          cache[reminderKey] = true;
        }
      });

      writeReminderCache(cache);
    };

    checkDueTasks();
    const intervalId = window.setInterval(checkDueTasks, 60_000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [columns, dueReminderEnabled, taskGroups]);

  const hasSearch = Boolean(searchValue.trim());
  const hasPriorityFilter = priorityFilter !== "all";
  const hasActiveBoardFilter = hasSearch || hasPriorityFilter;
  const normalizedSearch = searchValue.trim().toLowerCase();
  const visibleTaskGroups = columns.reduce((accumulator, column) => {
    const columnTasks = taskGroups[column._id] || [];

    accumulator[column._id] = columnTasks.filter((task) => {
      const matchesSearch = hasSearch
        ? getSearchableText(task).includes(normalizedSearch)
        : true;
      const matchesPriority = hasPriorityFilter
        ? task.priority === priorityFilter
        : true;

      return matchesSearch && matchesPriority;
    });

    return accumulator;
  }, {});

  function openTaskModal(task) {
    setEditingTask(task);
    setTaskForm(buildTaskForm(task, columns[0]?._id || ""));
    setIsTaskModalOpen(true);
  }

  function closeTaskModal(force = false) {
    if (isSavingTask && !force) {
      return;
    }

    setIsTaskModalOpen(false);
    setEditingTask(null);
    setTaskForm(DEFAULT_TASK_FORM);
  }

  function updateTaskForm(field, value) {
    setTaskForm((currentForm) => ({
      ...currentForm,
      [field]: value
    }));
  }

  async function handleLogin(payload) {
    try {
      setIsAuthSubmitting(true);
      setErrorMessage("");
      const response = await loginUser(payload);
      saveAuthToken(response.token);
      setCurrentUser(response.user);
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsAuthSubmitting(false);
    }
  }

  async function handleRegister(payload) {
    try {
      setIsAuthSubmitting(true);
      setErrorMessage("");
      const response = await registerUser(payload);
      saveAuthToken(response.token);
      setCurrentUser(response.user);
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsAuthSubmitting(false);
    }
  }

  function handleSignOut() {
    clearAuthToken();
    setCurrentUser(null);
    setColumns([]);
    setTaskGroups({});
    setEditingTask(null);
    setIsTaskModalOpen(false);
    setErrorMessage("");
  }

  async function handleTaskSubmit() {
    if (!editingTask) {
      return;
    }

    try {
      setIsSavingTask(true);
      setErrorMessage("");
      const updatedTask = normalizeTask(await updateTask(editingTask._id, taskForm));
      setTaskGroups((currentGroups) => replaceTask(currentGroups, updatedTask, columns));
      closeTaskModal(true);
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsSavingTask(false);
    }
  }

  async function handleTaskDelete() {
    if (!editingTask) {
      return;
    }

    try {
      setIsSavingTask(true);
      setErrorMessage("");
      await deleteTask(editingTask._id);
      setTaskGroups((currentGroups) => removeTask(currentGroups, editingTask._id, columns));
      closeTaskModal(true);
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsSavingTask(false);
    }
  }

  async function handleCreateColumn(payload) {
    setErrorMessage("");
    const created = normalizeColumn(await createColumn(payload));
    setColumns((currentColumns) => [...currentColumns, created]);
    setTaskGroups((currentGroups) => ({
      ...currentGroups,
      [created._id]: []
    }));
    return created;
  }

  async function handleUpdateColumn(columnId, payload) {
    setErrorMessage("");
    const updated = normalizeColumn(await updateColumn(columnId, payload));
    setColumns((currentColumns) =>
      currentColumns.map((column) => (column._id === updated._id ? updated : column))
    );
    return updated;
  }

  async function handleDeleteColumn(column) {
    if (column.isDefault) {
      setErrorMessage("Default lists are locked and cannot be deleted.");
      return;
    }

    const confirmed = window.confirm(
      `Delete "${column.title}"? The list must be empty before it can be removed.`
    );

    if (!confirmed) {
      return;
    }

    setErrorMessage("");
    await deleteColumn(column._id);
    setColumns((currentColumns) => currentColumns.filter((item) => item._id !== column._id));
    setTaskGroups((currentGroups) => {
      const nextGroups = { ...currentGroups };
      delete nextGroups[column._id];
      return nextGroups;
    });
  }

  async function handleQuickAddCard(columnId, title) {
    setErrorMessage("");
    const createdTask = normalizeTask(
      await createTask({
        title,
        description: "",
        link: "",
        dueDate: "",
        priority: "important",
        type: "task",
        columnId
      })
    );

    setTaskGroups((currentGroups) => replaceTask(currentGroups, createdTask, columns));
    return createdTask;
  }

  async function handleDragEnd(result) {
    const { destination, source, draggableId } = result;

    if (!destination) {
      return;
    }

    if (hasActiveBoardFilter) {
      setErrorMessage("Clear search and priority filters before dragging cards so board order stays accurate.");
      return;
    }

    if (destination.droppableId === source.droppableId && destination.index === source.index) {
      return;
    }

    const previousTaskGroups = taskGroups;
    const nextTaskGroups = reorderTaskGroups(taskGroups, source, destination);
    setTaskGroups(nextTaskGroups);

    try {
      setErrorMessage("");
      const movedTask = normalizeTask(
        await moveTask(draggableId, {
          destinationColumnId: destination.droppableId,
          destinationIndex: destination.index
        })
      );

      setTaskGroups((currentGroups) => replaceTask(currentGroups, movedTask, columns));
    } catch (error) {
      setTaskGroups(previousTaskGroups);
      setErrorMessage(error.message);
    }
  }

  async function handleToggleDueReminders() {
    if (typeof Notification === "undefined") {
      setErrorMessage("This browser does not support notifications.");
      return;
    }

    if (Notification.permission === "default") {
      const permission = await Notification.requestPermission();

      if (permission !== "granted") {
        setErrorMessage("Notification permission was not granted.");
        return;
      }
    }

    if (Notification.permission === "denied") {
      setErrorMessage("Notifications are blocked in this browser.");
      return;
    }

    setDueReminderEnabled((currentValue) => !currentValue);
    setErrorMessage("");
  }

  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(54,164,255,0.16),_transparent_28%),radial-gradient(circle_at_top_right,_rgba(43,214,153,0.16),_transparent_22%),linear-gradient(180deg,_#edf5ff_0%,_#e8eff8_44%,_#dde7f4_100%)] px-4 py-10 dark:bg-[radial-gradient(circle_at_top_left,_rgba(54,164,255,0.14),_transparent_20%),radial-gradient(circle_at_top_right,_rgba(43,214,153,0.14),_transparent_18%),linear-gradient(180deg,_#081221_0%,_#0e1728_42%,_#111827_100%)]">
        <div className="mx-auto flex max-w-4xl items-center justify-center rounded-[28px] border border-white/70 bg-white/82 px-6 py-14 text-lg font-semibold text-slate-700 shadow-board backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/82 dark:text-slate-200">
          Loading your account...
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <AuthScreen
        errorMessage={errorMessage}
        isLoading={isAuthSubmitting}
        onLogin={handleLogin}
        onRegister={handleRegister}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(54,164,255,0.16),_transparent_28%),radial-gradient(circle_at_top_right,_rgba(43,214,153,0.16),_transparent_22%),linear-gradient(180deg,_#edf5ff_0%,_#e8eff8_44%,_#dde7f4_100%)] px-4 py-5 text-slate-900 dark:bg-[radial-gradient(circle_at_top_left,_rgba(54,164,255,0.14),_transparent_20%),radial-gradient(circle_at_top_right,_rgba(43,214,153,0.14),_transparent_18%),linear-gradient(180deg,_#081221_0%,_#0e1728_42%,_#111827_100%)] dark:text-slate-50 sm:px-5 lg:px-6">
      <div className="mx-auto flex max-w-[1800px] flex-col gap-5">
        <HeaderBar
          currentUser={currentUser}
          searchValue={searchValue}
          priorityFilter={priorityFilter}
          taskCount={countTasks(taskGroups)}
          darkMode={darkMode}
          dueReminderEnabled={dueReminderEnabled}
          onSignOut={handleSignOut}
          onPriorityFilterChange={setPriorityFilter}
          onSearchChange={setSearchValue}
          onToggleDarkMode={() => setDarkMode((currentValue) => !currentValue)}
          onToggleDueReminders={handleToggleDueReminders}
        />

        {errorMessage ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-200">
            {errorMessage}
          </div>
        ) : null}

        <div className="px-1 text-sm text-slate-600 dark:text-slate-300">
          {hasActiveBoardFilter
            ? "Filter mode is on. Dragging is paused until search and priority filters are cleared."
            : "Click any card for full details. Add cards inline inside each list, Trello-style."}
        </div>

        {isLoading ? (
          <div className="flex gap-4 overflow-x-auto pb-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="h-[560px] w-[320px] shrink-0 animate-pulse rounded-[20px] border border-white/70 bg-white/70 shadow-board dark:border-slate-800 dark:bg-slate-900/70"
              />
            ))}
          </div>
        ) : (
          <DragDropContext onDragEnd={handleDragEnd}>
            <div className="board-scroll flex items-start gap-4 overflow-x-auto pb-4">
              {columns.map((column, index) => (
                <div
                  key={column._id}
                  className="animate-floatIn"
                  style={{ animationDelay: `${index * 70}ms` }}
                >
                  <BoardColumn
                    column={column}
                    tasks={visibleTaskGroups[column._id] || []}
                    dragDisabled={hasActiveBoardFilter}
                    onDeleteColumn={handleDeleteColumn}
                    onOpenCard={openTaskModal}
                    onQuickAddCard={handleQuickAddCard}
                    onUpdateColumn={handleUpdateColumn}
                  />
                </div>
              ))}
              <div
                className="animate-floatIn"
                style={{ animationDelay: `${columns.length * 70}ms` }}
              >
                <AddColumnCard onCreateColumn={handleCreateColumn} />
              </div>
            </div>
          </DragDropContext>
        )}
      </div>

      <TaskModal
        columns={columns}
        form={taskForm}
        isOpen={isTaskModalOpen}
        isSaving={isSavingTask}
        isEditing={Boolean(editingTask)}
        onChange={updateTaskForm}
        onClose={closeTaskModal}
        onDelete={handleTaskDelete}
        onSubmit={handleTaskSubmit}
      />
    </div>
  );
}

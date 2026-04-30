const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";
const TOKEN_STORAGE_KEY = "flowboard-auth-token";

function getStoredToken() {
  return localStorage.getItem(TOKEN_STORAGE_KEY) || "";
}

export function saveAuthToken(token) {
  if (token) {
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
  }
}

export function clearAuthToken() {
  localStorage.removeItem(TOKEN_STORAGE_KEY);
}

export function hasAuthToken() {
  return Boolean(getStoredToken());
}

async function request(path, options = {}) {
  let response;

  try {
    const token = getStoredToken();

    response = await fetch(`${API_BASE_URL}${path}`, {
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {})
      },
      ...options
    });
  } catch (error) {
    throw new Error(
      "Cannot reach the backend API. Make sure the backend server is running and MongoDB is connected."
    );
  }

  if (response.status === 204) {
    return null;
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data.message || "Request failed.");
    error.status = response.status;
    throw error;
  }

  return data;
}

export function registerUser(payload) {
  return request("/auth/register", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function loginUser(payload) {
  return request("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function fetchCurrentUser() {
  return request("/auth/me");
}

export function fetchTasks() {
  return request("/tasks");
}

export function fetchBoard() {
  return request("/board");
}

export function fetchColumns() {
  return request("/columns");
}

export function createTask(task) {
  return request("/tasks", {
    method: "POST",
    body: JSON.stringify(task)
  });
}

export function updateTask(taskId, updates) {
  return request(`/tasks/${taskId}`, {
    method: "PATCH",
    body: JSON.stringify(updates)
  });
}

export function moveTask(taskId, payload) {
  return request(`/tasks/${taskId}/move`, {
    method: "PATCH",
    body: JSON.stringify(payload)
  });
}

export function deleteTask(taskId) {
  return request(`/tasks/${taskId}`, {
    method: "DELETE"
  });
}

export function createColumn(column) {
  return request("/columns", {
    method: "POST",
    body: JSON.stringify(column)
  });
}

export function updateColumn(columnId, updates) {
  return request(`/columns/${columnId}`, {
    method: "PATCH",
    body: JSON.stringify(updates)
  });
}

export function deleteColumn(columnId) {
  return request(`/columns/${columnId}`, {
    method: "DELETE"
  });
}

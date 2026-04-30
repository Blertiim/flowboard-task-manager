const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

async function request(path, options = {}) {
  let response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      headers: {
        "Content-Type": "application/json",
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
    throw new Error(data.message || "Request failed.");
  }

  return data;
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

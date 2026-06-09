const STORAGE_KEY = "todo-app-tasks";
const MAX_TASK_LENGTH = 200;

const taskForm = document.getElementById("task-form");
const taskInput = document.getElementById("task-input");
const taskList = document.getElementById("task-list");
const emptyState = document.getElementById("empty-state");
const validationMessage = document.getElementById("validation-message");

let tasks = [];
let nextTaskId = 1;
let messageTimeout = null;

/**
 * Normalize a raw task object from localStorage into a safe shape.
 * Returns null for invalid entries.
 */
function normalizeTask(raw, fallbackId) {
  if (!raw || typeof raw !== "object") {
    return null;
  }

  const text = typeof raw.text === "string" ? raw.text.trim() : "";
  if (!text) {
    return null;
  }

  let id = raw.id;
  if (typeof id === "string" && id.trim() !== "") {
    id = Number(id);
  }
  if (!Number.isFinite(id) || id <= 0) {
    id = fallbackId;
  }

  return {
    id: Math.floor(id),
    text: text.slice(0, MAX_TASK_LENGTH),
    completed: Boolean(raw.completed),
  };
}

/**
 * Sanitize an array of tasks, remove duplicates, and assign unique IDs.
 */
function sanitizeTasks(rawTasks) {
  if (!Array.isArray(rawTasks)) {
    return [];
  }

  const seenIds = new Set();
  const sanitized = [];

  rawTasks.forEach((raw, index) => {
    const task = normalizeTask(raw, index + 1);
    if (!task) {
      return;
    }

    while (seenIds.has(task.id)) {
      task.id += 1;
    }

    seenIds.add(task.id);
    sanitized.push(task);
  });

  return sanitized;
}

/**
 * Load tasks from localStorage and return a sanitized array.
 */
function loadTasks() {
  const stored = localStorage.getItem(STORAGE_KEY);

  if (!stored) {
    return [];
  }

  try {
    return sanitizeTasks(JSON.parse(stored));
  } catch {
    return [];
  }
}

/**
 * Save the current tasks array to localStorage.
 * Returns true on success and false when storage is unavailable.
 */
function saveTasks() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    return true;
  } catch (error) {
    showMessage(
      "Unable to save tasks. Your browser may be out of storage space or blocking local data.",
      "error"
    );
    console.error("Failed to save tasks:", error);
    return false;
  }
}

/**
 * Generate a unique numeric ID for a new task.
 */
function generateId() {
  const id = nextTaskId;
  nextTaskId += 1;
  return id;
}

/**
 * Keep the next ID above any task already in memory.
 */
function syncNextTaskId() {
  if (tasks.length === 0) {
    nextTaskId = 1;
    return;
  }

  nextTaskId = Math.max(...tasks.map((task) => task.id)) + 1;
}

/**
 * Compare task IDs safely even if one side was coerced to a string.
 */
function isSameTaskId(left, right) {
  return Number(left) === Number(right);
}

/**
 * Show a temporary message to the user.
 */
function showMessage(message, type = "validation") {
  validationMessage.textContent = message;
  validationMessage.hidden = false;
  validationMessage.dataset.type = type;

  if (type === "validation") {
    taskInput.setAttribute("aria-invalid", "true");
  }

  if (messageTimeout) {
    clearTimeout(messageTimeout);
  }

  messageTimeout = setTimeout(() => {
    hideMessage();
  }, 3000);
}

/**
 * Hide the status message and clear validation state on the input.
 */
function hideMessage() {
  validationMessage.textContent = "";
  validationMessage.hidden = true;
  validationMessage.dataset.type = "validation";
  taskInput.removeAttribute("aria-invalid");
}

/**
 * Backward-compatible helper for input validation feedback.
 */
function showValidationMessage(message) {
  showMessage(message, "validation");
}

/**
 * Update empty-state visibility and task list accessibility hints.
 */
function updateEmptyState() {
  const isEmpty = tasks.length === 0;
  emptyState.hidden = !isEmpty;
  taskList.hidden = isEmpty;
}

/**
 * Render all tasks to the DOM.
 * Optionally restore keyboard focus after destructive re-renders.
 */
function renderTasks(focusOptions = null) {
  taskList.innerHTML = "";
  updateEmptyState();

  if (tasks.length === 0) {
    if (focusOptions && focusOptions.focusTarget === "input") {
      taskInput.focus();
    }
    return;
  }

  tasks.forEach((task) => {
    const listItem = document.createElement("li");
    listItem.className = "task-item" + (task.completed ? " completed" : "");
    listItem.dataset.id = String(task.id);

    const taskLabel = document.createElement("label");
    taskLabel.className = "task-label";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "task-checkbox";
    checkbox.checked = task.completed;
    checkbox.setAttribute(
      "aria-label",
      `${task.completed ? "Mark as incomplete" : "Mark as complete"}: ${task.text}`
    );

    const taskText = document.createElement("span");
    taskText.className = "task-text";
    taskText.textContent = task.text;

    taskLabel.appendChild(checkbox);
    taskLabel.appendChild(taskText);

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "delete-btn";
    deleteButton.textContent = "Delete";
    deleteButton.setAttribute("aria-label", `Delete task: ${task.text}`);

    listItem.appendChild(taskLabel);
    listItem.appendChild(deleteButton);
    taskList.appendChild(listItem);
  });

  if (focusOptions) {
    restoreFocus(focusOptions);
  }
}

/**
 * Restore keyboard focus after re-rendering the task list.
 */
function restoreFocus({ focusId, focusTarget }) {
  if (focusTarget === "input") {
    taskInput.focus();
    return;
  }

  if (focusId == null) {
    return;
  }

  const listItem = taskList.querySelector(`[data-id="${String(focusId)}"]`);
  if (!listItem) {
    taskInput.focus();
    return;
  }

  const selector = focusTarget === "delete" ? ".delete-btn" : ".task-checkbox";
  const focusElement = listItem.querySelector(selector);
  if (focusElement) {
    focusElement.focus();
  }
}

/**
 * Read a task ID from an element inside a task row.
 */
function getTaskIdFromElement(element) {
  const listItem = element.closest(".task-item");
  if (!listItem) {
    return null;
  }

  return Number(listItem.dataset.id);
}

/**
 * Add a new task from the input field.
 */
function addTask(text) {
  hideMessage();

  const trimmedText = text.trim();

  if (!trimmedText) {
    showValidationMessage("Please enter a task.");
    taskInput.focus();
    return;
  }

  const newTask = {
    id: generateId(),
    text: trimmedText.slice(0, MAX_TASK_LENGTH),
    completed: false,
  };

  tasks.push(newTask);

  if (!saveTasks()) {
    tasks.pop();
    syncNextTaskId();
    return;
  }

  renderTasks();
  taskInput.value = "";
  taskInput.focus();
}

/**
 * Remove a task by its ID.
 */
function deleteTask(id) {
  const taskIndex = tasks.findIndex((task) => isSameTaskId(task.id, id));
  if (taskIndex === -1) {
    return;
  }

  tasks = tasks.filter((task) => !isSameTaskId(task.id, id));

  if (!saveTasks()) {
    tasks = loadTasks();
    syncNextTaskId();
    renderTasks({ focusTarget: "input" });
    return;
  }

  let focusOptions = { focusTarget: "input" };
  if (tasks.length > 0) {
    const nextIndex = Math.min(taskIndex, tasks.length - 1);
    focusOptions = {
      focusId: tasks[nextIndex].id,
      focusTarget: "delete",
    };
  }

  renderTasks(focusOptions);
}

/**
 * Toggle the completed status of a task.
 */
function toggleTask(id) {
  const taskExists = tasks.some((task) => isSameTaskId(task.id, id));
  if (!taskExists) {
    return;
  }

  tasks = tasks.map((task) => {
    if (isSameTaskId(task.id, id)) {
      return { ...task, completed: !task.completed };
    }
    return task;
  });

  if (!saveTasks()) {
    tasks = loadTasks();
    syncNextTaskId();
  }

  renderTasks({ focusId: id, focusTarget: "checkbox" });
}

// Use event delegation so listeners are not recreated on every render.
taskList.addEventListener("change", (event) => {
  if (!event.target.classList.contains("task-checkbox")) {
    return;
  }

  const taskId = getTaskIdFromElement(event.target);
  if (taskId != null) {
    toggleTask(taskId);
  }
});

taskList.addEventListener("click", (event) => {
  if (!event.target.classList.contains("delete-btn")) {
    return;
  }

  const taskId = getTaskIdFromElement(event.target);
  if (taskId != null) {
    deleteTask(taskId);
  }
});

taskForm.addEventListener("submit", (event) => {
  event.preventDefault();
  addTask(taskInput.value);
});

taskInput.addEventListener("input", () => {
  if (taskInput.getAttribute("aria-invalid") === "true") {
    hideMessage();
  }
});

// Initialize the app
tasks = loadTasks();
syncNextTaskId();
renderTasks();
taskInput.focus();

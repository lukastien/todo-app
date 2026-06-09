# Todo App

A simple, beginner-friendly Todo List web application built with plain HTML, CSS, and JavaScript. Add tasks, mark them complete, delete them, and keep everything saved in your browser — no setup required.

## Features

- **Add tasks** — Type a task and click "Add Task" or press Enter
- **Mark complete** — Check a task to strike it through; uncheck to restore it
- **Delete tasks** — Remove tasks with one click
- **Persistent storage** — Tasks are saved in `localStorage` and survive page refreshes
- **Input validation** — Empty or whitespace-only tasks are blocked with a helpful message
- **Empty state** — A friendly message appears when you have no tasks yet
- **Accessible** — Semantic HTML, labels, keyboard support, and screen reader announcements
- **Resilient storage** — Invalid saved data is cleaned up safely, and storage failures show a clear message

## Technologies Used

- HTML5
- CSS3
- Vanilla JavaScript (ES6+)
- localStorage API

No frameworks, no build tools, no npm packages.

## How To Run

1. Clone or download this repository
2. Open `index.html` in any modern web browser

That's it — no installation or server needed.

## Project Structure

```
todo-app/
├── index.html   # Page structure and markup
├── style.css    # Layout and visual styling
├── script.js    # Application logic and localStorage
└── README.md    # Project documentation
```

## Code Review Improvements

This project includes several robustness fixes from a senior code review:

- **localStorage sanitization** — Corrupted or malformed saved tasks are filtered out instead of breaking the app
- **Safe saves** — Storage quota and private browsing errors are caught and reported to the user
- **Focus management** — Keyboard focus is preserved after completing or deleting tasks
- **Clickable task labels** — Task text toggles completion, not just the checkbox
- **No empty-state flash** — The empty message stays hidden until JavaScript confirms there are no tasks
- **Accessible status messages** — Validation and storage errors use `aria-live`, `aria-invalid`, and `aria-describedby`
- **Mobile-friendly controls** — Larger tap targets and responsive layout on small screens

## Future Improvements

- Filter tasks (All / Active / Completed)
- Edit existing tasks inline
- Clear all completed tasks at once
- Drag-and-drop task reordering
- Dark mode toggle
- Due dates and priorities

## Screenshot

Add a screenshot of your running app here after opening `index.html` in a browser.

Suggested filename: `screenshot.png`

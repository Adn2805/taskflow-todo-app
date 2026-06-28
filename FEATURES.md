# TaskFlow Features & Functionality

A comprehensive list of all features, UI/UX details, and technical decisions in the TaskFlow todo application.

---

## Core Features

### Todo Management (Full CRUD)

| Operation | Description |
|-----------|-------------|
| **Create** | Add new tasks with title, optional description, priority level, and optional due date via a polished modal form |
| **Read** | View all tasks in a filterable, searchable list with stats dashboard; view individual task details on a dedicated page |
| **Update** | Edit tasks via modal. Toggle completion status with animated checkbox. All changes are logged |
| **Delete** | Remove tasks with smooth slide-out animation. Activity logs cascade-deleted automatically |

### Multi-Page Architecture

| Page | Route | Description |
|------|-------|-------------|
| **Todo List** | `/todos` | Main dashboard with stats, filters, search, and task list |
| **Todo Detail** | `/todos/:id` | Detailed view of a single task with activity log timeline |

- Uses **React Router v6** for page-based navigation (multi-page, NOT single-page app)
- Todo Detail page supports both URL params (`/todos/3`) and query params (`/todos?id=3`)
- Root path `/` redirects to `/todos`

### Filtering & Search

| Filter Type | Options | Description |
|-------------|---------|-------------|
| **Status** | All / Active / Completed | Filter tasks by completion status |
| **Priority** | All / High / Medium / Low | Filter tasks by priority level |
| **Search** | Free text | Live search across title and description (server-side) |

- All filters are combinable (e.g., high priority + pending + search term)
- Filter state updates trigger new API calls with query parameters
- Contextual empty state messages when no results match

### Stats Dashboard

Three glassmorphism stat cards displayed above the task list:

| Stat | Description |
|------|-------------|
| **Total Tasks** | Count of all tasks (accent color) |
| **Completed** | Count of completed tasks (green) |
| **Pending** | Count of pending tasks (amber) |

### Activity Logging

Every action on a todo is logged in the `activity_log` table:

| Action | Trigger |
|--------|---------|
| **Created** | When a new todo is created |
| **Completed** | When status changes to `completed` |
| **Reopened** | When status changes from `completed` back to `pending` |
| **Updated** | When title, description, priority, or due date changes |

Activity logs are displayed as a **color-coded timeline** on the Todo Detail page:
- Created: Blue dot
- Completed: Green dot
- Updated: Amber dot
- Reopened: Purple dot

---

## UI/UX Features

### Dark / Light Theme

- **Dark theme** by default (deep backgrounds #0a0a0f, #12121a)
- **Light theme** available — clean whites and light grays
- Toggle via sidebar button (sun/moon icon with rotation animation)
- Theme preference **persisted in localStorage** across sessions
- Smooth CSS transition on theme switch (background, text, borders)

### Glassmorphism Design

- **Sidebar**: Semi-transparent background with `backdrop-filter: blur(20px)`
- **Stat cards**: Frosted glass effect with subtle borders
- **Todo items**: Glass cards with hover lift effect
- **Modal**: Backdrop blur overlay with glass content card
- **Search input**: Glass-styled input with focus glow ring

### Micro-Animations

| Element | Animation |
|---------|-----------|
| **Todo item entrance** | Slide in from left (400ms ease-out) |
| **Todo item delete** | Slide out to right with fade (300ms ease-in) |
| **Custom checkbox** | Circle fills with animated checkmark stroke |
| **Card hover** | Subtle upward lift (`translateY(-1px)`) with border glow |
| **Modal entrance** | Overlay fades in + content slides up |
| **Theme toggle icon** | 15° rotation on hover |
| **Page transitions** | Fade in on route change |
| **Loading skeleton** | Pulsing opacity animation |
| **Stats card hover** | Accent border glow appears |

### Keyboard Shortcuts

| Shortcut | Action | Context |
|----------|--------|---------|
| `/` | Focus search bar | When no input is focused |
| `N` | Open new task modal | When no input is focused |
| `Escape` | Close modal | When modal is open |

- Shortcuts are **displayed in the sidebar** as visual hints using keyboard badge styling
- Shortcuts are disabled when user is typing in an input or textarea

### Responsive Design

| Breakpoint | Layout |
|-----------|--------|
| **Desktop** (>768px) | Fixed sidebar (260px) + scrollable main content |
| **Mobile** (≤768px) | Top navigation bar + full-width content |

- Stats cards stack to single column on very small screens
- Todo item actions always visible on mobile (no hover required)
- Modal becomes full-width on mobile
- Filter pills wrap to multiple lines

### Empty States

- Custom **SVG clipboard illustration** (inline, no external assets)
- Contextual message:
  - With active filters: "Try adjusting your filters or search query"
  - No todos at all: "Create your first task to get started"
- Call-to-action button to create a task

### Custom Checkbox

- SVG-based animated checkbox (not browser default)
- Circle outline → filled circle with checkmark animation
- Smooth stroke-dashoffset animation for the checkmark path
- Hover: circle stroke changes to accent color

---

## Technical Features

### Backend

| Feature | Detail |
|---------|--------|
| **Framework** | Express.js with ES modules |
| **Database** | SQLite via sql.js (pure JS/WASM, no native deps) |
| **API format** | Consistent `{ success, data, message }` response format |
| **Validation** | Title required, priority must be low/medium/high |
| **Error handling** | Try/catch on all routes, global error middleware |
| **CORS** | Enabled for all origins (development mode) |
| **Seed data** | 5 realistic sample todos auto-seeded on first run |
| **Foreign keys** | Enabled with `PRAGMA foreign_keys = ON` |
| **Cascade delete** | Activity logs auto-deleted when todo is deleted |

### Frontend

| Feature | Detail |
|---------|--------|
| **React 18** | Functional components with hooks only |
| **React Router v6** | BrowserRouter, Routes, Route, NavLink, useParams, useNavigate |
| **Vite** | Fast dev server with HMR, API proxy for `/api` |
| **CSS Design System** | ~900 lines with CSS Custom Properties for all tokens |
| **BEM naming** | Block__Element--Modifier CSS class convention |
| **Theme system** | `data-theme` attribute on `<html>`, CSS variable overrides |
| **Typography** | Inter font from Google Fonts (weights 300-700) |
| **Fetch API** | Modern fetch() with async/await for all API calls |

### Database Schema

**`todos` table:**

| Column | Type | Constraints |
|--------|------|-------------|
| id | INTEGER | PRIMARY KEY AUTOINCREMENT |
| title | TEXT | NOT NULL |
| description | TEXT | DEFAULT '' |
| priority | TEXT | DEFAULT 'medium', CHECK (low/medium/high) |
| status | TEXT | DEFAULT 'pending', CHECK (pending/completed) |
| due_date | TEXT | Nullable, YYYY-MM-DD format |
| created_at | DATETIME | DEFAULT CURRENT_TIMESTAMP |
| updated_at | DATETIME | DEFAULT CURRENT_TIMESTAMP |

**`activity_log` table:**

| Column | Type | Constraints |
|--------|------|-------------|
| id | INTEGER | PRIMARY KEY AUTOINCREMENT |
| todo_id | INTEGER | FOREIGN KEY → todos(id) ON DELETE CASCADE |
| action | TEXT | NOT NULL |
| timestamp | DATETIME | DEFAULT CURRENT_TIMESTAMP |

---

## Design Decisions

### 1. SQLite over MongoDB / PostgreSQL
Zero configuration, file-based database that's perfect for a self-contained demo application. No external database server required. The `sql.js` library provides a pure JavaScript/WebAssembly SQLite implementation that requires zero native build tools — it works on any system without C++ compilers or Visual Studio.

### 2. sql.js over better-sqlite3 / sqlite3
Pure JavaScript/WebAssembly implementation. Zero native dependencies means no need for C++ build tools (Visual Studio, Xcode, etc.). Works out of the box on any OS with Node.js installed. Data persists to a file on disk after every write operation.

### 3. Vanilla CSS over Tailwind / CSS-in-JS
Demonstrates fundamental CSS knowledge and architecture skills. CSS Custom Properties enable runtime theme switching without any JavaScript framework overhead. BEM naming provides a predictable, scalable class naming convention.

### 4. Multi-Page Architecture
Implemented as specified in the requirements using React Router v6. Each page (todo list, todo detail) has its own route and renders independently, demonstrating proper routing patterns while maintaining React's component-based architecture.

### 5. Activity Logging
Goes beyond basic CRUD to demonstrate relational data modeling capabilities. Every action creates an audit trail, showing understanding of data integrity and user experience patterns found in production applications.

### 6. Glassmorphism Design Language
Modern, premium aesthetic that demonstrates advanced CSS skills including `backdrop-filter`, gradients, custom properties, and composited visual effects. The design draws inspiration from premium productivity apps like Linear, Notion, and Things 3.

### 7. Vite over Create React App
Vite provides significantly faster development experience with native ES module support, instant HMR, and a modern build pipeline. CRA is deprecated and no longer recommended for new projects.

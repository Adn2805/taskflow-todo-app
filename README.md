# ✅ TaskFlow — Premium Todo Manager

> A full-stack todo application built with React 18, Express.js, and SQLite. Designed as a premium productivity tool with modern UI/UX patterns including glassmorphism design, micro-animations, and dark/light theme support.

## 🖼️ Preview

The application features a **dark theme** by default with a premium glassmorphism UI:
- **Sidebar navigation** with app branding, navigation links, keyboard shortcut hints, and theme toggle
- **Stats dashboard** showing total, completed, and pending task counts in frosted glass cards
- **Filter toolbar** with status/priority pill filters and live search
- **Todo cards** with animated checkboxes, priority badges, due dates, and hover-reveal actions
- **Detail page** with full task info, activity timeline, and quick action buttons

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18 or higher
- **npm** 9 or higher

### Installation & Setup

```bash
# 1. Clone the repository
git clone <your-repo-url>
cd todo-app

# 2. Start the backend
cd backend
npm install
npm start

# 3. In a NEW terminal, start the frontend
cd frontend
npm install
npm run dev
```

| Service  | URL                     |
|----------|-------------------------|
| Backend  | http://localhost:3001    |
| Frontend | http://localhost:5173    |

> **Note:** The SQLite database is auto-created on first backend startup with 5 sample todos pre-seeded.

## 🏗️ Architecture

### Tech Stack

| Layer     | Technology             | Rationale                                                              |
|-----------|------------------------|------------------------------------------------------------------------|
| Frontend  | React 18               | Component-based UI with hooks for state management                     |
| Routing   | React Router v6        | Multi-page architecture (not SPA) as required                          |
| Bundler   | Vite                   | Fastest HMR, modern ESBuild-powered build tool                        |
| Styling   | Vanilla CSS            | Full control via CSS Custom Properties, no framework overhead          |
| Backend   | Express.js             | Lightweight, battle-tested Node.js REST framework                      |
| Database | SQLite (sql.js)        | Zero-config, pure JS/WASM SQLite — no native build tools needed       |

### Folder Structure

```
todo-app/
├── backend/
│   ├── server.js            # Express server entry point, CORS, middleware
│   ├── db.js                # SQLite database setup, schema, seed data
│   ├── routes/
│   │   └── todos.js         # REST API routes (CRUD + filtering)
│   └── package.json
│
├── frontend/
│   ├── index.html           # Vite entry HTML with Inter font
│   ├── vite.config.js       # Vite config with API proxy
│   ├── src/
│   │   ├── main.jsx         # React entry point with BrowserRouter
│   │   ├── App.jsx          # Root component, theme state, routes
│   │   ├── index.css        # Complete CSS design system (~900 lines)
│   │   ├── components/
│   │   │   ├── Sidebar.jsx      # App nav, branding, theme toggle
│   │   │   ├── TodoItem.jsx     # Todo card with checkbox, actions
│   │   │   └── AddTodoModal.jsx # Create/edit modal with form
│   │   └── pages/
│   │       ├── TodoList.jsx     # Main dashboard page
│   │       └── TodoDetail.jsx   # Single todo detail page
│   └── package.json
│
├── README.md                # This file
├── API.md                   # API endpoint documentation
└── FEATURES.md              # Feature list and design decisions
```

## 🎨 Design Decisions

| Decision | Rationale |
|----------|-----------|
| **Dark theme default** | Preferred by developers, reduces eye strain, looks more premium |
| **Glassmorphism cards** | Modern, premium aesthetic using `backdrop-filter: blur()` without being distracting |
| **CSS Custom Properties** | Enables runtime theme switching without CSS-in-JS overhead; single source of truth for design tokens |
| **BEM naming** | Predictable, scalable, and self-documenting CSS class architecture |
| **Inter font** | Clean, modern typeface with excellent readability at all sizes |
| **Micro-animations** | Entrance/exit animations, hover effects, and transitions create a polished, premium feel |
| **Activity logging** | Demonstrates relational data modeling; provides audit trail for every task change |
| **sql.js** | Pure JavaScript/WASM SQLite implementation — zero native dependencies, works on any system |
| **Vite proxy** | Frontend proxies `/api` requests to backend, avoiding CORS issues and hardcoded URLs |

## ⌨️ Keyboard Shortcuts

| Shortcut  | Action                | Context                  |
|-----------|-----------------------|--------------------------|
| `/`       | Focus search bar      | When no input is focused |
| `N`       | Open new task modal   | When no input is focused |
| `Escape`  | Close modal           | When modal is open       |

## 🔧 Development Notes

- **Backend auto-reload**: Use `npm run dev` to start with `node --watch` for automatic restart on changes
- **Frontend HMR**: Vite provides instant hot module replacement during development
- **Database seeding**: The SQLite database auto-creates tables and seeds 5 sample todos on first run
- **API proxy**: Vite forwards all `/api/*` requests to `http://localhost:3001` during development

## 📋 API Documentation

See [API.md](./API.md) for complete endpoint documentation with request/response examples.

## ✨ Features

See [FEATURES.md](./FEATURES.md) for a comprehensive feature list and design decisions.

## 📝 License

MIT

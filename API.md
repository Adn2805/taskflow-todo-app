# TaskFlow API Documentation

Base URL: `http://localhost:3001/api`

## Response Format

All API responses follow a consistent format:

```json
{
  "success": true | false,
  "data": {} | [] | null,
  "message": "Human-readable message"
}
```

---

## Endpoints

### 1. Get All Todos

```
GET /api/todos
```

Retrieves all todos with optional filtering.

**Query Parameters:**

| Parameter  | Type   | Required | Description                                  |
|------------|--------|----------|----------------------------------------------|
| `search`   | string | No       | Search in title and description (case-insensitive) |
| `priority` | string | No       | Filter by priority: `low`, `medium`, `high`  |
| `status`   | string | No       | Filter by status: `pending`, `completed`     |

> Multiple query parameters can be combined for advanced filtering.

**Example Requests:**

```
GET /api/todos
GET /api/todos?status=pending
GET /api/todos?priority=high&status=pending
GET /api/todos?search=design
```

**Success Response (200 OK):**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "Design system architecture",
      "description": "Plan and document the microservices architecture for the new platform",
      "priority": "high",
      "status": "pending",
      "due_date": "2026-07-01",
      "created_at": "2026-06-28 12:00:00",
      "updated_at": "2026-06-28 12:00:00",
      "activity_log": [
        {
          "id": 1,
          "action": "Created",
          "timestamp": "2026-06-28 12:00:00"
        }
      ]
    }
  ],
  "message": "Todos retrieved successfully"
}
```

---

### 2. Get Single Todo

```
GET /api/todos/:id
```

Retrieves a single todo by its ID, including its activity log.

**URL Parameters:**

| Parameter | Type    | Required | Description       |
|-----------|---------|----------|-------------------|
| `id`      | integer | Yes      | The todo's ID     |

**Example Request:**

```
GET /api/todos/1
```

**Success Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "Design system architecture",
    "description": "Plan and document the microservices architecture for the new platform",
    "priority": "high",
    "status": "pending",
    "due_date": "2026-07-01",
    "created_at": "2026-06-28 12:00:00",
    "updated_at": "2026-06-28 12:00:00",
    "activity_log": [
      {
        "id": 1,
        "action": "Created",
        "timestamp": "2026-06-28 12:00:00"
      }
    ]
  },
  "message": "Todo retrieved successfully"
}
```

**Error Response (404 Not Found):**

```json
{
  "success": false,
  "data": null,
  "message": "Todo not found"
}
```

---

### 3. Create Todo

```
POST /api/todos
```

Creates a new todo item.

**Request Headers:**

```
Content-Type: application/json
```

**Request Body:**

| Field         | Type   | Required | Default    | Description                           |
|---------------|--------|----------|------------|---------------------------------------|
| `title`       | string | **Yes**  | —          | Task title (must be non-empty)        |
| `description` | string | No       | `""`       | Task description                      |
| `priority`    | string | No       | `"medium"` | Priority: `low`, `medium`, or `high`  |
| `due_date`    | string | No       | `null`     | Due date in `YYYY-MM-DD` format       |

**Example Request:**

```json
{
  "title": "Implement user authentication",
  "description": "Add JWT-based authentication with refresh tokens",
  "priority": "high",
  "due_date": "2026-07-15"
}
```

**Success Response (201 Created):**

```json
{
  "success": true,
  "data": {
    "id": 6,
    "title": "Implement user authentication",
    "description": "Add JWT-based authentication with refresh tokens",
    "priority": "high",
    "status": "pending",
    "due_date": "2026-07-15",
    "created_at": "2026-06-28 14:30:00",
    "updated_at": "2026-06-28 14:30:00",
    "activity_log": [
      {
        "id": 10,
        "action": "Created",
        "timestamp": "2026-06-28 14:30:00"
      }
    ]
  },
  "message": "Todo created successfully"
}
```

**Error Response (400 Bad Request):**

```json
{
  "success": false,
  "data": null,
  "message": "Title is required and cannot be empty"
}
```

---

### 4. Update Todo

```
PUT /api/todos/:id
```

Updates an existing todo. Only include fields you want to change.

**URL Parameters:**

| Parameter | Type    | Required | Description       |
|-----------|---------|----------|-------------------|
| `id`      | integer | Yes      | The todo's ID     |

**Request Headers:**

```
Content-Type: application/json
```

**Request Body (all fields optional):**

| Field         | Type   | Description                             |
|---------------|--------|-----------------------------------------|
| `title`       | string | New title                               |
| `description` | string | New description                         |
| `priority`    | string | New priority: `low`, `medium`, `high`   |
| `status`      | string | New status: `pending`, `completed`      |
| `due_date`    | string | New due date (`YYYY-MM-DD`) or `null`   |

**Example Request (Mark as completed):**

```json
{
  "status": "completed"
}
```

**Example Request (Update multiple fields):**

```json
{
  "title": "Updated task title",
  "priority": "high",
  "due_date": "2026-08-01"
}
```

**Success Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "Updated task title",
    "description": "...",
    "priority": "high",
    "status": "pending",
    "due_date": "2026-08-01",
    "created_at": "2026-06-28 12:00:00",
    "updated_at": "2026-06-28 15:00:00",
    "activity_log": [
      {
        "id": 1,
        "action": "Created",
        "timestamp": "2026-06-28 12:00:00"
      },
      {
        "id": 11,
        "action": "Updated",
        "timestamp": "2026-06-28 15:00:00"
      }
    ]
  },
  "message": "Todo updated successfully"
}
```

**Activity Log Behavior:**

| Status Change | Activity Log Entry |
|--------------|-------------------|
| Any → `completed` | `"Completed"` |
| `completed` → `pending` | `"Reopened"` |
| Other field changes | `"Updated"` |

**Error Response (404 Not Found):**

```json
{
  "success": false,
  "data": null,
  "message": "Todo not found"
}
```

---

### 5. Delete Todo

```
DELETE /api/todos/:id
```

Permanently deletes a todo and all its activity log entries (via CASCADE).

**URL Parameters:**

| Parameter | Type    | Required | Description       |
|-----------|---------|----------|-------------------|
| `id`      | integer | Yes      | The todo's ID     |

**Example Request:**

```
DELETE /api/todos/1
```

**Success Response (200 OK):**

```json
{
  "success": true,
  "data": null,
  "message": "Todo deleted successfully"
}
```

**Error Response (404 Not Found):**

```json
{
  "success": false,
  "data": null,
  "message": "Todo not found"
}
```

---

## Error Responses

All error responses follow the same format:

### 400 Bad Request

Returned when request validation fails (e.g., missing required fields, invalid priority value).

```json
{
  "success": false,
  "data": null,
  "message": "Title is required and cannot be empty"
}
```

### 404 Not Found

Returned when the requested todo ID does not exist, or when accessing an unknown API route.

```json
{
  "success": false,
  "data": null,
  "message": "Todo not found"
}
```

### 500 Internal Server Error

Returned when an unexpected server error occurs.

```json
{
  "success": false,
  "data": null,
  "message": "Internal server error"
}
```

---

## Database Schema

### `todos` Table

| Column       | Type     | Constraints                           |
|-------------|----------|---------------------------------------|
| `id`        | INTEGER  | PRIMARY KEY AUTOINCREMENT             |
| `title`     | TEXT     | NOT NULL                              |
| `description` | TEXT   | DEFAULT ''                            |
| `priority`  | TEXT     | DEFAULT 'medium', CHECK (low/medium/high) |
| `status`    | TEXT     | DEFAULT 'pending', CHECK (pending/completed) |
| `due_date`  | TEXT     | Nullable, format: YYYY-MM-DD          |
| `created_at`| DATETIME | DEFAULT CURRENT_TIMESTAMP             |
| `updated_at`| DATETIME | DEFAULT CURRENT_TIMESTAMP             |

### `activity_log` Table

| Column      | Type     | Constraints                            |
|------------|----------|----------------------------------------|
| `id`       | INTEGER  | PRIMARY KEY AUTOINCREMENT              |
| `todo_id`  | INTEGER  | FOREIGN KEY → todos(id) ON DELETE CASCADE |
| `action`   | TEXT     | NOT NULL (Created/Updated/Completed/Reopened) |
| `timestamp`| DATETIME | DEFAULT CURRENT_TIMESTAMP              |

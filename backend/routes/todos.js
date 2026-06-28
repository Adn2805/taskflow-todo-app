import { Router } from 'express';
import { queryAll, queryOne, runSql, getDb } from '../db.js';

const router = Router();

const VALID_PRIORITIES = ['low', 'medium', 'high'];
const VALID_STATUSES = ['pending', 'completed'];

router.get('/activity', async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 35;
    
    // Use queryAll from our db module
    const rows = await queryAll(`
      SELECT DATE(timestamp) as date, COUNT(*) as count
      FROM activity_log
      WHERE timestamp >= DATE('now', '-' || ? || ' days')
      GROUP BY DATE(timestamp)
      ORDER BY date ASC
    `, [days]);
    
    const result = [];
    for(let i = days-1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const found = rows.find(r => r.date === dateStr);
      result.push({ date: dateStr, count: found ? Number(found.count) : 0 });
    }
    res.json({ success: true, data: result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, data: null });
  }
});

/**
 * GET /
 * List all todos with optional search, priority, and status filters.
 */
router.get('/', async (req, res) => {
  try {
    const { search, priority, status } = req.query;

    let query = 'SELECT * FROM todos WHERE 1=1';
    const params = [];

    if (search) {
      query += ' AND (title LIKE ? OR description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    if (priority) {
      if (!VALID_PRIORITIES.includes(priority)) {
        return res.status(400).json({
          success: false,
          data: null,
          message: `Invalid priority filter. Must be one of: ${VALID_PRIORITIES.join(', ')}`,
        });
      }
      query += ' AND priority = ?';
      params.push(priority);
    }

    if (status) {
      if (!VALID_STATUSES.includes(status)) {
        return res.status(400).json({
          success: false,
          data: null,
          message: `Invalid status filter. Must be one of: ${VALID_STATUSES.join(', ')}`,
        });
      }
      query += ' AND status = ?';
      params.push(status);
    }

    query += ' ORDER BY created_at DESC';

    const todos = await queryAll(query, params);

    const todosWithLog = [];
    for (const todo of todos) {
      const activityLog = await queryAll(
        'SELECT * FROM activity_log WHERE todo_id = ? ORDER BY timestamp DESC',
        [todo.id]
      );
      todosWithLog.push({ ...todo, activity_log: activityLog });
    }

    return res.json({
      success: true,
      data: todosWithLog,
      message: 'Todos retrieved successfully',
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      data: null,
      message: 'Failed to retrieve todos',
    });
  }
});

/**
 * GET /:id
 * Retrieve a single todo by ID, including its activity log.
 */
router.get('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'Invalid todo ID',
      });
    }

    const todo = await queryOne('SELECT * FROM todos WHERE id = ?', [id]);

    if (!todo) {
      return res.status(404).json({
        success: false,
        data: null,
        message: 'Todo not found',
      });
    }

    const activityLog = await queryAll(
      'SELECT * FROM activity_log WHERE todo_id = ? ORDER BY timestamp DESC',
      [id]
    );

    return res.json({
      success: true,
      data: { ...todo, activity_log: activityLog },
      message: 'Todo retrieved successfully',
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      data: null,
      message: 'Failed to retrieve todo',
    });
  }
});

/**
 * POST /
 * Create a new todo. Title is required; description, priority, and due_date are optional.
 */
router.post('/', async (req, res) => {
  try {
    const { title, description, priority, due_date } = req.body;

    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'Title is required and must be a non-empty string',
      });
    }

    if (priority && !VALID_PRIORITIES.includes(priority)) {
      return res.status(400).json({
        success: false,
        data: null,
        message: `Invalid priority. Must be one of: ${VALID_PRIORITIES.join(', ')}`,
      });
    }

    const now = new Date().toISOString();

    const insertResult = await runSql(
      `INSERT INTO todos (title, description, priority, due_date, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [title.trim(), description ?? '', priority ?? 'medium', due_date ?? null, now, now]
    );

    const newTodoId = Number(insertResult.lastInsertRowid);

    await runSql(
      'INSERT INTO activity_log (todo_id, action, timestamp) VALUES (?, ?, ?)',
      [newTodoId, 'Created', now]
    );

    const createdTodo = await queryOne('SELECT * FROM todos WHERE id = ?', [newTodoId]);
    const activityLog = await queryAll(
      'SELECT * FROM activity_log WHERE todo_id = ? ORDER BY timestamp DESC',
      [newTodoId]
    );

    return res.status(201).json({
      success: true,
      data: { ...createdTodo, activity_log: activityLog },
      message: 'Todo created successfully',
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      data: null,
      message: 'Failed to create todo',
    });
  }
});

/**
 * PUT /:id
 * Update an existing todo. Tracks status transitions in the activity log.
 */
router.put('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'Invalid todo ID',
      });
    }

    const existing = await queryOne('SELECT * FROM todos WHERE id = ?', [id]);

    if (!existing) {
      return res.status(404).json({
        success: false,
        data: null,
        message: 'Todo not found',
      });
    }

    const { title, description, priority, status, due_date } = req.body;

    if (title !== undefined && (typeof title !== 'string' || title.trim().length === 0)) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'Title must be a non-empty string',
      });
    }

    if (priority !== undefined && !VALID_PRIORITIES.includes(priority)) {
      return res.status(400).json({
        success: false,
        data: null,
        message: `Invalid priority. Must be one of: ${VALID_PRIORITIES.join(', ')}`,
      });
    }

    if (status !== undefined && !VALID_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        data: null,
        message: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}`,
      });
    }

    const now = new Date().toISOString();

    const updatedTitle = title !== undefined ? title.trim() : existing.title;
    const updatedDescription = description !== undefined ? description : existing.description;
    const updatedPriority = priority !== undefined ? priority : existing.priority;
    const updatedStatus = status !== undefined ? status : existing.status;
    const updatedDueDate = due_date !== undefined ? due_date : existing.due_date;

    await runSql(
      `UPDATE todos
       SET title = ?, description = ?, priority = ?, status = ?, due_date = ?, updated_at = ?
       WHERE id = ?`,
      [updatedTitle, updatedDescription, updatedPriority, updatedStatus, updatedDueDate, now, id]
    );

    // Log status changes
    if (status !== undefined && status !== existing.status) {
      if (status === 'completed') {
        await runSql(
          'INSERT INTO activity_log (todo_id, action, timestamp) VALUES (?, ?, ?)',
          [id, 'Completed', now]
        );
      } else if (status === 'pending' && existing.status === 'completed') {
        await runSql(
          'INSERT INTO activity_log (todo_id, action, timestamp) VALUES (?, ?, ?)',
          [id, 'Reopened', now]
        );
      }
    }

    // Log non-status field changes
    const changedFields = [];
    if (title !== undefined && title.trim() !== existing.title) changedFields.push('title');
    if (description !== undefined && description !== existing.description) changedFields.push('description');
    if (priority !== undefined && priority !== existing.priority) changedFields.push('priority');
    if (due_date !== undefined && due_date !== existing.due_date) changedFields.push('due_date');

    if (changedFields.length > 0) {
      const detail = `Updated ${changedFields.join(', ')}`;
      await runSql(
        'INSERT INTO activity_log (todo_id, action, timestamp) VALUES (?, ?, ?)',
        [id, detail, now]
      );
    }

    const updatedTodo = await queryOne('SELECT * FROM todos WHERE id = ?', [id]);
    const activityLog = await queryAll(
      'SELECT * FROM activity_log WHERE todo_id = ? ORDER BY timestamp DESC',
      [id]
    );

    return res.json({
      success: true,
      data: { ...updatedTodo, activity_log: activityLog },
      message: 'Todo updated successfully',
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      data: null,
      message: 'Failed to update todo',
    });
  }
});

/**
 * DELETE /:id
 * Remove a todo by ID. Activity log entries are cascade-deleted.
 */
router.delete('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'Invalid todo ID',
      });
    }

    const existing = await queryOne('SELECT * FROM todos WHERE id = ?', [id]);

    if (!existing) {
      return res.status(404).json({
        success: false,
        data: null,
        message: 'Todo not found',
      });
    }
    
    const now = new Date().toISOString();
    await runSql(
      'INSERT INTO activity_log (todo_id, action, timestamp) VALUES (?, ?, ?)',
      [id, 'Deleted', now]
    );

    await runSql('DELETE FROM todos WHERE id = ?', [id]);

    return res.json({
      success: true,
      data: null,
      message: 'Todo deleted successfully',
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      data: null,
      message: 'Failed to delete todo',
    });
  }
});

export default router;

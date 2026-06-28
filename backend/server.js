import express from 'express';
import cors from 'cors';
import { initDb } from './db.js';
import todosRouter from './routes/todos.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/todos', todosRouter);

// Catch-all 404 for unknown routes
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    data: null,
    message: 'Route not found',
  });
});

// Global error handler
app.use((err, _req, res, _next) => {
  res.status(500).json({
    success: false,
    data: null,
    message: 'Internal server error',
  });
});

// Initialize database then start server
async function start() {
  await initDb();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

start();

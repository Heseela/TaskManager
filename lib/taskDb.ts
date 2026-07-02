import sql from 'mssql';
import { getDb } from './db';

export async function getAllTasks() {
  const pool = await getDb();

  const result = await pool.request().query(`
    SELECT *
    FROM AssignTask
    ORDER BY createdAt DESC
  `);

  return result.recordset;
}

export async function getTasksBySupervisor(userId: number) {
  const pool = await getDb();

  const result = await pool
    .request()
    .input('userId', sql.Int, userId)
    .query(`
      SELECT *
      FROM AssignTask
      WHERE assignedBy = @userId
      ORDER BY createdAt DESC
    `);

  return result.recordset;
}

export async function getTasksByEmployee(userId: number) {
  const pool = await getDb();

  const result = await pool
    .request()
    .input('userId', sql.Int, userId)
    .query(`
      SELECT *
      FROM AssignTask
      WHERE assignedTo = @userId
      ORDER BY createdAt DESC
    `);

  return result.recordset;
}

export async function getTaskById(id: number) {
  const pool = await getDb();

  const result = await pool
    .request()
    .input('id', sql.Int, id)
    .query(`
      SELECT *
      FROM AssignTask
      WHERE id = @id
    `);

  return result.recordset[0];
}

export async function createTask(task: {
  title: string;
  description: string;
  assignedBy: number;
  assignedTo: number;
  assignedByName: string;
  assignedToName: string;
  status: string;
  priority: string;
  dueDate: string | null;
  category?: string | null;
}) {
  const pool = await getDb();

  const result = await pool
    .request()
    .input('title', sql.VarChar, task.title)
    .input('description', sql.VarChar, task.description || '')
    .input('assignedBy', sql.Int, task.assignedBy)
    .input('assignedTo', sql.Int, task.assignedTo)
    .input('assignedByName', sql.VarChar, task.assignedByName)
    .input('assignedToName', sql.VarChar, task.assignedToName)
    .input('status', sql.VarChar, task.status)
    .input('priority', sql.VarChar, task.priority)
    .input('dueDate', sql.Date, task.dueDate || null)
    .input('category', sql.VarChar, task.category || null)
    .query(`
      INSERT INTO AssignTask
      (
        title,
        description,
        assignedBy,
        assignedTo,
        assignedByName,
        assignedToName,
        status,
        priority,
        dueDate,
        category,
        createdAt,
        updatedAt
      )
      OUTPUT INSERTED.*
      VALUES
      (
        @title,
        @description,
        @assignedBy,
        @assignedTo,
        @assignedByName,
        @assignedToName,
        @status,
        @priority,
        @dueDate,
        @category,
        GETDATE(),
        GETDATE()
      )
    `);

  return result.recordset[0];
}

export async function updateTask(
  taskId: number,
  status: string
) {
  const pool = await getDb();

  const result = await pool
    .request()
    .input('id', sql.Int, taskId)
    .input('status', sql.VarChar, status)
    .query(`
      UPDATE AssignTask
      SET
        status = @status,
        updatedAt = GETDATE()
      OUTPUT INSERTED.*
      WHERE id = @id
    `);

  return result.recordset[0];
}
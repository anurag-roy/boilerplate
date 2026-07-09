import { todosTable } from '@server/db/schema';
import { createInsertSchema } from 'drizzle-orm/zod';

export const insertTodoSchema = createInsertSchema(todosTable);

export const updateTodoSchema = insertTodoSchema.pick({ title: true, completed: true }).partial();

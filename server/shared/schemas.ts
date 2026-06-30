import { todosTable } from '@server/db/schema';
import { createInsertSchema } from 'drizzle-orm/zod';

export const insertTodoSchema = createInsertSchema(todosTable);

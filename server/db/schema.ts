import { text, integer, snakeCase } from 'drizzle-orm/sqlite-core';

export const todosTable = snakeCase.table('todos', {
  id: integer().primaryKey(),
  title: text().notNull(),
  completed: integer({ mode: 'boolean' }).notNull().default(false),
});

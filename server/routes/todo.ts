import { db } from '@server/db';
import { todosTable } from '@server/db/schema';
import { logger } from '@server/lib/logger';
import { routeValidator } from '@server/lib/middlewares/validator';
import { insertTodoSchema, updateTodoSchema } from '@server/shared/schemas';
import { eq } from 'drizzle-orm';
import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';

function parseTodoId(id: string): number {
  const todoId = Number.parseInt(id, 10);
  if (Number.isNaN(todoId)) {
    throw new HTTPException(400, { message: 'Invalid todo id' });
  }
  return todoId;
}

export const todoRoute = new Hono()
  .get('/', async (c) => {
    try {
      const todos = await db.select().from(todosTable);
      return c.json(todos);
    } catch (error) {
      logger.error('Error fetching todos:', error);
      throw new HTTPException(500, {
        message: 'Failed to fetch todos',
        cause: error,
      });
    }
  })
  .post('/', routeValidator('json', insertTodoSchema), async (c) => {
    try {
      const { title } = c.req.valid('json');
      const [todo] = await db.insert(todosTable).values({ title }).returning();
      return c.json(todo);
    } catch (error) {
      logger.error('Error creating todo:', error);
      throw new HTTPException(500, {
        message: 'Failed to create todo',
        cause: error,
      });
    }
  })
  .patch('/:id', routeValidator('json', updateTodoSchema), async (c) => {
    try {
      const todoId = parseTodoId(c.req.param('id'));
      const updates = c.req.valid('json');
      const [todo] = await db.update(todosTable).set(updates).where(eq(todosTable.id, todoId)).returning();

      if (!todo) {
        throw new HTTPException(404, { message: 'Todo not found' });
      }

      return c.json(todo);
    } catch (error) {
      if (error instanceof HTTPException) {
        throw error;
      }
      logger.error('Error updating todo:', error);
      throw new HTTPException(500, {
        message: 'Failed to update todo',
        cause: error,
      });
    }
  })
  .delete('/:id', async (c) => {
    try {
      const todoId = parseTodoId(c.req.param('id'));
      const [todo] = await db.delete(todosTable).where(eq(todosTable.id, todoId)).returning();

      if (!todo) {
        throw new HTTPException(404, { message: 'Todo not found' });
      }

      return c.json(todo);
    } catch (error) {
      if (error instanceof HTTPException) {
        throw error;
      }
      logger.error('Error deleting todo:', error);
      throw new HTTPException(500, {
        message: 'Failed to delete todo',
        cause: error,
      });
    }
  });

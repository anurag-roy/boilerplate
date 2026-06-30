import { db } from '@server/db';
import { todosTable } from '@server/db/schema';
import { logger } from '@server/lib/logger';
import { routeValidator } from '@server/lib/middlewares/validator';
import { insertTodoSchema } from '@server/shared/schemas';
import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';

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
  });

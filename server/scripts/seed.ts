import type { NewTodo } from '@server/shared/types';
import { closeDb, db } from '@server/db';
import { todosTable } from '@server/db/schema';
import { logger } from '@server/lib/logger';

const seedData: NewTodo[] = [
  {
    title: 'Buy groceries',
  },
];

logger.info('Seeding database with data...');
await db.insert(todosTable).values(seedData);
logger.info('Database seeded with data...');

closeDb();

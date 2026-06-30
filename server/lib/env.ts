import { logger } from '@server/lib/logger';
import { z } from 'zod';

const envSchema = z.object({
  PORT: z.coerce.number(),
  DATABASE_URL: z.string(),
});

const { data, error } = envSchema.safeParse(process.env);

if (error) {
  logger.error(
    'Missing or invalid environment variables:',
    error.issues.map((issue) => issue.path.join('.')).join(', ')
  );
  process.exit(1);
}

export const env = data;

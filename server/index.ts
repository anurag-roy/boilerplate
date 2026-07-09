import app from '@server/app';
import { env } from '@server/lib/env';
import { logger } from '@server/lib/logger';

const server = Bun.serve({
  fetch: app.fetch,
  port: env.PORT,
});

logger.info(`Server starting on http://localhost:${server.port}`);

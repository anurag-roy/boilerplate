import { serve } from '@hono/node-server';
import app from '@server/app';
import { env } from '@server/lib/env';
import { logger } from '@server/lib/logger';

serve(
  {
    fetch: app.fetch,
    port: env.PORT,
  },
  (info) => {
    const protocol = info.family === 'IPv4' ? 'http' : 'https';
    const address = info.address === '0.0.0.0' ? 'localhost' : info.address;
    logger.info(`Server started on ${protocol}://${address}:${info.port}`);
  }
);

import type { ApiRoutes } from '@server/app';
import { hc } from 'hono/client';
import ky, { isHTTPError } from 'ky';
import { z } from 'zod';

class ApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'API Error';
  }
}

const apiErrorBodySchema = z.object({
  message: z.string(),
});

const kyInstance = ky.create({
  retry: { limit: 0 },
  timeout: 300_000,
  hooks: {
    beforeError: [
      ({ error }) => {
        if (isHTTPError(error)) {
          const parsed = apiErrorBodySchema.safeParse(error.data);
          if (parsed.success) {
            return new ApiError(parsed.data.message);
          }
        }

        return error;
      },
    ],
  },
});

const client = hc<ApiRoutes>('/', {
  fetch: kyInstance,
});

export const api = client.api;

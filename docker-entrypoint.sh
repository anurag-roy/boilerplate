#!/bin/sh
set -e

bunx drizzle-kit push --force
exec bun server/index.ts

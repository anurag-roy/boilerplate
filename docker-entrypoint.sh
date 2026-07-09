#!/bin/sh
set -e

./node_modules/.bin/drizzle-kit push --force
exec ./node_modules/.bin/tsx server/index.ts

#!/bin/sh
set -e
echo "Running database migration..."
node ./node_modules/prisma/build/index.js db push --skip-generate
echo "Starting Next.js..."
exec node ./node_modules/next/dist/bin/next start
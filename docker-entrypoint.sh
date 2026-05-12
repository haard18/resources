#!/bin/sh
set -e
echo "Running database migration..."
node ./node_modules/prisma/build/index.js db push
echo "Starting Next.js..."
exec npm start
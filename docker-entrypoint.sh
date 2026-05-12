#!/bin/sh
set -e
echo "Running database migration..."
npx prisma db push
echo "Starting Next.js..."
exec npm start
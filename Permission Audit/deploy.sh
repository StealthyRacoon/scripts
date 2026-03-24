#!/bin/bash

set -e  # stop on error

echo "📥 Pulling latest code..."
git checkout main
git pull origin main

echo "📦 Installing client deps..."
cd client
npm install

echo "🏗 Building React app..."
npm run build

echo "🚀 Ensuring server is running..."
cd ../server

# Start app if not running, otherwise do nothing
pm2 restart app || pm2 start app.js --name app

echo "✅ Deployment complete"
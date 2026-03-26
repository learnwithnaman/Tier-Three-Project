#!/bin/bash
echo "📦 Installing Backend Dependencies..."
cd backend
npm install
echo "📦 Installing Frontend Dependencies..."
cd ../frontend
npm install --legacy-peer-deps
echo ""
echo "✅ Installation Complete!"
echo ""
echo "To start the application:"
echo "1. Make sure MongoDB is running: mongod"
echo "2. Start backend: cd backend && npm run dev"
echo "3. Start frontend: cd frontend && npm start"
echo "4. Open http://localhost:3000"
echo "5. Click 'Load Products' on the homepage"

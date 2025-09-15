#!/bin/bash
echo "🚀 Starting load generator for DevOps Dashboard..."

while true; do
  # Basic API calls
  curl -s http://localhost:3001/ > /dev/null
  curl -s http://localhost:3001/health > /dev/null
  
  # User operations
  curl -s http://localhost:3001/api/users > /dev/null
  
  # POST request (create user)
  curl -s -X POST -H "Content-Type: application/json" \
       -d '{"name":"TestUser'$RANDOM'","email":"test'$RANDOM'@example.com"}' \
       http://localhost:3001/api/users > /dev/null
  
  # Slow operation (in background)
  curl -s http://localhost:3001/api/slow > /dev/null &
  
  # Error simulation
  curl -s http://localhost:3001/api/error > /dev/null
  
  echo "📊 Generated batch of requests..."
  sleep 2
done

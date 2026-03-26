#!/bin/bash
echo "Starting local test with docker-compose..."
cd deployment/docker
docker compose up --build -d

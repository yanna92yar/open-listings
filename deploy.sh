#!/bin/bash
echo "--- Begin infra deploy process ---"
echo "Running command 'git pull'"
git pull
echo "Running command 'docker compose up'"
docker compose up
echo "--- Deploy infra complete ---"



echo "Redis & MongoDB should be running"
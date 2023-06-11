#!/bin/bash
echo "Cleaning everything with docker"
docker rm $(docker ps -a -q)
docker rmi $(docker images -q)
docker system prune
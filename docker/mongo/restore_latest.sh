#! /bin/bash

cd "../../backup/" && mongorestore --gzip --archive=$(ls -rt | grep "\.gz" | tail -1) --host mongo:27017 --drop
echo "MONGODB:: Latest mgob backup restored successfully ------------------------------------------------------"
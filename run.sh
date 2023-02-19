#!/usr/bin/bash

echo "Installing serverless framework"
sudo npm install -g serverless

echo "Starting localstack (aws mock) and postgres database"
docker-compose up -d

echo "Installing websocket data publisher depnedencies"
cd ws-publisher
npm install
cd ..

echo "Installing websocket data ingestion worker depnedencies"
cd ws-ingestion-worker
npm install

cd ..

echo "Running Publisher and worker"

node ws-publisher/index.js&
cd ws-ingestion-worker && sls offline&

wait

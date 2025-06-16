#!/bin/bash

# Haconiwa multi-service startup script
# Starts frontend, backend, database, and batch services

haconiwa start \
  --org1 frontend "npm run dev" \
  --org2 backend "python app.py" \
  --org3 db "docker-entrypoint.sh postgres" \
  --org4 batch "python batch.py" \
  my-dev-company
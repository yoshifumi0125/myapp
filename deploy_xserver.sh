#!/bin/bash

# Xserver deployment script

echo "Deploying to Xserver..."

# Configuration
REMOTE_USER="yoshifumik"
REMOTE_HOST="sv14067.xserver.jp"
REMOTE_PATH="/home/yoshifumik/gta-test1.com/public_html/myapp"

# Files to upload
echo "Uploading files..."

# Create directories
ssh ${REMOTE_USER}@${REMOTE_HOST} "mkdir -p ${REMOTE_PATH}/api"

# Upload API files
scp api/index.cgi ${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_PATH}/api/
scp api/.htaccess ${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_PATH}/api/
scp main_xserver.py ${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_PATH}/
scp config.py ${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_PATH}/
scp models.py ${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_PATH}/

# Upload frontend files
rsync -avz dist/ ${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_PATH}/

# Set permissions
ssh ${REMOTE_USER}@${REMOTE_HOST} "chmod 755 ${REMOTE_PATH}/api/index.cgi"

echo "Deployment complete!"
echo "Site URL: https://gta-test1.com/myapp/"
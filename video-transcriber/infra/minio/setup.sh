#!/bin/sh
set -e
mc alias set local http://minio:9000 minioadmin minioadmin
mc mb -p local/media || true
mc mb -p local/outputs || true
mc anonymous set private local/media
mc anonymous set private local/outputs

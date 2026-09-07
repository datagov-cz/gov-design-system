#!/bin/sh
#
# Populate /etc/nginx/cors.conf based on the CORS_ENABLED env variable.
#
set -e

target=/etc/nginx/cors.conf

if [ "${CORS_ENABLED:-0}" = "1" ]; then
  cp /etc/nginx/cors.conf.default "$target"
  echo "40-cors.sh: CORS enabled"
else
  : > "$target"
  echo "40-cors.sh: CORS disabled"
fi

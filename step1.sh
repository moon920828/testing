#!/bin/bash

echo '----------step1-----------'

# Exit immediately if a command exits with a non-zero status
set -e

# Authenticate and obtain access token
ACCESS_TOKEN=$(cat /workspace/access_token.txt)

NAME="cloudbuild-test-1"
AUTH_CONFIG="projects/my-project-1553458465069/locations/us-central1/authConfigs"
AUTH_CONFIG_NAME="$AUTH_CONFIG/$NAME"

# API URL
API_URL="https://integrations.googleapis.com/v1"
GET_API_URL="$API_URL/$AUTH_CONFIG_NAME"

GET_RESPONSE=$(curl -s -X GET -H "Authorization: Bearer $ACCESS_TOKEN" "$GET_API_URL")
RESPONSE_BODY=$(echo "$GET_RESPONSE" | sed '$d')
RESPONSE_CODE=$(echo "$GET_RESPONSE" | tail -n1)

if [ "$RESPONSE_CODE" -ne 200 ]; then
  echo "Error: Received response code $RESPONSE_CODE from $GET_API_URL"
  exit 1
fi

name=$(echo "$RESPONSE_BODY" | awk -F '"' '/"name":/ {print $4}')

if [ -z "$name" ]; then
  echo "Error: 'name' not found in the response body JSON."
  exit 1
fi

# Extract the substring after the last '/' in the 'id' value
authconfig_id=${id##*/}

if [ -z "$authconfig_id" ]; then
  echo "Error: 'authconfig_id' not found."
  exit 1
fi

# Print extracted values
echo "Authentication Config: $authconfig_id"

# Optionally, store the 'last_segment' value in a file
echo "$authconfig_id" > /workspace/authconfig_id.txt

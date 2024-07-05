#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

# Authenticate and obtain access token
ACCESS_TOKEN=$(gcloud auth application-default print-access-token)

# Retrieve the secret from Secret Manager
# SECRET=$(gcloud secrets versions access latest --secret=MY_SECRET)
SECRET="https://www.googleapis.com/auth/pubsub"

# API URL
API_URL="https://integrations.googleapis.com/v1/projects/my-project-1553458465069/locations/us-central1/authConfigs"

# Create the JSON request body
# REQUEST_BODY=$(jq -n --arg key1 "value1" --arg key2 "$SECRET" '{key1: $key1, key2: $key2}')
REQUEST_BODY=$(cat <<EOF
{
    "name": "projects/my-project-1553458465069/locations/us-central1/authConfigs/cloudbuild-test-1",
    "displayName": "cloudbuild-test-1",
    "visibility": "CLIENT_VISIBLE",
    "state": "VALID",
    "decryptedCredential": {
        "credentialType": "SERVICE_ACCOUNT",
        "serviceAccountCredentials": {
            "serviceAccount": "test-91@my-project-1553458465069.iam.gserviceaccount.com",
            "scope": "$SECRET"          
        }
      }
}
EOF
)

# Make the POST request
curl -X POST -H "Authorization: Bearer $ACCESS_TOKEN" -H "Content-Type: application/json" -d "$REQUEST_BODY" "$API_URL"
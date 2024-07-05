#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

# Authenticate and obtain access token
ACCESS_TOKEN=$(gcloud auth application-default print-access-token)

# Retrieve the secret from Secret Manager
# SECRET=$(gcloud secrets versions access latest --secret=MY_SECRET)
SECRET="https://www.googleapis.com/auth/pubsub"

NAME="cloudbuild-test-1"
AUTH_CONFIG="my-project-1553458465069/locations/us-central1/authConfigs"
AUTH_CONFIG_NAME="$AUTH_CONFIG/$NAME"

# API URL
API_URL="https://integrations.googleapis.com/v1"
GET_POST_API_URL="$API_URL/$AUTH_CONFIG"
PATCH_API_URL="$API_URL/$AUTH_CONFIG_NAME"

echo $AUTH_CONFIG
echo $AUTH_CONFIG_NAME
echo $API_URL
echo $GET_POST_API_URL
echo $PATCH_API_URL


# Create the JSON request body
REQUEST_BODY=$(cat <<EOF
{
    "name": "$AUTH_CONFIG_NAME",
    "displayName": "$NAME",
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

echo $REQUEST_BODY

GET_RESPONSE=$(curl -s -X GET -H "Authorization: Bearer $ACCESS_TOKEN" "$GET_POST_API_URL")

echo $GET_RESPONSE

# if [[ "$GET_RESPONSE" == *"\"error\": {"* && "$GET_RESPONSE" == *"\"code\": 404"* ]]; then
#   echo "Error code is 404, Making a PUT request."

#   # Make the PUT request
#   curl -X PUT -H "Authorization: Bearer $ACCESS_TOKEN" -H "Content-Type: application/json" -d "$REQUEST_BODY" "$PATCH_API_URL"
# else
#   echo "No error code 404 found, Making a POST request."

#   # Make the POST request
#   curl -X POST -H "Authorization: Bearer $ACCESS_TOKEN" -H "Content-Type: application/json" -d "$REQUEST_BODY" "$GET_POST_API_URL"
# fi


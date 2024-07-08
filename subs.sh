#!/bin/bash

# Load the template
TEMPLATE_FILE="env.json"
OUTPUT_FILE="env.json"

# Read the template and substitute environment variables
envsubst < $TEMPLATE_FILE > $OUTPUT_FILE

echo "Config file generated successfully"
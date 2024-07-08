#!/bin/bash

# Load the template
TEMPLATE_FILE="config-template.json"
OUTPUT_FILE="config.json"

# Read the template and substitute environment variables
envsubst < $TEMPLATE_FILE > $OUTPUT_FILE

echo "Config file generated successfully"
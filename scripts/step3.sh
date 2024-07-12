#!/bin/bash

echo '----------step3-----------'

# Exit immediately if a command exits with a non-zero status
set -e

ACCESS_TOKEN=$(cat /workspace/access_token.txt)

echo $ACCESS_TOKEN
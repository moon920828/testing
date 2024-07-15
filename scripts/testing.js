const fs = require('fs').promises;
const path = require('path');

console.log(process.env)

async function main() {
    try {
        // Path to the environment variables file
        const envFile = '/workspace/env_vars.txt';

        // Read environment variables from file
        const envVarsData = await fs.readFile(envFile, 'utf8');
        const envVars = parseEnvVars(envVarsData);

        // Access individual variables
        const {
            base_api_url,
            token,
            base_resource_name
        } = envVars;

        // Use variables in your logic
        console.log(`Base API URL: ${base_api_url}`);
        console.log(`Token: ${token}`);
        console.log(`Base Resource Name: ${base_resource_name}`);

        // Example usage with fetch or any other operation
        // Replace with your actual logic
        // const response = await fetch(`${base_api_url}/endpoint`, {
        //     headers: {
        //         Authorization: `Bearer ${token}`
        //     }
        // });
        // const data = await response.json();
        // console.log(data);

    } catch (error) {
        console.error('Error reading or using environment variables:', error);
        process.exit(1); // Exit with non-zero code on error
    }
}

function parseEnvVars(data) {
    const lines = data.split('\n');
    const parsedVars = {};
    lines.forEach(line => {
        if (line.trim().length === 0) return;
        const [key, value] = line.split('=');
        parsedVars[key.trim()] = value.trim();
    });
    return parsedVars;
}

main();
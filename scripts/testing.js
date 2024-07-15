const fs = require('fs').promises;
const path = require('path');

// Function to fetch data from an endpoint using GET method
async function getData(endpoint, token) {
    try {
        const response = await fetch(endpoint, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return await response.json();
    } catch (error) {
        console.error(`Error fetching data from ${endpoint}:`, error);
        throw error;
    }
}

// Function to fetch data from an endpoint using POST method
async function postData(endpoint, data, token, name) {
    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });
        const responseData = await response.json();
        console.log(`New ${name} Created: ${responseData.name}.`);
        return responseData.name || null;
    } catch (error) {
        console.error(`Error posting data to ${endpoint}:`, error);
        throw error;
    }
}

// Function to process JSON files in a directory
async function processJsonFiles(folder, id, base_api_url, token) {
    try {
        const files = await fs.readdir(folder);
        const jsonFiles = files.filter(file => file.endsWith('.json'));

        if (jsonFiles.length > 0) {
            console.log(`JSON files found in ${folder}:`);
            for (const file of jsonFiles) {
                const filePath = path.join(folder, file);
                await processJsonFile(filePath, id, base_api_url, token);
            }
        } else {
            console.log(`No JSON files found in ${folder}.`);
        }
    } catch (error) {
        console.error(`Error reading directory ${folder}:`, error);
        throw error;
    }
}

// Function to process a single JSON file
async function processJsonFile(filePath, id, base_api_url, token) {
    try {
        const stat = await fs.stat(filePath);
        if (stat.isDirectory()) {
            console.log(`${filePath} is a directory. Skipping...`);
            return;
        }

        console.log(`Processing JSON file: ${filePath}`);
        const CHANNELS_API_ENDPOINT = `${base_api_url}/sfdcInstances/${id}/sfdcChannels`;
        const data = JSON.parse(await fs.readFile(filePath, 'utf8'));

        // Fetch sfdcChannels data
        const { sfdcChannels } = await getData(CHANNELS_API_ENDPOINT, token);
        const channel = sfdcChannels.find(i => i.displayName === data.displayName);

        if (channel) {
            console.log('Channel already exists...');
        } else {
            await postData(CHANNELS_API_ENDPOINT, data, token, 'channel');
        }
    } catch (error) {
        console.error(`Error processing JSON file ${filePath}:`, error);
        throw error;
    }
}

// Function to check a single JSON file in the parent folder
async function checkSingleJsonFile(parentFolder, AUTH_CONFIG_ID, endpoint, token) {
    try {
        const files = await fs.readdir(parentFolder);
        const jsonFile = files.find(file => file.endsWith('.json'));

        if (!jsonFile) {
            console.error(`Error: No JSON file found in ${parentFolder}.`);
            process.exit(1);
        }

        const filePath = path.join(parentFolder, jsonFile);
        const data = JSON.parse(await fs.readFile(filePath, 'utf8'));

        // Fetch sfdcInstances data
        const { sfdcInstances } = await getData(endpoint, token);
        const instance = sfdcInstances.find(i => i.displayName === data.displayName);

        if (instance) {
            const name = instance.name || '';
            return name.substring(name.lastIndexOf('/') + 1);
        } else {
            console.log('No ID found in the sfdcInstances. Making a POST request to get an ID...');
            data.authConfigId = [AUTH_CONFIG_ID];
            const name = await postData(endpoint, data, token, 'instance');

            if (name) {
                console.log(`New Instance Created: ${name}.`);
                return name.substring(name.lastIndexOf('/') + 1);
            } else {
                console.error('Error: Failed to create a new instance from the POST request.');
                process.exit(1);
            }
        }
    } catch (error) {
        console.error(`Error checking JSON file in ${parentFolder}:`, error);
        throw error;
    }
}

// Function to get environment variables from a file
async function getEnvVariables(filePath) {
    try {
        const envVarsData = await fs.readFile(filePath, 'utf8');
        return parseEnvVars(envVarsData);
    } catch (error) {
        console.error('Error reading environment variables:', error);
        throw error;
    }
}

// Helper function to parse environment variables from data
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

// Main function to orchestrate the process
async function main() {
    try {
        const PARENT_DIR = 'applicationIntegration/sfdc'; // Replace with your actual parent directory path

        // Fetch environment variables from file
        const envVars = await getEnvVariables('/workspace/env_vars.txt');

        // Destructure environment variables
        const { base_api_url, token } = envVars;

        // Define AUTH_CONFIG_ID endpoint
        const GET_AUTH_CONFIG_URL = `${base_api_url}/authConfigs/testing-auth-sandbox`;
        const response = await getData(GET_AUTH_CONFIG_URL, token);
        const { name } = response;
        const AUTH_CONFIG_ID = name.substring(name.lastIndexOf('/') + 1);

        // Process each folder in PARENT_DIR
        const folders = await fs.readdir(PARENT_DIR);
        for (const folder of folders) {
            const folderPath = path.join(PARENT_DIR, folder);
            const stat = await fs.stat(folderPath);
            if (stat.isDirectory()) {
                const id = await checkSingleJsonFile(folderPath, AUTH_CONFIG_ID, INSTANCE_API_ENDPOINT, token);
                if (id) {
                    console.log(`Processing channel in folder ${folderPath} with ID ${id}.`);
                    await processJsonFiles(path.join(folderPath, 'channels'), id, base_api_url, token);
                }
            }
        }
    } catch (error) {
        console.error('Error in main process:', error);
        process.exit(1); // Exit with non-zero code on error
    }
}

// Execute the main function
main();
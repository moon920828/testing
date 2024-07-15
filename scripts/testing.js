const fs = require('fs').promises;
const path = require('path');

// Function to fetch new ID from an endpoint
async function fetchNewId(endpoint, data, token) {
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
        return responseData.id || null;
    } catch (error) {
        console.error('Error fetching new ID:', error);
        throw error;
    }
}

async function getId(endpoint, token) {
    try {
        const response = await fetch(endpoint, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        const responseData = await response.json();

        // Extract the substring after the last '/' in the 'id' value
        return responseData.name.substring(responseData.name.lastIndexOf('/') + 1)


    } catch (error) {
        console.error('Error fetching new ID:', error);
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
        throw error
    }
}

// Function to process a single JSON file
async function processJsonFile(filePath, id, base_api_url, token) {
    try {
        console.log(`Processing JSON file: ${filePath}`);
        const data = JSON.parse(await fs.readFile(filePath, 'utf8'));

        if (data.id) {
            console.log('Channel is already created...');
        } else {
            const endpoint = `${base_api_url}/sfdcInstances/${id}/sfdcChannels`;
            const newId = await fetchNewId(endpoint, data, token);

            if (newId) {
                console.log(`New ID received: ${newId}. Updating JSON file...`);
                data.id = newId.substring(newId.lastIndexOf('/') + 1);
                await fs.writeFile(filePath, JSON.stringify(data, null, 2));
            } else {
                console.error('Error: Failed to get a new ID from the POST request.');
            }
        }
    } catch (error) {
        console.error(`Error processing JSON file ${filePath}:`, error);
        throw error
    }
}

// Function to check a single JSON file in the parent folder
async function checkSingleJsonFile(parentFolder, AUTH_CONFIG_ID, endpoint, token) {
    try {
        const files = await fs.readdir(parentFolder);
        const jsonFile = files.find(file => file.endsWith('.json'));

        if (!jsonFile) {
            console.error(`Error: No JSON file found in ${parentFolder}.`);
            return null;
        }

        const filePath = path.join(parentFolder, jsonFile);
        const data = JSON.parse(await fs.readFile(filePath, 'utf8'));

        if (data.id) {
            return data.id;
        } else {
            console.log('No ID found in the JSON file. Making a POST request to get an ID...');
            data.authConfigId = [AUTH_CONFIG_ID];
            const newId = await fetchNewId(endpoint, data, token);

            if (newId) {
                console.log(`New ID received: ${newId}. Updating JSON file...`);
                data.id = newId;
                await fs.writeFile(filePath, JSON.stringify(data, null, 2));
                return newId;
            } else {
                console.error('Error: Failed to get a new ID from the POST request.');
                return null;
            }
        }
    } catch (error) {
        console.error(`Error checking JSON file in ${parentFolder}:`, error);
        throw error;
    }
}

async function getEnvVariables(filePath) {
    try {
        // Read environment variables from file
        const envVarsData = await fs.readFile(filePath, 'utf8');
        return parseEnvVars(envVarsData);
    } catch (error) {
        console.error('Error reading environment variables:', error);
        throw error; // Re-throw the error to handle it in the caller function
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

async function main() {
    try {
        const PARENT_DIR = 'applicationIntegration/sfdc';

        // Fetch environment variables
        const envVars = await getEnvVariables(PARENT_DIR);

        // Destructure environment variables
        const {
            base_api_url,
            token,
        } = envVars;

        // Define constants and URLs
        const NAME = "testing-auth-sandbox";
        const GET_AUTH_CONFIG_URL = `${base_api_url}/authConfigs/${NAME}`;
        const INSTANCE_API_ENDPOINT = `${base_api_url}/sfdcInstances`;


        // Fetch AUTH_CONFIG_ID
        const AUTH_CONFIG_ID = await getId(GET_AUTH_CONFIG_URL, token);

        if (AUTH_CONFIG_ID) {
            // Iterate through folders in PARENT_DIR
            const folders = await fs.readdir(PARENT_DIR);
            for (const folder of folders) {
                const folderPath = path.join(PARENT_DIR, folder);
                const stat = await fs.stat(folderPath);
                if (stat.isDirectory()) {
                    // Check JSON files in each folder and process
                    const id = await checkSingleJsonFile(folderPath, AUTH_CONFIG_ID, INSTANCE_API_ENDPOINT, token);
                    if (id) {
                        console.log(`Processing channel in folder ${folderPath} with ID ${id}.`);
                        await processJsonFiles(path.join(folderPath, 'channels'), id, base_api_url, token);
                    }
                }
            }
        }
    } catch (error) {
        console.error('Error in main process:', error);
        process.exit(1); // Exit with non-zero code on error
    }
}

main();
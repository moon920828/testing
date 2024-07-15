console.log(process.env)

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

console.log(envVars)
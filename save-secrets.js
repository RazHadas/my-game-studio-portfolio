const { execSync } = require('child_process');
const readline = require('readline');
const fs = require('fs');
const path = require('path');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Mapping from .env keys to GitHub Secret names
const envMapping = {
    'API_KEY': 'FIREBASE_API_KEY',
    'AUTH_DOMAIN': 'FIREBASE_AUTH_DOMAIN',
    'PROJECT_ID': 'FIREBASE_PROJECT_ID',
    'STORAGE_BUCKET': 'FIREBASE_STORAGE_BUCKET',
    'MESSAGING_SENDER_ID': 'FIREBASE_MESSAGING_SENDER_ID',
    'APP_ID': 'FIREBASE_APP_ID',
};

const secrets = Object.values(envMapping);

// Basic .env parser
function parseEnv() {
    const envPath = path.join(__dirname, '.env');
    if (!fs.existsSync(envPath)) return {};

    const content = fs.readFileSync(envPath, 'utf8');
    const result = {};

    content.split('\n').forEach(line => {
        // Match KEY=VALUE (handles quotes and optional trailing commas)
        const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
        if (match) {
            let value = match[2] || '';
            // Remove quotes and trailing commas
            value = value.trim().replace(/^['"]|['"]$/g, '').replace(/,$/, '');
            result[match[1]] = value;
        }
    });
    return result;
}

async function askQuestion(query) {
    return new Promise(resolve => rl.question(query, resolve));
}

async function run() {
    console.log('\x1b[33m%s\x1b[0m', '--- Firebase to GitHub Secret Vault (Node.js) ---');

    const envVars = parseEnv();
    const foundInEnv = Object.keys(envVars).length > 0;

    if (foundInEnv) {
        console.log(`Found .env file. Importing variables...\n`);
    }

    for (const [envKey, secretName] of Object.entries(envMapping)) {
        let value = envVars[envKey];

        if (!value) {
            value = await askQuestion(`Enter value for ${secretName} (not found in .env): `);
        } else {
            console.log(`Using ${secretName} from .env`);
        }

        if (value) {
            console.log(`\x1b[36mSaving ${secretName} to GitHub...\x1b[0m`);
            try {
                // Use a temporary file to pipe the secret safely
                const tmpFile = path.join(__dirname, '.tmp_secret');
                fs.writeFileSync(tmpFile, value);
                execSync(`gh secret set ${secretName} < "${tmpFile}"`);
                fs.unlinkSync(tmpFile);
            } catch (error) {
                console.error(`\x1b[31mError saving ${secretName}: ${error.message}\x1b[0m`);
            }
        }
    }

    // Handle FIREBASE_SERVICE_ACCOUNT separately as it's usually a file
    const saValue = await askQuestion('\nDo you have a path to FIREBASE_SERVICE_ACCOUNT.json? (Leave blank to skip): ');
    if (saValue) {
        console.log(`\x1b[36mSaving FIREBASE_SERVICE_ACCOUNT to GitHub...\x1b[0m`);
        try {
            execSync(`gh secret set FIREBASE_SERVICE_ACCOUNT < "${saValue}"`);
        } catch (error) {
            console.error(`\x1b[31mError saving Service Account: ${error.message}\x1b[0m`);
        }
    }

    console.log('\n\x1b[32m%s\x1b[0m', 'Done! Your secrets are safe in the vault.');
    console.log('You can check them at: gh secret list');
    rl.close();
}

run();

const fs = require('fs');
const path = require('path');

// Function to read current .env file
function readEnvFile() {
  try {
    const envPath = path.join(process.cwd(), '.env.local');
    return fs.readFileSync(envPath, 'utf8');
  } catch (error) {
    console.error('Error reading .env.local file:', error);
    return null;
  }
}

// Function to create new .env file
function createNewEnvFile(content) {
  try {
    const newEnvPath = path.join(process.cwd(), '..', 'micro-journal-v2', '.env.local');
    fs.writeFileSync(newEnvPath, content);
    console.log('✅ New .env.local file created successfully');
  } catch (error) {
    console.error('Error creating new .env file:', error);
  }
}

// Main function
function main() {
  console.log('🔍 Reading current environment variables...');
  const envContent = readEnvFile();
  
  if (envContent) {
    console.log('📝 Creating new environment file...');
    createNewEnvFile(envContent);
  } else {
    console.error('❌ No environment variables found to migrate');
  }
}

main(); 
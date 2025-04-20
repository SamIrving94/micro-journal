#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const twilio = require('twilio');

// ANSI color codes for better console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

// Load environment variables
function loadEnvVariables() {
  const envFiles = ['.env.local', '.env'];
  let loaded = false;

  for (const file of envFiles) {
    const envPath = path.resolve(process.cwd(), file);
    if (fs.existsSync(envPath)) {
      require('dotenv').config({ path: envPath });
      console.log(`${colors.green}✓${colors.reset} Loaded environment variables from ${colors.cyan}${file}${colors.reset}`);
      loaded = true;
      break;
    }
  }

  if (!loaded) {
    console.log(`${colors.yellow}⚠️${colors.reset} No environment files found. Using system environment variables.`);
  }
}

// Validate required environment variables
function validateEnvVariables() {
  const required = ['TWILIO_ACCOUNT_SID', 'TWILIO_AUTH_TOKEN', 'TWILIO_PHONE_NUMBER'];
  const missing = required.filter(key => !process.env[key]);

  if (missing.length > 0) {
    console.error(`${colors.red}✗ Error: Missing required environment variables: ${missing.join(', ')}${colors.reset}`);
    console.error(`${colors.yellow}Please check your .env file and make sure these variables are set.${colors.reset}`);
    process.exit(1);
  }
}

// Send a test message via Twilio
async function sendTestMessage() {
  console.log(`\n${colors.blue}=== Twilio Test Message ====${colors.reset}`);
  
  try {
    // Create Twilio client
    const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    
    // Determine which channel to use
    const useWhatsApp = process.env.TWILIO_WHATSAPP_FROM ? true : false;
    const testNumber = process.env.TEST_PHONE_NUMBER || process.env.TWILIO_PHONE_NUMBER;
    
    if (!testNumber) {
      throw new Error('No test phone number specified. Please set TEST_PHONE_NUMBER in your .env file.');
    }
    
    // Prepare message parameters
    const from = useWhatsApp
      ? `whatsapp:${process.env.TWILIO_WHATSAPP_FROM}`
      : process.env.TWILIO_PHONE_NUMBER;
    
    const to = useWhatsApp
      ? `whatsapp:${testNumber}`
      : testNumber;
    
    console.log(`${colors.cyan}Sending ${useWhatsApp ? 'WhatsApp' : 'SMS'} message...${colors.reset}`);
    console.log(`${colors.cyan}From: ${from}${colors.reset}`);
    console.log(`${colors.cyan}To: ${to}${colors.reset}`);
    
    // Send message
    const message = await client.messages.create({
      body: 'This is a test message from Microjournal!',
      from,
      to
    });
    
    console.log(`\n${colors.green}✓ Message sent successfully!${colors.reset}`);
    console.log(`${colors.cyan}Message SID: ${message.sid}${colors.reset}`);
    console.log(`${colors.cyan}Status: ${message.status}${colors.reset}`);
    
  } catch (error) {
    console.error(`\n${colors.red}✗ Error sending message: ${error.message}${colors.reset}`);
    
    if (error.code) {
      console.error(`${colors.yellow}Error code: ${error.code}${colors.reset}`);
    }
    
    // Provide troubleshooting help
    console.error(`\n${colors.yellow}Troubleshooting tips:${colors.reset}`);
    console.error(`${colors.yellow}1. Check that your Twilio credentials are correct${colors.reset}`);
    console.error(`${colors.yellow}2. Verify that your phone number is formatted with country code (e.g., +12223334444)${colors.reset}`);
    console.error(`${colors.yellow}3. For WhatsApp, ensure your templates are approved and the number is opted in${colors.reset}`);
    
    process.exit(1);
  }
}

// Main function
async function main() {
  console.log(`${colors.blue}=== Microjournal Message Test ====${colors.reset}\n`);
  
  loadEnvVariables();
  validateEnvVariables();
  await sendTestMessage();
}

main(); 
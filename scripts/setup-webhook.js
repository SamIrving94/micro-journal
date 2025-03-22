#!/usr/bin/env node

const { execSync, spawn } = require('child_process');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from .env.local
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  const envConfig = dotenv.parse(fs.readFileSync(envPath));
  Object.entries(envConfig).forEach(([key, value]) => {
    process.env[key] = value;
  });
}

// Check if required environment variables are set
const requiredEnvVars = [
  'TWILIO_ACCOUNT_SID',
  'TWILIO_AUTH_TOKEN',
  'TWILIO_WHATSAPP_FROM'
];

const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
if (missingVars.length > 0) {
  console.error(`❌ Missing required environment variables: ${missingVars.join(', ')}`);
  console.error('Please set them in your .env.local file');
  process.exit(1);
}

// Twilio API credentials
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromNumber = process.env.TWILIO_WHATSAPP_FROM.replace('whatsapp:', '');

// Function to update Twilio webhook
async function updateTwilioWebhook(ngrokUrl) {
  const webhookUrl = `${ngrokUrl}/api/whatsapp/webhook`;
  console.log(`\n📣 Using webhook URL: ${webhookUrl}`);
  
  try {
    const whatsappFormData = new URLSearchParams();
    whatsappFormData.append('AccountSid', accountSid);
    whatsappFormData.append('FriendlyName', 'MicroJournal WhatsApp Sandbox');
    whatsappFormData.append('InboundRequestUrl', webhookUrl);
    whatsappFormData.append('StatusCallback', webhookUrl);
    
    // Update Twilio WhatsApp sandbox settings
    const response = await axios({
      method: 'post',
      url: `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Sandbox/WhatsApp.json`,
      auth: {
        username: accountSid,
        password: authToken
      },
      data: whatsappFormData,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
    
    console.log('✅ Twilio WhatsApp webhook updated successfully!');
    console.log(`\n🚀 Your WhatsApp number: ${fromNumber}`);
    console.log(`\n📌 To test, send a message or voice note to: ${fromNumber}`);
    
    return true;
  } catch (error) {
    console.error('❌ Error updating Twilio webhook:');
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error('Response:', error.response.data);
    } else {
      console.error(error.message);
    }
    return false;
  }
}

// Function to extract ngrok URL from output
function extractNgrokUrl(data) {
  const output = data.toString();
  const match = output.match(/https:\/\/[a-zA-Z0-9-]+\.ngrok-free\.app/);
  return match ? match[0] : null;
}

// Main function
async function main() {
  console.log('\n🔧 Setting up MicroJournal webhook...');
  
  // Check if ngrok is installed
  try {
    execSync('npx ngrok --version', { stdio: 'ignore' });
    console.log('✅ ngrok is installed');
  } catch (error) {
    console.error('❌ ngrok is not installed. Installing...');
    try {
      execSync('npm install -g ngrok', { stdio: 'inherit' });
      console.log('✅ ngrok installed successfully');
    } catch (error) {
      console.error('❌ Failed to install ngrok. Please install it manually.');
      process.exit(1);
    }
  }
  
  console.log('\n🚀 Starting ngrok tunnel on port 3000...');
  
  // Start ngrok process
  const ngrok = spawn('npx', ['ngrok', 'http', '3000']);
  
  let ngrokUrl = null;
  
  ngrok.stdout.on('data', async (data) => {
    const url = extractNgrokUrl(data);
    if (url && !ngrokUrl) {
      ngrokUrl = url;
      console.log(`✅ ngrok tunnel established at: ${ngrokUrl}`);
      
      // Update Twilio webhook with the ngrok URL
      const success = await updateTwilioWebhook(ngrokUrl);
      
      if (success) {
        console.log('\n📝 Next steps:');
        console.log('1. Make sure your Next.js server is running: npm run dev');
        console.log('2. Link your WhatsApp in the app settings');
        console.log('3. Send a test message or voice note to your WhatsApp number');
        console.log('\n⚠️ Keep this terminal open to maintain the ngrok tunnel');
      }
    }
  });
  
  ngrok.stderr.on('data', (data) => {
    console.error(`ngrok error: ${data}`);
  });
  
  ngrok.on('close', (code) => {
    console.log(`ngrok process exited with code ${code}`);
  });
  
  // Handle process termination
  process.on('SIGINT', () => {
    console.log('\n👋 Shutting down ngrok tunnel...');
    ngrok.kill();
    process.exit();
  });
}

// Run the main function
main().catch(error => {
  console.error('❌ An error occurred:', error);
  process.exit(1);
}); 
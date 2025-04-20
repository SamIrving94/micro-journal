#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// ANSI color codes for better console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m'
};

console.log(`${colors.bright}${colors.cyan}🚀 Starting ngrok tunnel for WhatsApp webhook testing...${colors.reset}`);

// Check if ngrok is installed
const isWindows = process.platform === 'win32';
const ngrokCommand = isWindows ? 'ngrok.cmd' : 'ngrok';
const ngrokPath = path.join(process.cwd(), 'node_modules', '.bin', ngrokCommand);

if (!fs.existsSync(ngrokPath)) {
  console.error(`${colors.red}Error: ngrok not found at ${ngrokPath}${colors.reset}`);
  console.log(`${colors.yellow}Please install ngrok by running: npm install ngrok${colors.reset}`);
  process.exit(1);
}

// Start ngrok tunnel on port 3000 (default Next.js port)
const ngrok = spawn(ngrokPath, ['http', '3000']);

// Function to extract ngrok URL from output
function extractNgrokUrl(data) {
  const output = data.toString();
  const match = output.match(/https:\/\/[a-zA-Z0-9-]+\.ngrok-free\.app/);
  return match ? match[0] : null;
}

let urlFound = false;

ngrok.stdout.on('data', (data) => {
  // Only extract and display the URL once
  if (!urlFound) {
    const url = extractNgrokUrl(data);
    if (url) {
      urlFound = true;
      console.log(`\n${colors.bright}${colors.green}✅ ngrok tunnel established at: ${url}${colors.reset}`);
      console.log(`\n${colors.bright}📝 Your webhook URL is:${colors.reset}`);
      console.log(`${colors.cyan}${url}/api/whatsapp/webhook${colors.reset}`);
      
      console.log(`\n${colors.bright}${colors.yellow}⚠️ Important: Configure this URL in your Twilio WhatsApp Sandbox:${colors.reset}`);
      console.log('1. Go to https://console.twilio.com');
      console.log('2. Navigate to Messaging > Try it > Send a WhatsApp Message');
      console.log(`3. Set the "WHEN A MESSAGE COMES IN" field to: ${colors.cyan}${url}/api/whatsapp/webhook${colors.reset}`);
      console.log('4. Click Save');
      
      console.log(`\n${colors.bright}💻 Then start your Next.js app in a separate terminal:${colors.reset}`);
      console.log(`${colors.green}npm run dev${colors.reset}`);
      console.log(`\n${colors.yellow}⚠️ Keep this terminal open to maintain the ngrok tunnel${colors.reset}`);
    }
  }
});

ngrok.stderr.on('data', (data) => {
  console.error(`${colors.red}ngrok error: ${data}${colors.reset}`);
});

ngrok.on('close', (code) => {
  if (code !== 0) {
    console.error(`${colors.red}ngrok process exited with code ${code}${colors.reset}`);
  } else {
    console.log(`${colors.green}ngrok process exited successfully${colors.reset}`);
  }
});

ngrok.on('error', (err) => {
  console.error(`${colors.red}Failed to start ngrok: ${err.message}${colors.reset}`);
  process.exit(1);
});

// Handle process termination
process.on('SIGINT', () => {
  console.log(`\n${colors.bright}👋 Shutting down ngrok tunnel...${colors.reset}`);
  ngrok.kill();
  process.exit();
});

console.log(`${colors.yellow}Waiting for ngrok to establish connection...${colors.reset}`); 
#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting simple ngrok tunnel for WhatsApp webhook testing...');

// Use a more direct approach to run ngrok on Windows
const isWindows = process.platform === 'win32';
const ngrokCommand = isWindows ? 'ngrok.cmd' : 'ngrok';
const ngrokPath = path.join(process.cwd(), 'node_modules', '.bin', ngrokCommand);

// Start ngrok tunnel on port 3000
const ngrok = spawn(ngrokPath, ['http', '3000']);

// Function to extract ngrok URL from output
function extractNgrokUrl(data) {
  const output = data.toString();
  console.log(output); // Log raw output for debugging
  const match = output.match(/https:\/\/[a-zA-Z0-9-]+\.ngrok-free\.app/);
  return match ? match[0] : null;
}

ngrok.stdout.on('data', (data) => {
  const url = extractNgrokUrl(data);
  if (url) {
    console.log(`\n✅ ngrok tunnel established at: ${url}`);
    console.log('\n📝 Your webhook URL is:');
    console.log(`${url}/api/whatsapp/webhook`);
    console.log('\n⚠️ Important: Configure this URL in your Twilio WhatsApp Sandbox:');
    console.log('1. Go to https://console.twilio.com');
    console.log('2. Navigate to Messaging > Try it > Send a WhatsApp Message');
    console.log(`3. Set the "WHEN A MESSAGE COMES IN" field to: ${url}/api/whatsapp/webhook`);
    console.log('4. Click Save');
    console.log('\n💻 Then start your Next.js app in a separate terminal:');
    console.log('npm run dev');
    console.log('\n⚠️ Keep this terminal open to maintain the ngrok tunnel');
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
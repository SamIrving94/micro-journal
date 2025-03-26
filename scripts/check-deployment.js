#!/usr/bin/env node

/**
 * Pre-deployment check script
 * 
 * This script verifies that all required environment variables are set
 * and performs other checks to ensure the app is ready for deployment.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Define required environment variables
const requiredEnvVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
];

// Check for .env.production file
const envPath = path.join(process.cwd(), '.env.production');
const envExists = fs.existsSync(envPath);

if (!envExists) {
  console.error('❌ .env.production file not found');
  console.log('Please create a .env.production file with the required environment variables.');
  process.exit(1);
}

// Read .env.production file
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = envContent.split('\n').reduce((acc, line) => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    const key = match[1];
    const value = match[2] || '';
    acc[key] = value.replace(/^['"]|['"]$/g, ''); // Remove quotes
  }
  return acc;
}, {});

// Check for required environment variables
const missingEnvVars = requiredEnvVars.filter(name => !envVars[name]);
if (missingEnvVars.length > 0) {
  console.error(`❌ Missing required environment variables: ${missingEnvVars.join(', ')}`);
  process.exit(1);
}

// Run build checks
try {
  console.log('📦 Running build checks...');
  execSync('npm run lint', { stdio: 'inherit' });
  console.log('✅ Lint check passed');
  
  // Optionally run tests
  if (fs.existsSync(path.join(process.cwd(), 'jest.config.js'))) {
    execSync('npm test', { stdio: 'inherit' });
    console.log('✅ Tests passed');
  }
  
  // Build the application
  execSync('npm run build', { stdio: 'inherit' });
  console.log('✅ Build successful');
  
} catch (error) {
  console.error('❌ Build checks failed', error);
  process.exit(1);
}

console.log('');
console.log('✨ Application is ready for deployment! ✨');
console.log(''); 
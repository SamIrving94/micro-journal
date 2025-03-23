#!/usr/bin/env node

/**
 * This script checks if the application is ready for deployment
 * by verifying environment variables, build status, etc.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

console.log(`${colors.blue}Starting deployment readiness check...${colors.reset}\n`);

// Check if .env.local exists
const envPath = path.join(process.cwd(), '.env.local');
let envFileExists = false;
let hasSupabaseVars = false;

try {
  envFileExists = fs.existsSync(envPath);
  if (envFileExists) {
    console.log(`${colors.green}✅ .env.local file exists${colors.reset}`);
    
    // Check for Supabase variables
    const envContent = fs.readFileSync(envPath, 'utf8');
    hasSupabaseVars = 
      envContent.includes('NEXT_PUBLIC_SUPABASE_URL') && 
      envContent.includes('NEXT_PUBLIC_SUPABASE_ANON_KEY');
    
    if (hasSupabaseVars) {
      console.log(`${colors.green}✅ Supabase environment variables found${colors.reset}`);
    } else {
      console.log(`${colors.red}❌ Missing Supabase environment variables${colors.reset}`);
    }
  } else {
    console.log(`${colors.red}❌ .env.local file not found${colors.reset}`);
  }
} catch (error) {
  console.error(`${colors.red}Error checking .env.local file:${colors.reset}`, error);
}

// Check if the app can be built
console.log(`\n${colors.blue}Attempting to build the application...${colors.reset}`);
try {
  execSync('npm run build', { stdio: 'inherit' });
  console.log(`${colors.green}✅ Build successful${colors.reset}`);
} catch (error) {
  console.error(`${colors.red}❌ Build failed${colors.reset}`);
  process.exit(1);
}

// Final summary
console.log(`\n${colors.blue}Deployment Readiness Summary:${colors.reset}`);
console.log(`${envFileExists ? colors.green + '✅' : colors.red + '❌'} Environment file${colors.reset}`);
console.log(`${hasSupabaseVars ? colors.green + '✅' : colors.red + '❌'} Supabase configuration${colors.reset}`);
console.log(`${colors.green}✅ Build process${colors.reset}`);

if (envFileExists && hasSupabaseVars) {
  console.log(`\n${colors.green}✅ Your application is ready for deployment!${colors.reset}`);
  console.log(`\nDeployment instructions can be found in the README.md file.`);
} else {
  console.log(`\n${colors.yellow}⚠️ Please fix the issues above before deploying.${colors.reset}`);
}

process.exit(0); 
#!/usr/bin/env node

/**
 * Deployment Environment Checker for Microjournal
 * 
 * This script validates that all necessary environment variables and
 * configurations are in place before deploying the application.
 */

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

// Check if chalk is installed, if not use simple strings
let log = {
  success: (msg) => console.log(`✓ ${msg}`),
  error: (msg) => console.log(`✗ ${msg}`),
  warn: (msg) => console.log(`⚠ ${msg}`),
  info: (msg) => console.log(`ℹ ${msg}`),
  title: (msg) => console.log(`\n${msg}\n${'-'.repeat(msg.length)}`)
};

// Try to use chalk if available
try {
  if (fs.existsSync(path.join(__dirname, '../node_modules/chalk'))) {
    log = {
      success: (msg) => console.log(chalk.green(`✓ ${msg}`)),
      error: (msg) => console.log(chalk.red(`✗ ${msg}`)),
      warn: (msg) => console.log(chalk.yellow(`⚠ ${msg}`)),
      info: (msg) => console.log(chalk.blue(`ℹ ${msg}`)),
      title: (msg) => console.log(chalk.bold(`\n${msg}\n${'-'.repeat(msg.length)}`))
    };
  }
} catch (error) {
  console.log('Chalk not available, using plain text output');
}

let errors = 0;
let warnings = 0;

// Function to check if a file exists
function checkFileExists(filePath, isRequired = true, customMessage = '') {
  const exists = fs.existsSync(filePath);
  const relativePath = path.relative(process.cwd(), filePath);
  
  if (exists) {
    log.success(`${relativePath} exists`);
    return true;
  } else {
    const message = customMessage || `${relativePath} is missing`;
    if (isRequired) {
      log.error(message);
      errors++;
    } else {
      log.warn(message);
      warnings++;
    }
    return false;
  }
}

// Function to check if env variables exist in .env
function checkEnvVariables(envPath) {
  if (!fs.existsSync(envPath)) {
    log.error(`${path.relative(process.cwd(), envPath)} is missing`);
    errors++;
    return;
  }

  const envContent = fs.readFileSync(envPath, 'utf8');
  const requiredVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'TWILIO_ACCOUNT_SID',
    'TWILIO_AUTH_TOKEN',
    'TWILIO_PHONE_NUMBER'
  ];

  log.title('Environment Variables Check');
  
  requiredVars.forEach(variable => {
    const regex = new RegExp(`${variable}=.+`);
    if (!regex.test(envContent)) {
      log.error(`${variable} is missing in ${path.relative(process.cwd(), envPath)}`);
      errors++;
    } else {
      log.success(`${variable} is configured`);
    }
  });
}

// Function to check if package.json contains required scripts
function checkPackageJson(packagePath) {
  if (!fs.existsSync(packagePath)) {
    log.error(`${path.relative(process.cwd(), packagePath)} is missing`);
    errors++;
    return;
  }

  let packageJson;
  try {
    packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  } catch (error) {
    log.error(`Failed to parse ${path.relative(process.cwd(), packagePath)}: ${error.message}`);
    errors++;
    return;
  }

  log.title('Package.json Check');
  
  // Check required scripts
  const requiredScripts = ['dev', 'build', 'start'];
  requiredScripts.forEach(script => {
    if (!packageJson.scripts || !packageJson.scripts[script]) {
      log.error(`Script '${script}' is missing in package.json`);
      errors++;
    } else {
      log.success(`Script '${script}' is configured`);
    }
  });

  // Check required dependencies
  const requiredDeps = ['next', 'react', 'react-dom', '@supabase/supabase-js', 'twilio'];
  requiredDeps.forEach(dep => {
    if (!packageJson.dependencies || !packageJson.dependencies[dep]) {
      log.error(`Dependency '${dep}' is missing in package.json`);
      errors++;
    } else {
      log.success(`Dependency '${dep}' is installed (${packageJson.dependencies[dep]})`);
    }
  });
}

// Function to check if vercel.json is valid
function checkVercelConfig(vercelPath) {
  if (!fs.existsSync(vercelPath)) {
    log.warn(`${path.relative(process.cwd(), vercelPath)} is missing (not critical but recommended)`);
    warnings++;
    return;
  }

  let vercelConfig;
  try {
    vercelConfig = JSON.parse(fs.readFileSync(vercelPath, 'utf8'));
  } catch (error) {
    log.error(`Failed to parse ${path.relative(process.cwd(), vercelPath)}: ${error.message}`);
    errors++;
    return;
  }

  log.title('Vercel Configuration Check');
  
  // Check required fields
  const requiredFields = ['buildCommand', 'devCommand', 'framework'];
  requiredFields.forEach(field => {
    if (!vercelConfig[field]) {
      log.warn(`Field '${field}' is missing in vercel.json`);
      warnings++;
    } else {
      log.success(`Field '${field}' is configured (${vercelConfig[field]})`);
    }
  });
}

// Main validation function
function runValidation() {
  const rootDir = process.cwd();
  log.title('File Structure Check');
  
  // Check critical files
  checkFileExists(path.join(rootDir, 'package.json'));
  checkFileExists(path.join(rootDir, '.env'), false, '.env file is missing. Copy from .env.example and add your values');
  checkFileExists(path.join(rootDir, '.env.example'));
  checkFileExists(path.join(rootDir, 'next.config.js'));
  checkFileExists(path.join(rootDir, 'vercel.json'), false);
  checkFileExists(path.join(rootDir, 'src/app/layout.tsx'));
  checkFileExists(path.join(rootDir, 'src/app/page.tsx'));
  checkFileExists(path.join(rootDir, 'src/lib/supabase/client.ts'));
  
  // Check package.json configuration
  checkPackageJson(path.join(rootDir, 'package.json'));
  
  // Check vercel.json (if exists)
  checkVercelConfig(path.join(rootDir, 'vercel.json'));
  
  // Check .env variables (if .env exists)
  if (fs.existsSync(path.join(rootDir, '.env'))) {
    checkEnvVariables(path.join(rootDir, '.env'));
  } else if (fs.existsSync(path.join(rootDir, '.env.local'))) {
    checkEnvVariables(path.join(rootDir, '.env.local'));
  }

  // Print summary
  log.title('Validation Summary');
  
  if (errors === 0 && warnings === 0) {
    log.success('All checks passed! The project is ready for deployment.');
    process.exit(0);
  } else {
    if (errors > 0) {
      log.error(`Found ${errors} error(s) that need to be fixed before deployment.`);
    }
    if (warnings > 0) {
      log.warn(`Found ${warnings} warning(s) that should be addressed (but won't block deployment).`);
    }
    
    if (errors > 0) {
      process.exit(1); // Exit with error code if there are errors
    } else {
      process.exit(0); // Exit with success if there are only warnings
    }
  }
}

// Run the validation
runValidation(); 
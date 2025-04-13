const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Function to run git commands
function runGitCommand(command) {
  try {
    execSync(command, { stdio: 'inherit' });
    return true;
  } catch (error) {
    console.error(`Error running command: ${command}`, error);
    return false;
  }
}

// Function to create archive directory
function createArchiveDirectory() {
  const archivePath = path.join(process.cwd(), '..', 'micro-journal-archive');
  if (!fs.existsSync(archivePath)) {
    fs.mkdirSync(archivePath);
  }
  return archivePath;
}

// Main function
function main() {
  console.log('📦 Starting project archive process...');

  // Create archive branch
  console.log('1️⃣ Creating archive branch...');
  if (!runGitCommand('git checkout -b archive-v1')) {
    console.error('❌ Failed to create archive branch');
    return;
  }

  // Create archive directory
  console.log('2️⃣ Creating archive directory...');
  const archivePath = createArchiveDirectory();

  // Copy current project to archive
  console.log('3️⃣ Copying project to archive...');
  const currentPath = process.cwd();
  const copyCommand = `xcopy /E /I /H "${currentPath}" "${archivePath}"`;
  if (!runGitCommand(copyCommand)) {
    console.error('❌ Failed to copy project to archive');
    return;
  }

  // Tag the version
  console.log('4️⃣ Tagging version...');
  if (!runGitCommand('git tag v1.0.0')) {
    console.error('❌ Failed to tag version');
    return;
  }

  // Push archive branch and tags
  console.log('5️⃣ Pushing archive branch and tags...');
  if (!runGitCommand('git push origin archive-v1 --tags')) {
    console.error('❌ Failed to push archive branch and tags');
    return;
  }

  console.log('✅ Project archived successfully!');
  console.log('\nNext steps:');
  console.log('1. Create new project directory: mkdir micro-journal-v2');
  console.log('2. Initialize new project: cd micro-journal-v2 && npx create-next-app@latest . --typescript --tailwind --eslint');
  console.log('3. Run migration script: node ../micro-journal/scripts/migrate-env.js');
}

main(); 
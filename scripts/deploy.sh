#!/bin/bash
# Microjournal v2 Deployment Script for Unix-based systems (Linux/macOS)

# ANSI color codes
RED="\033[0;31m"
GREEN="\033[0;32m"
YELLOW="\033[0;33m"
BLUE="\033[0;36m"
BOLD="\033[1m"
RESET="\033[0m"

# Print banner
echo -e "${BLUE}${BOLD}"
echo -e "╔═══════════════════════════════════════════════════════════╗"
echo -e "║              MICROJOURNAL DEPLOYMENT SCRIPT               ║"
echo -e "╚═══════════════════════════════════════════════════════════╝"
echo -e "${RESET}"

# Exit on error
set -e

# Functions
log_success() {
  echo -e "${GREEN}✓ $1${RESET}"
}

log_error() {
  echo -e "${RED}✗ $1${RESET}"
}

log_info() {
  echo -e "${BLUE}ℹ $1${RESET}"
}

log_warning() {
  echo -e "${YELLOW}⚠ $1${RESET}"
}

log_section() {
  echo -e "\n${BOLD}$1${RESET}"
  echo -e "${BOLD}$(printf '%*s' "${#1}" | tr ' ' '-')${RESET}"
}

# Check prerequisites
log_section "Checking Prerequisites"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
  log_error "Node.js is not installed"
  echo -e "Please install Node.js from https://nodejs.org/"
  exit 1
fi
log_success "Node.js is installed: $(node -v)"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
  log_error "npm is not installed"
  echo -e "Please install npm (usually comes with Node.js)"
  exit 1
fi
log_success "npm is installed: $(npm -v)"

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
  log_warning "Vercel CLI is not installed. Installing now..."
  npm install -g vercel
  if [ $? -ne 0 ]; then
    log_error "Failed to install Vercel CLI. Please install it manually with: npm install -g vercel"
    exit 1
  fi
  log_success "Vercel CLI installed successfully"
else
  log_success "Vercel CLI is installed: $(vercel --version)"
fi

# Run the deployment check script
log_section "Running Deployment Validation"
node ./scripts/check-deployment.js

if [ $? -ne 0 ]; then
  log_error "Deployment validation failed. Please fix the issues before deploying."
  
  # Ask if user wants to continue despite the errors
  read -p "Continue anyway? (y/N): " continue_choice
  if [[ ! "$continue_choice" =~ ^[Yy]$ ]]; then
    exit 1
  fi
  log_warning "Continuing deployment despite validation errors..."
else
  log_success "Deployment validation passed!"
fi

# Install dependencies
log_section "Installing Dependencies"
log_info "Installing npm packages..."
npm install

if [ $? -ne 0 ]; then
  log_error "Failed to install dependencies"
  exit 1
fi
log_success "Dependencies installed successfully"

# Build the application
log_section "Building Application"
log_info "Running build process..."
npm run build

if [ $? -ne 0 ]; then
  log_error "Build failed"
  exit 1
fi
log_success "Build completed successfully"

# Run tests if available
if grep -q "\"test\":" package.json; then
  log_section "Running Tests"
  log_info "Executing test suite..."
  npm test
  
  if [ $? -ne 0 ]; then
    log_warning "Tests failed. This might indicate issues with your application."
    read -p "Continue with deployment anyway? (y/N): " continue_tests
    if [[ ! "$continue_tests" =~ ^[Yy]$ ]]; then
      exit 1
    fi
  else
    log_success "All tests passed"
  fi
fi

# Deploy to Vercel
log_section "Deploying to Vercel"

# Ask for deployment confirmation
read -p "Ready to deploy. Continue? (y/N): " deploy_choice
if [[ ! "$deploy_choice" =~ ^[Yy]$ ]]; then
  log_info "Deployment cancelled"
  exit 0
fi

# Check if deployment should go to production
read -p "Deploy to production? (y/N): " prod_choice
if [[ "$prod_choice" =~ ^[Yy]$ ]]; then
  log_info "Deploying to PRODUCTION environment..."
  vercel deploy --prod
else
  log_info "Deploying to PREVIEW environment..."
  vercel deploy
fi

if [ $? -ne 0 ]; then
  log_error "Deployment failed"
  exit 1
fi

log_section "Deployment Summary"
log_success "Deployment completed successfully!"
echo -e "${GREEN}${BOLD}"
echo -e "╔═══════════════════════════════════════════════════════════╗"
echo -e "║              MICROJOURNAL DEPLOYED SUCCESSFULLY           ║"
echo -e "╚═══════════════════════════════════════════════════════════╝"
echo -e "${RESET}"

# Make the script executable when it's created
chmod +x "$0" 
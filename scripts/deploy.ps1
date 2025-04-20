#!/usr/bin/env pwsh
# MicroJournal Deployment Script (Windows PowerShell version)
# This script deploys the MicroJournal application in a Windows environment

# Exit on error
$ErrorActionPreference = "Stop"

# Function for colored output
function Write-ColorOutput {
    param(
        [Parameter(Mandatory=$true)]
        [string]$Message,
        [Parameter(Mandatory=$true)]
        [string]$Color
    )
    
    $originalColor = $host.UI.RawUI.ForegroundColor
    $host.UI.RawUI.ForegroundColor = $Color
    Write-Output $Message
    $host.UI.RawUI.ForegroundColor = $originalColor
}

Write-ColorOutput "Starting MicroJournal deployment..." "Green"

# Check for required environment variables
$required_vars = @(
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    "NEXT_PUBLIC_APP_URL",
    "TWILIO_ACCOUNT_SID",
    "TWILIO_AUTH_TOKEN",
    "TWILIO_WHATSAPP_FROM",
    "TWILIO_PHONE_NUMBER",
    "WHATSAPP_VERIFY_TOKEN",
    "OPENAI_API_KEY"
)

Write-ColorOutput "Checking environment variables..." "Yellow"
$missing_vars = @()
foreach ($var in $required_vars) {
    if (-not (Get-Item "env:$var" -ErrorAction SilentlyContinue)) {
        Write-ColorOutput "Error: $var is not set" "Red"
        $missing_vars += $var
    }
}

if ($missing_vars.Count -gt 0) {
    Write-ColorOutput "Please set the missing environment variables before deploying." "Red"
    exit 1
}

# Install dependencies
Write-ColorOutput "Installing dependencies..." "Yellow"
npm install

# Build the application
Write-ColorOutput "Building the application..." "Yellow"
npm run build

# Run database migrations
Write-ColorOutput "Running database migrations..." "Yellow"
npm run migrate

# Configure Twilio webhook
Write-ColorOutput "Configuring Twilio webhook..." "Yellow"
$base_url = $env:NEXT_PUBLIC_APP_URL
if (-not $base_url) {
    $base_url = "https://your-app-url.com" # Default value if not set
    Write-ColorOutput "Warning: NEXT_PUBLIC_APP_URL not set. Using default value: $base_url" "Yellow"
}

Write-ColorOutput "Note: In PowerShell, you'll need to configure Twilio webhooks via the Twilio Dashboard or using an HTTP request library. The example below shows the URLs to configure:" "Yellow"
Write-Output "SMS URL: $base_url/api/whatsapp/webhook"
Write-Output "Voice URL: $base_url/api/whatsapp/webhook"
Write-Output "Status Callback: $base_url/api/whatsapp/webhook/status"
Write-Output "WhatsApp Webhook URL: $base_url/api/whatsapp/webhook"

# Start the production server
Write-ColorOutput "Starting production server..." "Yellow"
# Start the server in the background
Start-Process npm -ArgumentList "start" -NoNewWindow

# Run health check
Write-ColorOutput "Running health check..." "Yellow"
$healthUrl = "$base_url/api/health"
Write-Output "Checking health at: $healthUrl"

# Wait a moment for the server to start
Start-Sleep -Seconds 5

try {
    $response = Invoke-WebRequest -Uri $healthUrl -UseBasicParsing
    if ($response.Content -like "*ok*") {
        Write-ColorOutput "Health check passed!" "Green"
    } else {
        Write-ColorOutput "Health check failed: Unexpected response" "Red"
        exit 1
    }
} catch {
    Write-ColorOutput "Health check failed: $_" "Red"
    exit 1
}

Write-ColorOutput "Deployment completed successfully!" "Green"
Write-ColorOutput "Please verify the following:" "Yellow"
Write-Output "1. WhatsApp webhook is properly configured"
Write-Output "2. Database migrations completed successfully"
Write-Output "3. Environment variables are correctly set"
Write-Output "4. Production server is running"
Write-Output "5. Health check endpoint is responding"

# Microjournal Deployment Script for Windows
# This script validates the deployment environment and deploys to Vercel

# ANSI color codes for PowerShell
$ESC = [char]27
$colors = @{
    Reset = "$ESC[0m"
    Green = "$ESC[32m"
    Red = "$ESC[31m"
    Yellow = "$ESC[33m"
    Blue = "$ESC[34m"
    Cyan = "$ESC[36m"
    White = "$ESC[37m"
    Bold = "$ESC[1m"
}

# Banner
Write-Host "$($colors.Blue)$($colors.Bold)"
Write-Host "╔═══════════════════════════════════════════════════════════╗"
Write-Host "║              MICROJOURNAL DEPLOYMENT SCRIPT               ║"
Write-Host "╚═══════════════════════════════════════════════════════════╝"
Write-Host "$($colors.Reset)"

# Check if Node.js is installed
try {
    $nodeVersion = node -v
    Write-Host "$($colors.Green)✓ Node.js is installed: $nodeVersion$($colors.Reset)"
} catch {
    Write-Host "$($colors.Red)✗ Node.js is not installed. Please install Node.js to continue.$($colors.Reset)"
    exit 1
}

# Check if npm is installed
try {
    $npmVersion = npm -v
    Write-Host "$($colors.Green)✓ npm is installed: $npmVersion$($colors.Reset)"
} catch {
    Write-Host "$($colors.Red)✗ npm is not installed. Please install npm to continue.$($colors.Reset)"
    exit 1
}

# Check if Vercel CLI is installed
try {
    $vercelVersion = vercel -v
    Write-Host "$($colors.Green)✓ Vercel CLI is installed: $vercelVersion$($colors.Reset)"
} catch {
    Write-Host "$($colors.Yellow)⚠ Vercel CLI is not installed. Installing now...$($colors.Reset)"
    npm install -g vercel
    if ($LASTEXITCODE -ne 0) {
        Write-Host "$($colors.Red)✗ Failed to install Vercel CLI. Please install it manually: npm install -g vercel$($colors.Reset)"
        exit 1
    }
    Write-Host "$($colors.Green)✓ Vercel CLI installed successfully$($colors.Reset)"
}

# Run the deployment check script
Write-Host "$($colors.Cyan)$($colors.Bold)`nRunning deployment validation...$($colors.Reset)"
node ./scripts/check-deployment.js

if ($LASTEXITCODE -ne 0) {
    Write-Host "$($colors.Red)✗ Deployment validation failed. Please fix the issues before deploying.$($colors.Reset)"
    exit 1
}

# Install dependencies
Write-Host "$($colors.Cyan)$($colors.Bold)`nInstalling dependencies...$($colors.Reset)"
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "$($colors.Red)✗ Failed to install dependencies. Please check your npm configuration.$($colors.Reset)"
    exit 1
}

# Build the application
Write-Host "$($colors.Cyan)$($colors.Bold)`nBuilding the application...$($colors.Reset)"
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "$($colors.Red)✗ Build failed. Please fix the build errors before deploying.$($colors.Reset)"
    exit 1
}

# Ask for deployment confirmation
Write-Host "$($colors.Yellow)$($colors.Bold)`nReady to deploy to Vercel.$($colors.Reset)"
$confirmation = Read-Host "Do you want to continue with deployment? (y/n)"

if ($confirmation -eq "y" -or $confirmation -eq "Y") {
    # Deploy to Vercel
    Write-Host "$($colors.Cyan)$($colors.Bold)`nDeploying to Vercel...$($colors.Reset)"
    
    # Check if production flag should be used
    $prodConfirmation = Read-Host "Deploy to production? (y/n)"
    
    if ($prodConfirmation -eq "y" -or $prodConfirmation -eq "Y") {
        Write-Host "$($colors.Yellow)$($colors.Bold)Deploying to PRODUCTION environment$($colors.Reset)"
        vercel deploy --prod
    } else {
        Write-Host "$($colors.Yellow)$($colors.Bold)Deploying to PREVIEW environment$($colors.Reset)"
        vercel deploy
    }
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "$($colors.Red)✗ Deployment failed. Please check the Vercel CLI output for details.$($colors.Reset)"
        exit 1
    }
    
    Write-Host "$($colors.Green)$($colors.Bold)`n✓ Deployment completed successfully!$($colors.Reset)"
} else {
    Write-Host "$($colors.Yellow)$($colors.Bold)`nDeployment cancelled.$($colors.Reset)"
} 
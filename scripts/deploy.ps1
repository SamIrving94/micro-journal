#!/usr/bin/env pwsh
# Microjournal Deployment Script for Windows
# This script validates the deployment environment and deploys to Vercel

# Exit on error
$ErrorActionPreference = "Stop"

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

Write-Host "$($colors.Cyan)$($colors.Bold)`nChecking environment variables...$($colors.Reset)"
$missing_vars = @()
foreach ($var in $required_vars) {
    if (-not (Get-Item "env:$var" -ErrorAction SilentlyContinue)) {
        Write-Host "$($colors.Yellow)⚠ Warning: $var is not set$($colors.Reset)"
        $missing_vars += $var
    } else {
        Write-Host "$($colors.Green)✓ $var is set$($colors.Reset)"
    }
}

if ($missing_vars.Count -gt 0) {
    Write-Host "$($colors.Yellow)Some environment variables are missing. They will need to be set in Vercel deployment.$($colors.Reset)"
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

# Configure Twilio webhook
$base_url = $env:NEXT_PUBLIC_APP_URL
if (-not $base_url) {
    $base_url = "https://your-app-url.com" # Default value if not set
    Write-Host "$($colors.Yellow)⚠ Warning: NEXT_PUBLIC_APP_URL not set. Using default value: $base_url$($colors.Reset)"
}

Write-Host "$($colors.Cyan)$($colors.Bold)`nTwilio Webhook Configuration:$($colors.Reset)"
Write-Host "$($colors.Yellow)Note: Configure these webhook URLs in your Twilio Dashboard:$($colors.Reset)"
Write-Host "SMS URL: $base_url/api/whatsapp/webhook"
Write-Host "Voice URL: $base_url/api/whatsapp/webhook"
Write-Host "Status Callback: $base_url/api/whatsapp/webhook/status"
Write-Host "WhatsApp Webhook URL: $base_url/api/whatsapp/webhook"

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
    Write-Host "$($colors.Yellow)$($colors.Bold)`nPost-Deployment Checklist:$($colors.Reset)"
    Write-Host "1. Configure Twilio webhooks with your deployment URL"
    Write-Host "2. Verify environment variables are set in Vercel"
    Write-Host "3. Test the application functionality"
} else {
    Write-Host "$($colors.Yellow)$($colors.Bold)`nDeployment cancelled.$($colors.Reset)"
} 
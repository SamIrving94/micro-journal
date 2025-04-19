# PowerShell deployment script for Microjournal v2
$ErrorActionPreference = "Stop"

# Configuration
$ENVIRONMENTS = @{
    "dev" = @{
        "branch" = "develop"
        "remote" = "origin"
    }
    "staging" = @{
        "branch" = "staging"
        "remote" = "origin"
    }
    "prod" = @{
        "branch" = "main"
        "remote" = "origin"
    }
}

# Functions
function Write-ColorOutput($ForegroundColor) {
    $fc = $host.UI.RawUI.ForegroundColor
    $host.UI.RawUI.ForegroundColor = $ForegroundColor
    if ($args) {
        Write-Output $args
    }
    $host.UI.RawUI.ForegroundColor = $fc
}

function Test-CommandExists {
    param($command)
    $oldPreference = $ErrorActionPreference
    $ErrorActionPreference = 'stop'
    try {
        if (Get-Command $command) { return $true }
    } catch {
        return $false
    } finally {
        $ErrorActionPreference = $oldPreference
    }
}

function Test-NodeDependencies {
    Write-ColorOutput Cyan "🔍 Checking Node.js dependencies..."
    if (-not (Test-CommandExists "npm")) {
        throw "npm is not installed. Please install Node.js and npm."
    }
    
    # Check for missing dependencies
    $missingDeps = npm ls --parseable --depth=0 | Where-Object { $_ -match "missing" }
    if ($missingDeps) {
        Write-ColorOutput Yellow "⚠️ Installing missing dependencies..."
        npm install
    }
}

function Test-UncommittedChanges {
    Write-ColorOutput Cyan "🔍 Checking for uncommitted changes..."
    $status = git status --porcelain
    if ($status) {
        Write-ColorOutput Red "❌ There are uncommitted changes. Please commit or stash them before deploying."
        Write-Output $status
        exit 1
    }
}

function Run-Tests {
    Write-ColorOutput Cyan "🧪 Running tests..."
    if (Test-CommandExists "npm") {
        npm test
        if ($LASTEXITCODE -ne 0) {
            throw "Tests failed. Please fix the issues before deploying."
        }
    } else {
        Write-ColorOutput Yellow "⚠️ npm not found. Skipping tests."
    }
}

function Deploy-To-Environment {
    param(
        [Parameter(Mandatory=$true)]
        [string]$environment
    )

    if (-not $ENVIRONMENTS.ContainsKey($environment)) {
        throw "Invalid environment. Use: dev, staging, or prod"
    }

    $config = $ENVIRONMENTS[$environment]
    $currentBranch = git rev-parse --abbrev-ref HEAD

    Write-ColorOutput Cyan "🚀 Deploying to $environment environment..."

    # Check if we're on the correct branch
    if ($currentBranch -ne $config.branch) {
        Write-ColorOutput Yellow "⚠️ You are on branch '$currentBranch'. Switching to '$($config.branch)'..."
        git checkout $config.branch
        if ($LASTEXITCODE -ne 0) {
            throw "Failed to switch to $($config.branch) branch"
        }
    }

    # Pull latest changes
    Write-ColorOutput Cyan "📥 Pulling latest changes..."
    git pull $config.remote $config.branch
    if ($LASTEXITCODE -ne 0) {
        throw "Failed to pull latest changes"
    }

    # Run pre-deployment checks
    Test-NodeDependencies
    Test-UncommittedChanges
    Run-Tests

    # Add all changes
    Write-ColorOutput Cyan "📝 Adding changes..."
    git add .

    # Create commit
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $commitMessage = "Deploy to $environment: $timestamp"
    Write-ColorOutput Cyan "💾 Creating commit: $commitMessage"
    git commit -m $commitMessage
    if ($LASTEXITCODE -ne 0) {
        throw "Failed to create commit"
    }

    # Push changes
    Write-ColorOutput Cyan "📤 Pushing to $($config.remote)/$($config.branch)..."
    git push $config.remote $config.branch
    if ($LASTEXITCODE -ne 0) {
        throw "Failed to push changes"
    }

    Write-ColorOutput Green "✅ Successfully deployed to $environment environment!"
}

# Main script
try {
    # Get environment from command line or default to dev
    $env = $args[0]
    if (-not $env) {
        $env = "dev"
    }

    Deploy-To-Environment -environment $env
} catch {
    Write-ColorOutput Red "❌ Deployment failed: $_"
    exit 1
} 
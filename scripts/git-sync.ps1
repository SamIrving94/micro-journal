# Microjournal GitHub Auto-Sync Script
# This script automatically adds, commits, and pushes changes to GitHub

$ErrorActionPreference = "Stop"

# ANSI color codes for Windows PowerShell
$colors = @{
    Red = "`e[31m"
    Green = "`e[32m"
    Yellow = "`e[33m"
    Blue = "`e[34m"
    Magenta = "`e[35m"
    Cyan = "`e[36m"
    White = "`e[37m"
    Reset = "`e[0m"
    Bold = "`e[1m"
}

# Header
function Write-Header {
    Write-Host "`n$($colors.Blue)$($colors.Bold)╔════════════════════════════════════════════════════════╗$($colors.Reset)"
    Write-Host "$($colors.Blue)$($colors.Bold)║              MICROJOURNAL GITHUB SYNC SCRIPT             ║$($colors.Reset)"
    Write-Host "$($colors.Blue)$($colors.Bold)╚════════════════════════════════════════════════════════╝$($colors.Reset)`n"
}

# Functions
function Test-GitRepo {
    if (-not (Test-Path ".git")) {
        Write-Host "$($colors.Red)✗ Not a git repository. Please run this script from the project root.$($colors.Reset)"
        exit 1
    }
}

function Get-GitStatus {
    $status = git status --porcelain
    return $status
}

function Get-CommitMessage {
    param (
        [Parameter(Mandatory=$true)]
        [string]$DefaultMessage
    )
    
    Write-Host "$($colors.Yellow)Default commit message: $DefaultMessage$($colors.Reset)"
    $message = Read-Host "Enter commit message (press Enter to use default)"
    
    if ([string]::IsNullOrWhiteSpace($message)) {
        return $DefaultMessage
    } else {
        return $message
    }
}

function Sync-Repository {
    param (
        [Parameter(Mandatory=$true)]
        [string]$CommitMessage
    )
    
    # Add all changes
    Write-Host "$($colors.Cyan)$($colors.Bold)`nAdding changes to git...$($colors.Reset)"
    git add .
    
    # Commit changes
    Write-Host "$($colors.Cyan)$($colors.Bold)`nCommitting changes...$($colors.Reset)"
    git commit -m $CommitMessage
    
    if ($LASTEXITCODE -ne 0) {
        if ((git status --porcelain) -eq $null) {
            Write-Host "$($colors.Yellow)No changes to commit. Working directory clean.$($colors.Reset)"
            return $false
        } else {
            Write-Host "$($colors.Red)✗ Git commit failed.$($colors.Reset)"
            exit 1
        }
    }
    
    # Push changes
    Write-Host "$($colors.Cyan)$($colors.Bold)`nPushing to GitHub...$($colors.Reset)"
    
    # First try normal push
    git push origin master
    
    if ($LASTEXITCODE -ne 0) {
        # If normal push fails, ask if user wants to force push
        Write-Host "$($colors.Yellow)Push failed. There might be changes on GitHub that you don't have locally.$($colors.Reset)"
        $forcePush = Read-Host "Do you want to force push your changes? (y/n) [WARNING: This will overwrite remote changes]"
        
        if ($forcePush -eq "y") {
            git push -f origin master
            if ($LASTEXITCODE -ne 0) {
                Write-Host "$($colors.Red)✗ Force push failed.$($colors.Reset)"
                exit 1
            }
        } else {
            Write-Host "$($colors.Yellow)Push cancelled. You might want to run 'git pull' to integrate remote changes first.$($colors.Reset)"
            exit 1
        }
    }
    
    return $true
}

# Main script
try {
    Write-Header
    
    # Verify we're in a git repository
    Test-GitRepo
    
    # Check if there are changes to commit
    $status = Get-GitStatus
    
    if ($status) {
        # Generate a default commit message
        $date = Get-Date -Format "yyyy-MM-dd HH:mm"
        $defaultMessage = "Microjournal changes - $date"
        
        # Get commit message from user
        $commitMessage = Get-CommitMessage -DefaultMessage $defaultMessage
        
        # Sync repository
        $success = Sync-Repository -CommitMessage $commitMessage
        
        if ($success) {
            Write-Host "$($colors.Green)$($colors.Bold)`n✓ Changes successfully pushed to GitHub!$($colors.Reset)"
        }
    } else {
        Write-Host "$($colors.Yellow)No changes to commit. Working directory clean.$($colors.Reset)"
    }
    
} catch {
    Write-Host "$($colors.Red)An error occurred: $_$($colors.Reset)"
    exit 1
} 
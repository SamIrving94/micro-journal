#!/bin/bash

# Configuration
declare -A ENVIRONMENTS=(
    ["dev"]="develop"
    ["staging"]="staging"
    ["prod"]="main"
)

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Functions
print_color() {
    local color=$1
    shift
    echo -e "${color}$*${NC}"
}

check_command() {
    if ! command -v "$1" &> /dev/null; then
        print_color "$RED" "❌ $1 is not installed. Please install it before continuing."
        exit 1
    fi
}

check_node_dependencies() {
    print_color "$CYAN" "🔍 Checking Node.js dependencies..."
    check_command npm
    
    # Check for missing dependencies
    if npm ls --parseable --depth=0 | grep -q "missing"; then
        print_color "$YELLOW" "⚠️ Installing missing dependencies..."
        npm install
    fi
}

check_uncommitted_changes() {
    print_color "$CYAN" "🔍 Checking for uncommitted changes..."
    if [ -n "$(git status --porcelain)" ]; then
        print_color "$RED" "❌ There are uncommitted changes. Please commit or stash them before deploying."
        git status
        exit 1
    fi
}

run_tests() {
    print_color "$CYAN" "🧪 Running tests..."
    if command -v npm &> /dev/null; then
        npm test
        if [ $? -ne 0 ]; then
            print_color "$RED" "❌ Tests failed. Please fix the issues before deploying."
            exit 1
        fi
    else
        print_color "$YELLOW" "⚠️ npm not found. Skipping tests."
    fi
}

deploy_to_environment() {
    local environment=$1
    local target_branch=${ENVIRONMENTS[$environment]}
    
    if [ -z "$target_branch" ]; then
        print_color "$RED" "❌ Invalid environment. Use: dev, staging, or prod"
        exit 1
    fi

    print_color "$CYAN" "🚀 Deploying to $environment environment..."

    # Check if we're on the correct branch
    local current_branch=$(git rev-parse --abbrev-ref HEAD)
    if [ "$current_branch" != "$target_branch" ]; then
        print_color "$YELLOW" "⚠️ You are on branch '$current_branch'. Switching to '$target_branch'..."
        git checkout "$target_branch" || {
            print_color "$RED" "❌ Failed to switch to $target_branch branch"
            exit 1
        }
    fi

    # Pull latest changes
    print_color "$CYAN" "📥 Pulling latest changes..."
    git pull origin "$target_branch" || {
        print_color "$RED" "❌ Failed to pull latest changes"
        exit 1
    }

    # Run pre-deployment checks
    check_node_dependencies
    check_uncommitted_changes
    run_tests

    # Add all changes
    print_color "$CYAN" "📝 Adding changes..."
    git add .

    # Create commit
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    local commit_message="Deploy to $environment: $timestamp"
    print_color "$CYAN" "💾 Creating commit: $commit_message"
    git commit -m "$commit_message" || {
        print_color "$RED" "❌ Failed to create commit"
        exit 1
    }

    # Push changes
    print_color "$CYAN" "📤 Pushing to origin/$target_branch..."
    git push origin "$target_branch" || {
        print_color "$RED" "❌ Failed to push changes"
        exit 1
    }

    print_color "$GREEN" "✅ Successfully deployed to $environment environment!"
}

# Main script
set -e

# Get environment from command line or default to dev
environment=${1:-dev}

deploy_to_environment "$environment" 
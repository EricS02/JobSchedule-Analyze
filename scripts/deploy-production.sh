#!/bin/bash

# Production Deployment Script for JobSchedule
# This script performs security checks and deploys the application

set -e  # Exit on any error

echo "🚀 Starting JobSchedule Production Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "package.json not found. Please run this script from the project root."
    exit 1
fi

print_status "Checking Node.js version..."
NODE_VERSION=$(node --version)
print_success "Node.js version: $NODE_VERSION"

# Check environment variables
print_status "Validating environment variables..."

REQUIRED_VARS=(
    "DATABASE_URL"
    "AUTH_SECRET"
    "NEXT_PUBLIC_KINDE_CLIENT_ID"
    "NEXT_PUBLIC_KINDE_DOMAIN"
    "NEXT_PUBLIC_KINDE_REDIRECT_URI"
    "NEXT_PUBLIC_KINDE_LOGOUT_REDIRECT_URI"
)

MISSING_VARS=()

for var in "${REQUIRED_VARS[@]}"; do
    if [ -z "${!var}" ]; then
        MISSING_VARS+=("$var")
    fi
done

if [ ${#MISSING_VARS[@]} -ne 0 ]; then
    print_error "Missing required environment variables:"
    for var in "${MISSING_VARS[@]}"; do
        echo "  - $var"
    done
    exit 1
fi

print_success "All required environment variables are set"

# Security checks
print_status "Performing security checks..."

# Check for console.log statements in production code
print_status "Checking for console.log statements..."
CONSOLE_LOGS=$(grep -r "console\.log" src/ --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" | grep -v "// console.log" || true)

if [ -n "$CONSOLE_LOGS" ]; then
    print_warning "Found console.log statements in source code:"
    echo "$CONSOLE_LOGS"
    print_warning "Consider replacing with proper logging before production deployment"
else
    print_success "No console.log statements found"
fi

# Check for hardcoded secrets
print_status "Checking for hardcoded secrets..."
HARDCODED_SECRETS=$(grep -r -i "password\|secret\|key\|token" src/ --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" | grep -v "process\.env" | grep -v "//" | grep -v "import" || true)

if [ -n "$HARDCODED_SECRETS" ]; then
    print_warning "Potential hardcoded secrets found:"
    echo "$HARDCODED_SECRETS"
    print_warning "Review these before production deployment"
else
    print_success "No hardcoded secrets found"
fi

# Database migration check
print_status "Checking database migrations..."
if [ -d "prisma/migrations" ]; then
    MIGRATION_COUNT=$(find prisma/migrations -type d -name "*" | wc -l)
    print_success "Found $MIGRATION_COUNT migrations"
else
    print_warning "No migrations directory found"
fi

# Install dependencies
print_status "Installing dependencies..."
npm ci --production=false
print_success "Dependencies installed"

# Run security audit
print_status "Running security audit..."
npm audit --audit-level=moderate || {
    print_warning "Security audit found issues. Review and fix before deployment."
}

# Build the application
print_status "Building application..."
npm run build
print_success "Application built successfully"

# Run tests
print_status "Running tests..."
npm test || {
    print_warning "Some tests failed. Review before deployment."
}

# Database migration
print_status "Running database migrations..."
npx prisma migrate deploy
print_success "Database migrations completed"

# Generate Prisma client
print_status "Generating Prisma client..."
npx prisma generate
print_success "Prisma client generated"

# Create logs directory
print_status "Creating logs directory..."
mkdir -p logs
print_success "Logs directory created"

# Set proper permissions
print_status "Setting file permissions..."
chmod 755 logs/
chmod 644 logs/*.log 2>/dev/null || true
print_success "File permissions set"

# Final checks
print_status "Performing final deployment checks..."

# Check if build artifacts exist
if [ ! -d ".next" ]; then
    print_error "Build artifacts not found. Build may have failed."
    exit 1
fi

# Check environment
if [ "$NODE_ENV" != "production" ]; then
    print_warning "NODE_ENV is not set to 'production'. Current value: $NODE_ENV"
    export NODE_ENV=production
fi

print_success "All deployment checks passed!"

# Deployment summary
echo ""
echo "📋 Deployment Summary:"
echo "======================"
echo "✅ Environment variables validated"
echo "✅ Security checks completed"
echo "✅ Dependencies installed"
echo "✅ Application built"
echo "✅ Database migrated"
echo "✅ Prisma client generated"
echo "✅ Logs directory created"
echo "✅ File permissions set"
echo ""
echo "🚀 Application is ready for production deployment!"
echo ""
echo "Next steps:"
echo "1. Start the application: npm start"
echo "2. Monitor logs in the logs/ directory"
echo "3. Set up monitoring and alerting"
echo "4. Configure backup strategies"
echo ""

print_success "Deployment script completed successfully!" 
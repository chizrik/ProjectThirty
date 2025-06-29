#!/usr/bin/env pwsh
# ProjectThirty Deployment Script
# This script prepares the project for deployment to Vercel

Write-Host "🚀 Starting ProjectThirty deployment preparation..." -ForegroundColor Green

# Check if we're in the correct directory
if (!(Test-Path "package.json")) {
    Write-Host "❌ Error: package.json not found. Please run this script from the project root." -ForegroundColor Red
    exit 1
}

# Check if .env.local exists
if (!(Test-Path ".env.local")) {
    Write-Host "⚠️  Warning: .env.local not found. Please create it from .env.example" -ForegroundColor Yellow
    Write-Host "📋 Copy .env.example to .env.local and fill in your credentials" -ForegroundColor Yellow
}

# Install dependencies
Write-Host "📦 Installing dependencies..." -ForegroundColor Blue
npm install

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
    exit 1
}

# Run build to check for errors
Write-Host "🔨 Building project..." -ForegroundColor Blue
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed. Please fix errors before deploying." -ForegroundColor Red
    exit 1
}

# Initialize git if not already initialized
if (!(Test-Path ".git")) {
    Write-Host "🔧 Initializing git repository..." -ForegroundColor Blue
    git init
    git branch -M main
}

# Add all files to git
Write-Host "📝 Adding files to git..." -ForegroundColor Blue
git add .

# Commit changes
Write-Host "💾 Committing changes..." -ForegroundColor Blue
$commitMessage = "Deploy: Updated project for production deployment"
git commit -m $commitMessage

if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  No changes to commit or commit failed" -ForegroundColor Yellow
}

# Check if remote origin exists
$remoteExists = git remote get-url origin 2>$null
if (!$remoteExists) {
    Write-Host "⚠️  No git remote 'origin' found." -ForegroundColor Yellow
    Write-Host "📋 Please add your GitHub repository as origin:" -ForegroundColor Yellow
    Write-Host "   git remote add origin https://github.com/yourusername/your-repo.git" -ForegroundColor Cyan
    Write-Host "   git push -u origin main" -ForegroundColor Cyan
} else {
    Write-Host "⬆️  Pushing to GitHub..." -ForegroundColor Blue
    git push origin main
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Successfully pushed to GitHub!" -ForegroundColor Green
    } else {
        Write-Host "❌ Failed to push to GitHub" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "🎉 Deployment preparation complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next steps for Vercel deployment:" -ForegroundColor Yellow
Write-Host "1. Go to https://vercel.com/new" -ForegroundColor Cyan
Write-Host "2. Import your GitHub repository" -ForegroundColor Cyan
Write-Host "3. Add environment variables in Vercel dashboard:" -ForegroundColor Cyan
Write-Host "   - NEXT_PUBLIC_SUPABASE_URL" -ForegroundColor White
Write-Host "   - NEXT_PUBLIC_SUPABASE_ANON_KEY" -ForegroundColor White
Write-Host "   - GROQ_API_KEY" -ForegroundColor White
Write-Host "   - SUPABASE_SERVICE_KEY" -ForegroundColor White
Write-Host "4. Deploy!" -ForegroundColor Cyan
Write-Host ""
Write-Host "📚 Don't forget to run the complete-database-setup.sql in your Supabase dashboard!" -ForegroundColor Yellow
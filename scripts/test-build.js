#!/usr/bin/env node

/**
 * Build Test Script
 * Catches common Next.js build issues before deployment
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Load environment variables from .env.local
function loadEnvFile() {
  const envPath = path.join(process.cwd(), '.env.local');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const lines = envContent.split('\n');
    
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=');
        if (key && valueParts.length > 0) {
          process.env[key] = valueParts.join('=');
        }
      }
    }
  }
}

// Load environment variables
loadEnvFile();

// Colors for console output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkApiRoutes() {
  log('\n🔍 Checking API routes...', 'blue');
  
  const apiDir = path.join(process.cwd(), 'app', 'api');
  const issues = [];
  
  function checkDirectory(dir) {
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const itemPath = path.join(dir, item);
      const stat = fs.statSync(itemPath);
      
      if (stat.isDirectory()) {
        checkDirectory(itemPath);
      } else if (item === 'route.ts' || item === 'route.js') {
        const content = fs.readFileSync(itemPath, 'utf8');
        
        // Check for NextResponse usage without import
        if (content.includes('NextResponse') && !/import.*NextResponse/.test(content)) {
          issues.push(`${itemPath}: Uses NextResponse but missing import`);
        }
        
        // Check for module-level environment variable validation
        if (content.includes('throw new Error') && content.indexOf('export') > content.indexOf('throw new Error')) {
          issues.push(`${itemPath}: Has module-level error throwing that could break builds`);
        }
        
        // Check for proper error handling
        if (!content.includes('try {') || !content.includes('catch')) {
          issues.push(`${itemPath}: Missing proper error handling`);
        }
      }
    }
  }
  
  if (fs.existsSync(apiDir)) {
    checkDirectory(apiDir);
  }
  
  if (issues.length === 0) {
    log('✅ All API routes look good!', 'green');
  } else {
    log('❌ Found issues in API routes:', 'red');
    issues.forEach(issue => log(`  - ${issue}`, 'red'));
  }
  
  return issues.length === 0;
}

function checkEnvironmentVariables() {
  log('\n🔍 Checking environment variables...', 'blue');
  
  const requiredVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'SUPABASE_SERVICE_KEY',
    'GROQ_API_KEY'
  ];
  
  const missing = [];
  
  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      missing.push(varName);
    }
  }
  
  if (missing.length === 0) {
    log('✅ All required environment variables are set!', 'green');
  } else {
    log('⚠️  Missing environment variables (will cause runtime errors):', 'yellow');
    missing.forEach(varName => log(`  - ${varName}`, 'yellow'));
  }
  
  return missing.length === 0;
}

function runBuild() {
  log('\n🔨 Running Next.js build...', 'blue');
  
  try {
    execSync('npm run build', { stdio: 'inherit' });
    log('✅ Build completed successfully!', 'green');
    return true;
  } catch (error) {
    log('❌ Build failed!', 'red');
    return false;
  }
}

function runTypeCheck() {
  log('\n🔍 Running TypeScript check...', 'blue');
  
  try {
    execSync('npx tsc --noEmit', { stdio: 'inherit' });
    log('✅ TypeScript check passed!', 'green');
    return true;
  } catch (error) {
    log('❌ TypeScript check failed!', 'red');
    return false;
  }
}

async function main() {
  log('🚀 Starting build test...', 'blue');
  
  const results = {
    apiRoutes: checkApiRoutes(),
    envVars: checkEnvironmentVariables(),
    typeCheck: runTypeCheck(),
    build: runBuild()
  };
  
  log('\n📊 Test Results:', 'blue');
  Object.entries(results).forEach(([test, passed]) => {
    const status = passed ? '✅' : '❌';
    const color = passed ? 'green' : 'red';
    log(`  ${status} ${test}`, color);
  });
  
  const allPassed = Object.values(results).every(Boolean);
  
  if (allPassed) {
    log('\n🎉 All tests passed! Ready for deployment.', 'green');
    process.exit(0);
  } else {
    log('\n💥 Some tests failed. Please fix the issues before deploying.', 'red');
    process.exit(1);
  }
}

main().catch(error => {
  log(`\n💥 Test script failed: ${error.message}`, 'red');
  process.exit(1);
});
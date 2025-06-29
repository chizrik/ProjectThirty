# Build Troubleshooting Guide

## Common Next.js Build Errors and Solutions

### 1. "Failed to collect page data" Error

**Symptoms:**
- Build fails with `Error: Failed to collect page data for /api/[route-name]`
- Error occurs during `npm run build` step
- Works locally but fails in Vercel deployment

**Common Causes:**

#### Missing NextResponse Import
```typescript
// ❌ BAD - Missing import
export async function POST(request: Request) {
  return NextResponse.json({ data: 'test' }) // NextResponse not imported!
}

// ✅ GOOD - Proper import
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  return NextResponse.json({ data: 'test' })
}
```

#### Module-Level Error Throwing
```typescript
// ❌ BAD - Throws error at module load time
const apiKey = process.env.API_KEY
if (!apiKey) {
  throw new Error('Missing API key') // This breaks builds!
}

// ✅ GOOD - Handle errors in function
export async function POST(request: Request) {
  const apiKey = process.env.API_KEY
  if (!apiKey) {
    return NextResponse.json(
      { error: 'Server configuration error' },
      { status: 500 }
    )
  }
}
```

#### Improper Environment Variable Access
```typescript
// ❌ BAD - Can cause build-time errors
const config = {
  url: process.env.DATABASE_URL!, // Assertion can fail
  key: process.env.SECRET_KEY.substring(0, 10) // Can throw if undefined
}

// ✅ GOOD - Safe access with validation
export async function POST(request: Request) {
  const databaseUrl = process.env.DATABASE_URL
  const secretKey = process.env.SECRET_KEY
  
  if (!databaseUrl || !secretKey) {
    return NextResponse.json(
      { error: 'Server configuration error' },
      { status: 500 }
    )
  }
  
  // Use variables safely here
}
```

### 2. TypeScript Build Errors

**Common Issues:**
- Missing type imports
- Incorrect type annotations
- Unused variables in production builds

**Solutions:**
```typescript
// ✅ Proper type imports
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

// ✅ Proper error handling with types
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    // Handle request
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

### 3. Environment Variable Issues

**Best Practices:**

1. **Never access env vars at module level in API routes**
2. **Always validate env vars inside functions**
3. **Use proper error responses instead of throwing**

```typescript
// ✅ Recommended pattern for API routes
export async function POST(request: Request) {
  // Validate environment variables
  const requiredEnvVars = {
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
    supabaseKey: process.env.SUPABASE_SERVICE_KEY,
    apiKey: process.env.GROQ_API_KEY
  }
  
  const missingVars = Object.entries(requiredEnvVars)
    .filter(([_, value]) => !value)
    .map(([key]) => key)
  
  if (missingVars.length > 0) {
    console.error('Missing environment variables:', missingVars)
    return NextResponse.json(
      { error: 'Server configuration error' },
      { status: 500 }
    )
  }
  
  // Continue with API logic...
}
```

## Prevention Tools

### 1. Pre-Deployment Testing

Run the build test script before deploying:

```bash
# Test everything before deployment
npm run test-build

# Or run individual checks
npm run build
npx tsc --noEmit
```

### 2. Local Build Testing

```bash
# Test production build locally
npm run build
npm start

# Test with production environment
NODE_ENV=production npm run build
```

### 3. Environment Variable Validation

Create a `.env.example` file with all required variables:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_service_key
GROQ_API_KEY=your_groq_api_key
```

## Debugging Steps

### 1. Check Build Logs

Look for these patterns in build errors:
- `ReferenceError: NextResponse is not defined`
- `Error: Missing required environment variables`
- `TypeError: Cannot read property of undefined`

### 2. Verify API Route Structure

Each API route should follow this pattern:

```typescript
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    // Validate environment variables first
    const envVar = process.env.REQUIRED_VAR
    if (!envVar) {
      return NextResponse.json(
        { error: 'Configuration error' },
        { status: 500 }
      )
    }
    
    // Parse request
    const body = await request.json()
    
    // Validate request data
    if (!body.requiredField) {
      return NextResponse.json(
        { error: 'Missing required field' },
        { status: 400 }
      )
    }
    
    // Process request
    const result = await processRequest(body)
    
    return NextResponse.json(result)
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

### 3. Test Locally First

Always test these scenarios locally:

```bash
# Test with missing environment variables
unset GROQ_API_KEY
npm run dev
# Make API calls and verify error handling

# Test build process
npm run build

# Test production mode
npm start
```

## Vercel-Specific Considerations

### 1. Serverless Function Limits
- 50MB deployment size limit
- 10-second execution timeout
- No persistent file system

### 2. Environment Variables
- Set in Vercel dashboard
- Available at build time and runtime
- Use `NEXT_PUBLIC_` prefix for client-side variables

### 3. Build Configuration

Add to `next.config.mjs` if needed:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['@supabase/supabase-js']
  },
  // Ensure API routes are properly handled
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: '/api/:path*'
      }
    ]
  }
}

export default nextConfig
```

## Quick Fix Checklist

When you encounter build errors:

- [ ] Check all API routes have `import { NextResponse } from 'next/server'`
- [ ] Move environment variable validation inside functions
- [ ] Replace `throw new Error()` with proper error responses
- [ ] Ensure all async functions have proper error handling
- [ ] Verify TypeScript types are correct
- [ ] Test build locally with `npm run build`
- [ ] Check Vercel environment variables are set
- [ ] Review build logs for specific error messages

## Getting Help

If you're still experiencing issues:

1. Run `npm run test-build` to identify specific problems
2. Check the full build logs in Vercel dashboard
3. Test the specific API route locally
4. Verify all environment variables are properly set
5. Check for any recent changes that might have introduced the issue
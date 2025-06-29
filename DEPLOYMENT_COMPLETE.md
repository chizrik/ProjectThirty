# Complete Deployment Guide for ProjectThirty

## 🚀 Quick Start Deployment

### Prerequisites
- Node.js 18+ installed
- Git installed
- GitHub account
- Supabase account
- Groq account
- Vercel account

### Step 1: Database Setup
1. Go to your Supabase dashboard
2. Navigate to SQL Editor
3. Run the `complete-database-setup.sql` file
4. Verify tables are created successfully

### Step 2: Environment Variables
1. Copy `.env.example` to `.env.local`
2. Fill in all required values:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   GROQ_API_KEY=your_groq_api_key
   SUPABASE_SERVICE_KEY=your_supabase_service_role_key
   ```

### Step 3: Local Testing
```bash
npm install
npm run build
npm run dev
```

### Step 4: Deploy to Production

#### Option A: Automated Script (Windows)
```powershell
.\deploy.ps1
```

#### Option B: Manual Deployment
```bash
# Build and test
npm run build

# Initialize git (if not done)
git init
git branch -M main

# Add remote (replace with your repo)
git remote add origin https://github.com/yourusername/projectthirty.git

# Commit and push
git add .
git commit -m "Initial deployment"
git push -u origin main
```

### Step 5: Vercel Deployment
1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository
3. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `GROQ_API_KEY`
   - `SUPABASE_SERVICE_KEY`
4. Deploy!

## 🔧 Configuration Details

### Files Updated for Deployment
- ✅ `middleware.ts` - Fixed imports
- ✅ `app/layout.tsx` - Fixed Metadata import
- ✅ `.env.example` - Added all required variables
- ✅ `README.md` - Updated deployment instructions
- ✅ `deploy.ps1` - Created automated deployment script
- ✅ Removed unnecessary files (`test-supabase-connection.js`, `setup-database-simple.sql`)

### Project Structure
```
ProjectThirty/
├── app/                    # Next.js app directory
├── components/             # React components
├── lib/                    # Utility libraries
├── types/                  # TypeScript types
├── public/                 # Static assets
├── complete-database-setup.sql  # Database schema
├── deploy.ps1             # Deployment script
├── .env.example           # Environment template
└── README.md              # Project documentation
```

## 🛠️ Troubleshooting

### Common Issues

1. **Build Errors**
   - Check TypeScript errors: `npm run build`
   - Verify all imports are correct
   - Ensure environment variables are set

2. **Database Connection Issues**
   - Verify Supabase URL and keys
   - Check if database tables exist
   - Run `complete-database-setup.sql` if needed

3. **Deployment Failures**
   - Check Vercel build logs
   - Verify environment variables in Vercel dashboard
   - Ensure all dependencies are in `package.json`

### Environment Variable Checklist
- [ ] `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- [ ] `GROQ_API_KEY` - Groq API key for AI features
- [ ] `SUPABASE_SERVICE_KEY` - Supabase service role key

## 🎉 Post-Deployment

1. Test user registration and login
2. Create a test challenge
3. Verify AI challenge generation works
4. Check analytics dashboard
5. Test all major features

## 📞 Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review Vercel deployment logs
3. Check Supabase logs for database issues
4. Verify all environment variables are set correctly

---

**Ready to deploy!** 🚀
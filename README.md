# ChallengeCraft

A personalized SaaS web app that helps users generate, track, and complete custom 30-day challenges tailored to their goals using AI.

## Features

- 🔐 **Authentication & User Management**
  - Secure sign up/sign in with OAuth/email
  - Comprehensive user settings and profile management
  - Data persistence per user

- 🧠 **AI-Powered Challenge Generation**
  - Personalized 30-day plans using GPT-4o via Groq
  - Customizable goals, time commitments, and intensity levels
  - Smart task scheduling and progression

- 📅 **Interactive Challenge Dashboard**
  - Visual 6x5 grid progress tracking
  - Daily task management and completion
  - File upload proof system
  - AI-generated feedback and motivation

- 📊 **Analytics Dashboard**
  - Progress visualization
  - Performance metrics and trends
  - Motivation tracking

- ⚙️ **Advanced Settings**
  - Customizable notifications
  - Goal adjustments
  - Account management

- 🧑‍💼 **Admin Panel**
  - User activity monitoring
  - Challenge management
  - System analytics

## Tech Stack

- **Frontend**: Next.js, React, shadcn/ui, TailwindCSS
- **Backend**: Next.js API Routes
- **Database**: Supabase
- **Authentication**: Supabase Auth
- **AI**: Groq (GPT-4o)
- **File Storage**: Supabase Storage
- **Deployment**: Vercel

## Getting Started

1. Clone the repository:
```bash
git clone https://github.com/yourusername/challenge-craft.git
```

2. Install dependencies:
```bash
pnpm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Edit `.env.local` and add your credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
GROQ_API_KEY=your_groq_api_key
SUPABASE_SERVICE_KEY=your_supabase_service_role_key
```

Get Supabase credentials from your [Supabase Dashboard](https://app.supabase.com) → Project Settings → API
Get Groq API key from [Groq Console](https://console.groq.com/keys)

4. Run the development server:
```bash
pnpm dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Deployment

### Quick Deployment

Use the automated deployment script:
```bash
# Windows PowerShell
.\deploy.ps1

# Or manually:
npm run build
git add .
git commit -m "Deploy to production"
git push origin main
```

### Vercel Deployment

1. **Database Setup**: Run `complete-database-setup.sql` in your Supabase SQL Editor
2. Push your code to GitHub
3. Connect your repository to [Vercel](https://vercel.com)
4. Add environment variables in Vercel Dashboard:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `GROQ_API_KEY`
   - `SUPABASE_SERVICE_KEY`
5. Deploy automatically

**Important**: This app uses API routes and cannot be statically exported. The configuration is already set for Vercel serverless deployment.

### Environment Variables Required

- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anonymous key
- `GROQ_API_KEY`: Your Groq API key for AI challenge generation
- `SUPABASE_SERVICE_KEY`: Your Supabase service role key (for API routes)

**Security Note**: Never commit `.env.local` or expose service keys in client-side code.

## Docker Support

Run with Docker:
```bash
./run-docker.sh  # or run-docker.bat on Windows
```

## Contributing

Contributions are welcome! Please read our [Contributing Guidelines](CONTRIBUTING.md) for details.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
"# ProjectThirty"

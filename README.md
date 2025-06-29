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
# Add your Supabase and Groq API keys
```

4. Run the development server:
```bash
pnpm dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Docker Support

Run with Docker:
```bash
./run-docker.sh  # or run-docker.bat on Windows
```

## Contributing

Contributions are welcome! Please read our [Contributing Guidelines](CONTRIBUTING.md) for details.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

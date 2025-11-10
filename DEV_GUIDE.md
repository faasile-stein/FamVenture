# FamVenture - Development Guide

Complete guide for local development and CI/CD.

## 🚀 Quick Start (One Command)

```bash
npm run dev
```

This interactive script will:
1. Check all prerequisites (Node.js, Supabase CLI, Docker)
2. Install dependencies
3. Start Supabase services
4. Apply database migrations
5. Optionally load seed data
6. Start Expo development server

---

## 📋 Prerequisites

Before starting, make sure you have:

- **Node.js 18+** - [Download](https://nodejs.org/)
- **Docker Desktop** - [Download](https://www.docker.com/products/docker-desktop)
- **Supabase CLI** - `npm install -g supabase` or `brew install supabase/tap/supabase`
- **Expo CLI** - Automatically installed with dependencies

### Check Your Installation

```bash
node -v        # Should be v18 or higher
docker -v      # Should show Docker version
supabase -v    # Should show Supabase CLI version
```

---

## 🛠️ Available Scripts

### Main Development Scripts

```bash
# Complete setup + start (recommended for first time)
npm run dev

# Quick start (assumes setup is done)
npm run dev:start

# Stop all services
npm run dev:stop
```

### Expo Commands

```bash
# Start Expo dev server
npm start

# Run on iOS simulator
npm run ios

# Run on Android emulator
npm run android

# Run in web browser
npm run web
```

### Supabase Commands

```bash
# Start Supabase
npm run supabase:start

# Stop Supabase
npm run supabase:stop

# Check status
npm run supabase:status

# Reset database (apply migrations + seed)
npm run supabase:reset

# Open Supabase Studio
npm run supabase:studio
```

### Build Commands (EAS)

```bash
# Build for iOS
npm run build:ios

# Build for Android
npm run build:android

# Build for both platforms
npm run build:all

# Submit to App Store
npm run submit:ios

# Submit to Google Play
npm run submit:android
```

### Code Quality

```bash
# Type checking
npm run type-check

# Linting
npm run lint
```

---

## 📁 Project Structure for Development

```
FamVenture/
├── scripts/
│   ├── dev.sh              # Full setup script
│   ├── start.sh            # Quick start
│   └── stop.sh             # Stop services
├── .github/
│   └── workflows/
│       ├── expo-build.yml  # Build automation
│       └── ci.yml          # CI checks
├── supabase/
│   ├── migrations/         # Database migrations
│   ├── functions/          # Edge Functions
│   └── seed.sql           # Test data
└── ... (app code)
```

---

## 🔧 Manual Setup (Step by Step)

If you prefer manual setup instead of `npm run dev`:

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` and add your Supabase credentials:

```env
EXPO_PUBLIC_SUPABASE_URL=http://localhost:54321
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-key-here
```

### 3. Start Supabase

```bash
supabase start
```

This will output your local Supabase credentials. Copy them to `.env`.

### 4. Apply Migrations

```bash
supabase db reset
```

### 5. Load Seed Data (Optional)

```bash
psql -h localhost -p 54322 -d postgres -U postgres -f supabase/seed.sql
```

### 6. Start Expo

```bash
npm start
```

---

## 🧪 Testing the Setup

### 1. Verify Supabase

```bash
supabase status
```

You should see all services running:
- ✓ API running
- ✓ DB running
- ✓ Studio running
- ✓ Storage running

### 2. Open Supabase Studio

Visit: http://localhost:54323

- Check tables exist (families, profiles, chores, etc.)
- Create a test user in Authentication → Users

### 3. Test the App

```bash
npm start
```

- Press `i` for iOS or `a` for Android
- Sign up with test credentials
- Verify you can navigate between screens

---

## 🚢 CI/CD Setup

### GitHub Actions

Two workflows are configured:

#### 1. CI (Continuous Integration) - `.github/workflows/ci.yml`

**Triggers:**
- Push to `main`, `develop`, or `claude/**` branches
- Pull requests to `main` or `develop`

**Jobs:**
- ✓ Type checking (`tsc --noEmit`)
- ✓ Linting (`eslint`)
- ✓ Format checking (`prettier`)
- ✓ Build check (web export)
- ✓ Migration validation

#### 2. Build (Expo) - `.github/workflows/expo-build.yml`

**Triggers:**
- Push to `main` or `develop`
- Pull requests
- Manual trigger via GitHub UI (workflow_dispatch)

**Jobs:**
- Build iOS app
- Build Android app
- Submit to stores (production only)

**Manual Trigger:**
```
GitHub → Actions → Expo Build → Run workflow
```
Choose platform (iOS/Android/All) and profile (development/preview/production).

---

## 🔐 GitHub Secrets Setup

For CI/CD to work, add these secrets in GitHub:

**Settings → Secrets and variables → Actions → New repository secret**

### Required Secrets:

```
EXPO_TOKEN                          # Expo access token
EXPO_APPLE_ID                       # Apple ID for App Store
EXPO_APPLE_APP_SPECIFIC_PASSWORD    # App-specific password
EXPO_APPLE_TEAM_ID                  # Apple Team ID
EXPO_ASC_APP_ID                     # App Store Connect App ID
EXPO_ANDROID_SERVICE_ACCOUNT_KEY    # Google Play service account JSON
```

### Getting Expo Token:

```bash
npx expo login
npx expo whoami
npx eas login
npx eas build:configure
# Token will be in ~/.expo/state.json or create one:
npx expo token:create
```

---

## 📱 Building the App

### Local Builds (Development)

```bash
# iOS
eas build --profile development --platform ios

# Android
eas build --profile development --platform android
```

### Preview Builds (Internal Testing)

```bash
# iOS (TestFlight)
npm run build:ios -- --profile preview

# Android (APK)
npm run build:android -- --profile preview
```

### Production Builds

```bash
# Both platforms
npm run build:all -- --profile production
```

---

## 🐛 Troubleshooting

### Supabase Won't Start

```bash
# Check Docker is running
docker ps

# Reset Supabase
supabase stop
docker system prune -a
supabase start
```

### Expo Won't Start

```bash
# Clear cache
npx expo start -c

# Reset node_modules
rm -rf node_modules
npm install
```

### Port Already in Use

```bash
# Check what's using the port
lsof -i :8081  # Expo default port
lsof -i :54321 # Supabase API

# Kill the process
kill -9 <PID>
```

### Database Migration Issues

```bash
# Reset database completely
supabase db reset

# Or manually apply migrations
supabase migration repair
supabase db push
```

### Environment Variables Not Loading

```bash
# Make sure .env exists
ls -la .env

# Restart Expo after changing .env
npm start -- --reset-cache
```

---

## 🔄 Development Workflow

### Daily Development

```bash
# Morning: Start everything
npm run dev:start

# Work on features...

# Evening: Stop everything
npm run dev:stop
```

### Making Changes

1. **Code Changes**: Hot reload will pick up most changes
2. **Database Changes**:
   - Create new migration: `supabase migration new feature_name`
   - Edit SQL in `supabase/migrations/`
   - Apply: `npm run supabase:reset`
3. **Environment Changes**: Restart Expo with cache clear

### Testing Changes

```bash
# Type check
npm run type-check

# Lint
npm run lint

# Test on both platforms
npm run ios
npm run android
```

---

## 📦 Release Process

### 1. Update Version

Edit `app.json`:
```json
{
  "expo": {
    "version": "1.1.0"
  }
}
```

### 2. Build

```bash
npm run build:all -- --profile production
```

### 3. Test Build

Download from EAS and test thoroughly.

### 4. Submit

```bash
npm run submit:ios
npm run submit:android
```

### 5. Create Git Tag

```bash
git tag -a v1.1.0 -m "Release v1.1.0"
git push origin v1.1.0
```

---

## 🌐 Environment Variables Reference

### Local Development (.env)

```env
# Supabase
EXPO_PUBLIC_SUPABASE_URL=http://localhost:54321
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-local-anon-key

# Optional
EXPO_PUBLIC_SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
CRON_SECRET=your-cron-secret
```

### Production

Configure in EAS:
```bash
eas secret:create --name EXPO_PUBLIC_SUPABASE_URL --value https://your-project.supabase.co
eas secret:create --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value your-production-anon-key
```

---

## 🎯 Common Tasks

### Add a New Screen

1. Create file in `app/` directory
2. Add route in `app/_layout.tsx` or `app/(tabs)/_layout.tsx`
3. Import and use in navigation

### Add a New Database Table

1. Create migration:
   ```bash
   supabase migration new add_table_name
   ```

2. Edit `supabase/migrations/[timestamp]_add_table_name.sql`

3. Apply:
   ```bash
   npm run supabase:reset
   ```

4. Update TypeScript types in `src/types/database.types.ts`

### Add a New Edge Function

1. Create directory:
   ```bash
   mkdir -p supabase/functions/my-function
   ```

2. Create `index.ts`:
   ```typescript
   import { corsHeaders } from '../_shared/cors.ts'

   Deno.serve(async (req) => {
     // Your logic here
   })
   ```

3. Deploy:
   ```bash
   supabase functions deploy my-function
   ```

---

## 📊 Monitoring and Logs

### Supabase Logs

```bash
# All logs
supabase logs

# Specific service
supabase logs api
supabase logs db
```

### Expo Logs

Logs appear in terminal where `npm start` is running.

### Edge Function Logs

```bash
# Local testing
supabase functions serve my-function --debug

# Production (via Supabase Dashboard)
# Go to Edge Functions → Function Name → Logs
```

---

## 🤝 Team Development

### Branch Strategy

- `main` - Production releases
- `develop` - Development branch
- `feature/*` - Feature branches
- `claude/*` - AI-assisted development branches

### Pull Request Process

1. Create feature branch from `develop`
2. Make changes
3. Push and create PR
4. CI runs automatically
5. Review and merge

### Code Review Checklist

- [ ] Types check pass
- [ ] Linting passes
- [ ] No console.logs left
- [ ] Migration tested locally
- [ ] Tested on both iOS and Android
- [ ] No hardcoded credentials

---

## 📚 Additional Resources

- [Expo Documentation](https://docs.expo.dev/)
- [Supabase Documentation](https://supabase.com/docs)
- [React Native Documentation](https://reactnavigation.org/)
- [EAS Build Documentation](https://docs.expo.dev/build/introduction/)

---

## 🆘 Getting Help

1. **Check logs**: `supabase status` and Expo terminal
2. **Search docs**: Most issues are documented
3. **GitHub Issues**: Create an issue with logs
4. **Community**: Expo Discord / Supabase Discord

---

## 🎉 You're Ready!

Start developing with:

```bash
npm run dev
```

Happy coding! 🚀

# FamVenture 🏡

> A gamified family chore planner where everyone participates, competes, and wins together!

[![CI](https://github.com/faasile-stein/FamVenture/actions/workflows/ci.yml/badge.svg)](https://github.com/faasile-stein/FamVenture/actions/workflows/ci.yml)
[![Expo Build](https://github.com/faasile-stein/FamVenture/actions/workflows/expo-build.yml/badge.svg)](https://github.com/faasile-stein/FamVenture/actions/workflows/expo-build.yml)

Built with **Expo (React Native)** and **Supabase**. Cross-platform for iOS, Android, and Web.

---

## ✨ Features

- 🎮 **Gamified chores** - Points, levels, streaks, and badges
- 👨‍👩‍👧‍👦 **Everyone participates** - Parents can compete too!
- 🏆 **Leaderboard** - Week/Month/All-time rankings
- 🎯 **Family goals** - Work together toward shared rewards
- ⚡ **Overdue bonus** - Earn 2-3x points for late chores
- 💰 **Cash-out option** - Time-based chores can earn money
- 📸 **Proof photos** - Upload evidence of completed work
- ✅ **Approval workflow** - Parents review and approve chores
- 🔔 **Smart reminders** - Never miss a chore (coming soon)
- 📊 **Progress tracking** - See stats, streaks, and achievements

---

## 🚀 Quick Start

### One-Line Setup

```bash
npm run dev
```

This interactive script will:
1. ✓ Check prerequisites
2. ✓ Install dependencies
3. ✓ Start Supabase
4. ✓ Apply migrations
5. ✓ Load test data
6. ✓ Start Expo

Then open the app on your phone or simulator!

### Manual Setup

See [DEV_GUIDE.md](./DEV_GUIDE.md) for detailed instructions.

---

## 📋 Prerequisites

- **Node.js 18+** - [Download](https://nodejs.org/)
- **Docker** - [Download](https://www.docker.com/products/docker-desktop)
- **Expo Go** app on your phone (iOS/Android)

The dev script will guide you through installing:
- Supabase CLI
- Expo CLI

---

## 📱 Screenshots

> Add screenshots here once app is running

---

## 🎯 How It Works

### For Children (and Parents!)

1. **Browse Chores** - See available chores you can claim
2. **Claim & Complete** - Work on chores and submit proof
3. **Earn Rewards** - Get points (or cash!) when approved
4. **Compete** - Climb the leaderboard
5. **Level Up** - Unlock new levels and badges

### For Parents

- All child features +
- **Create chores** - Set up one-time or recurring chores
- **Review submissions** - Approve or reject with feedback
- **Manage family** - Add members, set goals, configure settings
- **Track progress** - Monitor everyone's stats and achievements

---

## 🧬 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Expo (React Native), TypeScript |
| **Navigation** | Expo Router (file-based) |
| **State** | TanStack Query, Zustand |
| **Backend** | Supabase (PostgreSQL + Auth + Storage + Edge Functions) |
| **Deployment** | EAS Build, GitHub Actions |

---

## 📚 Documentation

- **[README_SETUP.md](./README_SETUP.md)** - Complete setup and testing guide
- **[DEV_GUIDE.md](./DEV_GUIDE.md)** - Development workflows and scripts
- **[TESTING_CHECKLIST.md](./TESTING_CHECKLIST.md)** - 200+ test cases
- **[PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md)** - Architecture and features
- **[.github/CICD_SETUP.md](./.github/CICD_SETUP.md)** - CI/CD configuration

---

## 🛠️ Available Commands

### Development

```bash
npm run dev              # Full setup + start (first time)
npm run dev:start        # Quick start (already set up)
npm run dev:stop         # Stop all services
npm start                # Start Expo only
```

### Building

```bash
npm run build:ios        # Build for iOS
npm run build:android    # Build for Android
npm run build:all        # Build for both platforms
```

### Supabase

```bash
npm run supabase:start   # Start Supabase
npm run supabase:stop    # Stop Supabase
npm run supabase:reset   # Reset database
npm run supabase:studio  # Open Supabase Studio
```

### Code Quality

```bash
npm run type-check       # TypeScript checking
npm run lint             # ESLint
```

---

## 🔐 Security

- **Row Level Security (RLS)** - Family-based data isolation
- **Role-based permissions** - Parent vs. child access control
- **Secure authentication** - Supabase Auth with JWT
- **Environment variables** - Credentials never committed
- **Audit trail** - All approvals logged

---

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Development Guidelines

- TypeScript required
- Follow existing code style
- Add tests for new features
- Update documentation
- Test on both iOS and Android

---

## 🧪 Testing

### Run Tests

```bash
npm run type-check       # Type checking
npm run lint             # Linting
```

### Manual Testing

See [TESTING_CHECKLIST.md](./TESTING_CHECKLIST.md) for comprehensive test cases.

### Test Data

Load seed data:
```bash
npm run supabase:reset
psql -h localhost -p 54322 -d postgres -U postgres -f supabase/seed.sql
```

---


## 🚢 Build & Publish

### Quick Setup (3 steps)

```bash
# 1. Set up EAS for building
npm run setup:eas

# 2. Add EXPO_TOKEN to GitHub Secrets
# (token shown after step 1)

# 3. Push to trigger automatic build
git push origin main
```

**That's it!** Builds will automatically create and deploy.

### Build Locally

```bash
# Preview build (testing)
npm run build:preview

# Production build (store release)
npm run build:production
```

### Submit to Stores

```bash
# Automatic (via GitHub Actions)
git push origin main

# Manual
npm run submit:ios         # iOS App Store
npm run submit:android     # Google Play
npm run submit:all         # Both stores
```

### Complete Guide

See **[BUILD_AND_PUBLISH.md](./BUILD_AND_PUBLISH.md)** for:
- Detailed EAS setup
- GitHub Secrets configuration
- Apple & Google Play setup
- Testing & monitoring
- Troubleshooting
- Release workflow

---
---

## 📊 Project Status

**Current Version:** 1.0.0 (MVP)

### ✅ Completed
- Authentication & user management
- Chore creation and management
- Claim → Submit → Approve workflow
- Overdue bonus system
- Leaderboard with rankings
- Family goals
- Parent participation
- Points, levels, streaks
- Database schema & migrations
- Edge Functions
- CI/CD pipelines

### 🚧 In Progress
- Photo upload UI
- Push notifications
- Recurring chore automation
- Badge award logic

### 📋 Planned
- Chore templates
- Family analytics
- Multi-language support
- Reward redemption system
- Social features

---

## 📄 License

MIT License - See [LICENSE](./LICENSE) for details.

---

## 🙏 Acknowledgments

- [Expo](https://expo.dev/) - Amazing React Native framework
- [Supabase](https://supabase.com/) - Open-source Firebase alternative
- [React Native](https://reactnavigation.org/) - Mobile UI framework

---

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/faasile-stein/FamVenture/issues)
- **Documentation**: See [DEV_GUIDE.md](./DEV_GUIDE.md)
- **Email**: support@famventure.app (placeholder)

---

## 🌟 Star This Repo

If you find FamVenture useful, please consider giving it a ⭐ on GitHub!

---

**Made with ❤️ for families who want to make chores fun!**

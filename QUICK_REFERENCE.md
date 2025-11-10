# FamVenture - Quick Reference Card

Handy commands for daily development and deployment.

---

## 🚀 First Time Setup

```bash
# 1. Clone and install
git clone https://github.com/faasile-stein/FamVenture
cd FamVenture
npm install

# 2. Set up local development
npm run dev

# 3. Set up EAS for building
npm run setup:eas
```

---

## 💻 Development

```bash
# Start everything (first time)
npm run dev

# Quick start (already set up)
npm run dev:start

# Stop everything
npm run dev:stop

# Just Expo
npm start
npm run ios
npm run android
```

---

## 🗄️ Supabase

```bash
npm run supabase:start    # Start Supabase
npm run supabase:stop     # Stop Supabase
npm run supabase:status   # Check status
npm run supabase:reset    # Reset database
npm run supabase:studio   # Open Studio UI
```

---

## 🏗️ Building

```bash
# Preview builds (testing)
npm run build:preview

# Production builds (store release)
npm run build:production

# Specific platform
npm run build:ios
npm run build:android
npm run build:all
```

---

## 🚢 Publishing

```bash
# Submit to stores
npm run submit:ios         # iOS only
npm run submit:android     # Android only
npm run submit:all         # Both stores

# Or via GitHub Actions
git push origin main       # Auto-build & deploy
```

---

## 🔍 Monitoring

```bash
# View builds
eas build:list
eas build:view [build-id]

# Download builds
eas build:download [build-id]

# Check project
eas project:info
```

---

## ✅ Code Quality

```bash
npm run type-check    # TypeScript
npm run lint          # ESLint
```

---

## 📱 Testing

```bash
# Local testing
npm start
# Then press 'i' for iOS, 'a' for Android

# Reset cache
npm start -- --reset-cache

# Clear everything
rm -rf node_modules
npm install
```

---

## 🔐 Credentials

```bash
# EAS credentials
eas credentials

# Create new token
eas auth:token:create

# Check login
eas whoami
```

---

## 🆘 Common Issues

### Supabase won't start
```bash
docker ps                # Check Docker
supabase stop
docker system prune -a
supabase start
```

### Build fails
```bash
# Clear EAS credentials
eas credentials

# Regenerate token
eas auth:token:create
# Update EXPO_TOKEN in GitHub Secrets
```

### App won't start
```bash
# Clear cache
npm start -- --reset-cache

# Reinstall
rm -rf node_modules
npm install
```

---

## 📚 Documentation

- **[README.md](./README.md)** - Project overview
- **[DEV_GUIDE.md](./DEV_GUIDE.md)** - Development guide
- **[BUILD_AND_PUBLISH.md](./BUILD_AND_PUBLISH.md)** - Build & publish guide
- **[TESTING_CHECKLIST.md](./TESTING_CHECKLIST.md)** - Testing guide
- **[.github/CICD_SETUP.md](./.github/CICD_SETUP.md)** - CI/CD setup

---

## 🎯 Release Checklist

- [ ] Update version in `app.json`
- [ ] Update `CHANGELOG.md`
- [ ] Run `npm run type-check`
- [ ] Run `npm run lint`
- [ ] Test on iOS device
- [ ] Test on Android device
- [ ] Commit changes
- [ ] Push to `main` (triggers build)
- [ ] Monitor build in GitHub Actions
- [ ] Test downloaded builds
- [ ] Submit to stores
- [ ] Create git tag: `git tag v1.x.x`

---

## 🌐 Important URLs

- **Expo Dashboard:** https://expo.dev
- **Supabase Dashboard:** https://supabase.com/dashboard
- **App Store Connect:** https://appstoreconnect.apple.com
- **Google Play Console:** https://play.google.com/console
- **GitHub Actions:** https://github.com/YOUR_USERNAME/FamVenture/actions

---

## 💡 Pro Tips

- Use `npm run dev` for first-time setup
- Use `npm run dev:start` for daily work
- Push to `main` for auto-deployment
- Use preview builds before production
- Keep `EXPO_TOKEN` secret fresh
- Test on real devices, not just simulators
- Monitor crash reports after release

---

**Need help?** See [BUILD_AND_PUBLISH.md](./BUILD_AND_PUBLISH.md) for detailed instructions.

# Build and Publish Guide for FamVenture

Complete guide to building and publishing FamVenture to the App Store and Google Play using GitHub Actions.

---

## 🚀 Quick Start (3 Steps)

### Step 1: Set Up EAS

```bash
npm run setup:eas
```

This interactive script will:
- ✓ Log you into Expo/EAS
- ✓ Create/link EAS project
- ✓ Generate access token
- ✓ Update app.json
- ✓ Optionally run test build

### Step 2: Add GitHub Secrets

Copy the token from Step 1 and add it to GitHub:

**Settings → Secrets and variables → Actions → New repository secret**

Name: `EXPO_TOKEN`
Value: (paste the token)

### Step 3: Trigger Build

**Option A: Automatic (push to main/develop)**
```bash
git push origin main
```

**Option B: Manual (GitHub UI)**
1. Go to GitHub → Actions
2. Select "Expo Build and Deploy"
3. Click "Run workflow"
4. Choose platform and profile
5. Click "Run workflow"

---

## 📋 Complete Setup Guide

### Prerequisites

- [ ] Expo account ([expo.dev](https://expo.dev))
- [ ] GitHub account with repo access
- [ ] Apple Developer account (for iOS)
- [ ] Google Play Developer account (for Android)
- [ ] EAS CLI installed (`npm install -g eas-cli`)

---

## 🔧 Step-by-Step Setup

### 1. Initial EAS Configuration

Run the setup script:

```bash
chmod +x scripts/setup-eas.sh
npm run setup:eas
```

Or manually:

```bash
# Login to Expo
npx expo login

# Login to EAS
eas login

# Configure EAS
eas build:configure

# Create/link project
eas project:init

# Generate token
eas auth:token:create
```

**Save the token** - you'll need it for GitHub!

---

### 2. Configure GitHub Secrets

#### Required Secret (for all builds):

**`EXPO_TOKEN`**
- Go to: [Generate token](https://expo.dev/accounts/[username]/settings/access-tokens)
- Or run: `eas auth:token:create`
- Copy the token
- Add to GitHub Secrets

#### Optional Secrets (for iOS):

<details>
<summary><b>Click to expand iOS setup</b></summary>

**`EXPO_APPLE_ID`**
- Your Apple ID email (e.g., `developer@example.com`)

**`EXPO_APPLE_APP_SPECIFIC_PASSWORD`**
1. Go to [appleid.apple.com](https://appleid.apple.com)
2. Sign In
3. Security → App-Specific Passwords
4. Generate password for "FamVenture CI/CD"
5. Copy the password (format: `xxxx-xxxx-xxxx-xxxx`)

**`EXPO_APPLE_TEAM_ID`**
1. Go to [developer.apple.com/account](https://developer.apple.com/account)
2. Membership section
3. Find Team ID (e.g., `ABC123XYZ`)

**`EXPO_ASC_APP_ID`**
1. Go to [App Store Connect](https://appstoreconnect.apple.com)
2. My Apps → Create app (if not exists)
3. App Information → Apple ID
4. Copy the numeric ID (e.g., `1234567890`)

</details>

#### Optional Secrets (for Android):

<details>
<summary><b>Click to expand Android setup</b></summary>

**`EXPO_ANDROID_SERVICE_ACCOUNT_KEY`**

1. **Create Service Account:**
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Create project or select existing
   - Enable "Google Play Android Developer API"
   - IAM & Admin → Service Accounts → Create
   - Name: `famventure-publisher`
   - Grant role: "Service Account User"

2. **Create JSON Key:**
   - Click on service account
   - Keys tab → Add Key → JSON
   - Download the JSON file

3. **Link to Play Console:**
   - [Google Play Console](https://play.google.com/console)
   - Setup → API access
   - Link service account
   - Grant permissions: "Release manager" + "View app information"

4. **Add to GitHub:**
   ```bash
   # Copy entire JSON content
   cat service-account.json
   ```
   - Paste entire JSON as secret value

</details>

---

### 3. Verify Setup

Check your configuration:

```bash
# Verify EAS login
eas whoami

# Check project
eas project:info

# List credentials
eas credentials
```

---

## 🏗️ Building the App

### Local Builds (Testing)

```bash
# Development build (iOS simulator)
eas build --profile development --platform ios

# Development build (Android APK)
eas build --profile development --platform android

# Both platforms
eas build --profile development --platform all
```

### Preview Builds (Internal Testing)

```bash
# iOS (TestFlight ready)
eas build --profile preview --platform ios

# Android (APK for testing)
eas build --profile preview --platform android

# Both
eas build --profile preview --platform all
```

### Production Builds (Store Release)

```bash
# iOS (App Store)
eas build --profile production --platform ios

# Android (Google Play)
eas build --profile production --platform android

# Both
eas build --profile production --platform all
```

---

## 🚀 Using GitHub Actions

### Automatic Builds

Builds trigger automatically when you push to `main` or `develop`:

```bash
# Commit your changes
git add .
git commit -m "Ready for build"

# Push to trigger build
git push origin main
```

The workflow will:
1. ✓ Run type checking
2. ✓ Run linting
3. ✓ Build iOS app
4. ✓ Build Android app
5. ✓ Upload artifacts

### Manual Builds

Trigger builds manually from GitHub:

1. **Go to GitHub Actions:**
   ```
   https://github.com/YOUR_USERNAME/FamVenture/actions
   ```

2. **Select "Expo Build and Deploy"**

3. **Click "Run workflow"**

4. **Choose options:**
   - Branch: `main` or `develop`
   - Platform: `ios`, `android`, or `all`
   - Profile: `development`, `preview`, or `production`

5. **Click "Run workflow"**

6. **Monitor progress** in Actions tab

### View Build Results

```bash
# List all builds
eas build:list

# View specific build
eas build:view [build-id]

# Download build
eas build:download [build-id]
```

Or check in [Expo Dashboard](https://expo.dev/accounts/[username]/projects/famventure/builds)

---

## 📱 Publishing to Stores

### iOS - App Store

#### First Time Setup:

1. **Create App in App Store Connect:**
   - Go to [App Store Connect](https://appstoreconnect.apple.com)
   - My Apps → + → New App
   - Fill in app information
   - Note the Apple ID

2. **Build and Submit:**

**Via GitHub Actions (Automatic):**
- Push to `main` with `production` profile
- Submission happens automatically

**Via Command Line (Manual):**
```bash
# Build production
eas build --profile production --platform ios

# Submit to App Store
eas submit --platform ios --latest
```

3. **Review in App Store Connect:**
   - Wait for processing (10-30 minutes)
   - Fill in app details
   - Submit for review

#### Updates:

```bash
# Increment version in app.json
# "version": "1.0.1"

# Build and submit
eas build --profile production --platform ios
eas submit --platform ios --latest
```

---

### Android - Google Play

#### First Time Setup:

1. **Create App in Google Play Console:**
   - Go to [Google Play Console](https://play.google.com/console)
   - All apps → Create app
   - Fill in details
   - Set up store listing

2. **Build and Submit:**

**Via GitHub Actions (Automatic):**
- Push to `main` with `production` profile
- Submission happens automatically

**Via Command Line (Manual):**
```bash
# Build production
eas build --profile production --platform android

# Submit to Google Play
eas submit --platform android --latest
```

3. **Review in Play Console:**
   - Select release track (Internal/Alpha/Beta/Production)
   - Review and rollout

#### Updates:

```bash
# Increment version in app.json
# "version": "1.0.1"

# Build and submit
eas build --profile production --platform android
eas submit --platform android --latest
```

---

## 🔄 Complete Release Workflow

### 1. Prepare Release

```bash
# Update version
# Edit app.json: "version": "1.1.0"

# Update changelog
# Edit CHANGELOG.md

# Commit changes
git add app.json CHANGELOG.md
git commit -m "chore: bump version to 1.1.0"
```

### 2. Build

**Option A: Automatic (via GitHub)**
```bash
git push origin main
```

**Option B: Manual**
```bash
eas build --profile production --platform all
```

### 3. Test

Download and test the build:

```bash
# Download iOS build
eas build:download [ios-build-id]

# Download Android build
eas build:download [android-build-id]

# Install and test on real devices
```

### 4. Submit

**Automatic (via GitHub):**
- Already submitted if pushed to `main` with production profile

**Manual:**
```bash
eas submit --platform ios --latest
eas submit --platform android --latest
```

### 5. Monitor

- Check App Store Connect / Google Play Console
- Monitor crash reports
- Watch user feedback

### 6. Tag Release

```bash
git tag -a v1.1.0 -m "Release v1.1.0"
git push origin v1.1.0
```

---

## 🐛 Troubleshooting

### Build Fails: "Invalid credentials"

**Solution:**
```bash
# Generate new token
eas auth:token:create

# Update GitHub Secret
# Replace EXPO_TOKEN with new value
```

### Build Fails: "Project not configured"

**Solution:**
```bash
# Re-run EAS configuration
eas build:configure

# Ensure app.json has projectId
# Check "extra.eas.projectId" exists
```

### iOS Build Fails: "Provisioning profile error"

**Solution:**
```bash
# Clear credentials
eas credentials

# Select iOS → Distribution
# Remove and recreate certificates
```

### Android Build Fails: "Keystore error"

**Solution:**
```bash
# Create new keystore
eas credentials

# Select Android → Build Credentials
# Create new keystore
```

### Submission Fails: "Invalid build"

**Solution:**
- Ensure build completed successfully
- Check build ID is correct
- Verify app exists in store console
- Check store console for specific errors

### GitHub Action Fails: "EXPO_TOKEN not found"

**Solution:**
- Verify secret is named exactly `EXPO_TOKEN`
- Check secret is set in correct repository
- Regenerate token if expired

---

## 📊 Monitoring Builds

### Check Build Status

**Via CLI:**
```bash
# List recent builds
eas build:list

# View specific build
eas build:view [build-id]

# Check logs
eas build:view [build-id] --json
```

**Via Dashboard:**
- Go to [expo.dev/accounts/[username]/projects/famventure/builds](https://expo.dev)
- View all builds
- Download builds
- See logs

**Via GitHub Actions:**
- Go to Actions tab
- View workflow runs
- Download artifacts
- See build logs

---

## 🔐 Security Best Practices

### Secrets Management

- ✅ Rotate tokens every 90 days
- ✅ Use app-specific passwords (not main Apple ID password)
- ✅ Store service account JSON securely
- ✅ Use different credentials for dev/prod
- ✅ Enable 2FA on all accounts

### Access Control

- ✅ Limit who can trigger production builds
- ✅ Use branch protection on `main`
- ✅ Require reviews for production merges
- ✅ Use environment-specific secrets

---

## 📈 Advanced Configuration

### Custom Build Steps

Edit `.github/workflows/expo-build.yml`:

```yaml
- name: Run tests before build
  run: npm test

- name: Generate release notes
  run: ./scripts/generate-changelog.sh
```

### Conditional Submission

Only submit on certain conditions:

```yaml
- name: Submit to stores
  if: github.ref == 'refs/heads/main' && contains(github.event.head_commit.message, '[release]')
  run: |
    eas submit --platform ios --latest --non-interactive
    eas submit --platform android --latest --non-interactive
```

### Multi-Environment Builds

Create different profiles for staging/production:

```json
// eas.json
{
  "build": {
    "staging": {
      "env": {
        "EXPO_PUBLIC_API_URL": "https://staging-api.famventure.app"
      }
    },
    "production": {
      "env": {
        "EXPO_PUBLIC_API_URL": "https://api.famventure.app"
      }
    }
  }
}
```

---

## 📋 Pre-Release Checklist

Before releasing to production:

### Code Quality
- [ ] All tests pass
- [ ] No TypeScript errors
- [ ] Linting passes
- [ ] Code reviewed

### Version & Documentation
- [ ] Version bumped in `app.json`
- [ ] Changelog updated
- [ ] Release notes written

### Testing
- [ ] Tested on iOS device
- [ ] Tested on Android device
- [ ] Tested on multiple screen sizes
- [ ] Tested offline functionality
- [ ] Tested with production API

### Store Assets
- [ ] Screenshots updated (if UI changed)
- [ ] App icons correct
- [ ] Privacy policy reviewed
- [ ] Terms of service current

### Backend
- [ ] Database migrations tested
- [ ] API endpoints verified
- [ ] Supabase functions deployed
- [ ] Environment variables set

### Compliance
- [ ] Privacy policy compliant
- [ ] COPPA compliance (for kids)
- [ ] GDPR compliance (if EU users)

---

## 🎓 Resources

- [EAS Build Documentation](https://docs.expo.dev/build/introduction/)
- [EAS Submit Documentation](https://docs.expo.dev/submit/introduction/)
- [App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [Google Play Policies](https://play.google.com/about/developer-content-policy/)
- [Expo Status](https://status.expo.dev/)

---

## 🆘 Getting Help

If you encounter issues:

1. **Check EAS Status:** [status.expo.dev](https://status.expo.dev)
2. **View Build Logs:** `eas build:view [build-id]`
3. **Check GitHub Actions Logs:** Actions tab in GitHub
4. **Search Forums:** [forums.expo.dev](https://forums.expo.dev)
5. **Ask Community:** [Discord](https://discord.gg/expo)

---

## ✅ Success!

You're now ready to build and publish FamVenture!

**Quick Commands:**

```bash
# Set up EAS (first time)
npm run setup:eas

# Build preview
eas build --profile preview --platform all

# Build production
eas build --profile production --platform all

# Submit to stores
eas submit --platform all --latest

# Or just push to main!
git push origin main
```

**Happy shipping! 🚀**

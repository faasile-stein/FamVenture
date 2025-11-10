# CI/CD Setup Guide for FamVenture

Complete guide to setting up automated builds and deployments with GitHub Actions and Expo Application Services (EAS).

---

## 📋 Overview

FamVenture uses two GitHub Actions workflows:

1. **CI Workflow** (`.github/workflows/ci.yml`) - Runs on every push/PR
   - Type checking
   - Linting
   - Build verification
   - Migration validation

2. **Build Workflow** (`.github/workflows/expo-build.yml`) - Builds apps
   - iOS builds
   - Android builds
   - Automatic submission to stores (production only)

---

## 🚀 Quick Setup (5 Steps)

### Step 1: Create Expo Account

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
npx expo login

# Create Expo project
npx eas build:configure
```

This creates/updates `eas.json` with your project configuration.

### Step 2: Get Expo Access Token

```bash
# Generate token
npx expo token:create

# Copy the token - you'll need it for GitHub Secrets
```

Save this token - it's shown only once!

### Step 3: Configure EAS Project

Update `app.json` with your project details:

```json
{
  "expo": {
    "name": "FamVenture",
    "slug": "famventure",
    "extra": {
      "eas": {
        "projectId": "your-project-id-here"
      }
    }
  }
}
```

Get your project ID:
```bash
npx eas project:info
```

### Step 4: Add GitHub Secrets

Go to your GitHub repository:
**Settings → Secrets and variables → Actions → New repository secret**

Add these secrets:

#### Required for Builds:
```
EXPO_TOKEN
```
Value: The token from Step 2

#### Required for iOS Submission:
```
EXPO_APPLE_ID
EXPO_APPLE_APP_SPECIFIC_PASSWORD
EXPO_APPLE_TEAM_ID
EXPO_ASC_APP_ID
```

#### Required for Android Submission:
```
EXPO_ANDROID_SERVICE_ACCOUNT_KEY
```

### Step 5: Trigger Your First Build

```bash
# Push to main or develop
git push origin main

# Or trigger manually
# Go to GitHub → Actions → Expo Build → Run workflow
```

---

## 🔐 Detailed Secrets Setup

### EXPO_TOKEN

**What:** Authentication token for EAS builds

**How to get:**
```bash
npx expo login
npx expo token:create
```

**Format:** `string` (long alphanumeric token)

---

### iOS Secrets

#### EXPO_APPLE_ID

**What:** Your Apple ID email

**How to get:** Your Apple Developer account email

**Format:** `email@example.com`

#### EXPO_APPLE_APP_SPECIFIC_PASSWORD

**What:** App-specific password for App Store Connect

**How to get:**
1. Go to [appleid.apple.com](https://appleid.apple.com)
2. Sign in
3. Go to "Security" section
4. Generate an app-specific password
5. Label it "FamVenture CI/CD"

**Format:** `xxxx-xxxx-xxxx-xxxx`

#### EXPO_APPLE_TEAM_ID

**What:** Your Apple Developer Team ID

**How to get:**
1. Go to [developer.apple.com/account](https://developer.apple.com/account)
2. Sign in
3. Find "Team ID" in membership section

**Format:** `ABC123XYZ` (alphanumeric, ~10 chars)

#### EXPO_ASC_APP_ID

**What:** App Store Connect app ID

**How to get:**
1. Go to [App Store Connect](https://appstoreconnect.apple.com)
2. Go to "My Apps"
3. Create app if not exists
4. Find "Apple ID" in App Information

**Format:** `1234567890` (numeric)

---

### Android Secrets

#### EXPO_ANDROID_SERVICE_ACCOUNT_KEY

**What:** Google Play service account JSON key

**How to get:**

1. **Create Service Account:**
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Create new project or select existing
   - Enable "Google Play Android Developer API"
   - Go to "IAM & Admin" → "Service Accounts"
   - Create service account
   - Grant it "Service Account User" role

2. **Create Key:**
   - Click on the service account
   - Go to "Keys" tab
   - Add Key → Create new key
   - Choose JSON format
   - Download the JSON file

3. **Link to Play Console:**
   - Go to [Google Play Console](https://play.google.com/console)
   - Go to "Setup" → "API access"
   - Link the service account
   - Grant "Release" and "View app information" permissions

4. **Add to GitHub:**
   ```bash
   # Copy entire JSON content
   cat service-account-key.json | pbcopy  # macOS
   cat service-account-key.json | xclip   # Linux
   ```
   - Paste entire JSON as secret value

**Format:** Full JSON file content

---

## 🛠️ EAS Configuration (eas.json)

The included `eas.json` has three build profiles:

### Development Profile
```json
{
  "developmentClient": true,
  "distribution": "internal",
  "ios": { "simulator": true },
  "android": { "buildType": "apk" }
}
```

**Use for:** Local testing, simulators

**Build:** `eas build --profile development --platform ios`

### Preview Profile
```json
{
  "distribution": "internal",
  "ios": { "simulator": false },
  "android": { "buildType": "apk" }
}
```

**Use for:** Internal testing, TestFlight, APK distribution

**Build:** `eas build --profile preview --platform android`

### Production Profile
```json
{
  "ios": { "resourceClass": "m-medium" },
  "android": { "buildType": "aab" }
}
```

**Use for:** App Store & Google Play releases

**Build:** `eas build --profile production --platform all`

---

## 🔄 Workflow Triggers

### CI Workflow

**Triggers automatically on:**
- Push to `main`, `develop`, or `claude/**`
- Pull requests to `main` or `develop`

**Runs:**
- Type checking
- Linting
- Build verification
- Migration checks

**No builds created** - just code quality checks.

### Build Workflow

**Triggers automatically on:**
- Push to `main` or `develop`
- Pull requests to `main` or `develop`

**Triggers manually via:**
- GitHub UI: Actions → Expo Build → Run workflow
- Choose platform (iOS/Android/All)
- Choose profile (development/preview/production)

**Creates:** Actual app builds in EAS

---

## 📱 Manual Builds (Local)

You can also trigger builds from your machine:

```bash
# Development (with dev client)
eas build --profile development --platform ios

# Preview (TestFlight/APK)
eas build --profile preview --platform android

# Production (App Store/Play Store)
eas build --profile production --platform all

# Submit after building
eas submit --platform ios --latest
eas submit --platform android --latest
```

---

## 🧪 Testing the CI/CD

### Test CI Workflow

1. Make a small code change
2. Create a branch: `git checkout -b test-ci`
3. Commit and push: `git push origin test-ci`
4. Create PR on GitHub
5. Watch Actions tab - CI should run

### Test Build Workflow

1. Go to GitHub → Actions
2. Click "Expo Build and Deploy"
3. Click "Run workflow"
4. Select:
   - Branch: `develop`
   - Platform: `android`
   - Profile: `preview`
5. Click "Run workflow"
6. Watch the build progress

### Check Build Status

```bash
# List all builds
eas build:list

# View specific build
eas build:view [build-id]

# Download build
eas build:download [build-id]
```

---

## 📊 Build Status Badge

Add to your README.md:

```markdown
[![Expo Build](https://github.com/YOUR_USERNAME/FamVenture/actions/workflows/expo-build.yml/badge.svg)](https://github.com/YOUR_USERNAME/FamVenture/actions/workflows/expo-build.yml)
```

---

## 🐛 Troubleshooting

### Build Fails: "Invalid credentials"

**Solution:**
- Verify `EXPO_TOKEN` secret is correct
- Generate new token: `npx expo token:create`
- Update GitHub secret

### iOS Build Fails: "Invalid certificate"

**Solution:**
```bash
# Clear certificates
eas credentials

# Select iOS → Distribution → Remove all
# Then rebuild
```

### Android Build Fails: "Keystore error"

**Solution:**
```bash
# Create new keystore
eas credentials

# Select Android → Create new keystore
```

### Build Succeeds but Submit Fails

**Solution:**
- Check App Store Connect status
- Verify service account permissions (Android)
- Ensure app exists in stores
- Check secrets are correct

### Workflow Doesn't Trigger

**Solution:**
- Check workflow file syntax (YAML)
- Ensure pushed to correct branch
- Check GitHub Actions are enabled in repo settings

---

## 🔒 Security Best Practices

### Secrets Management

✅ **DO:**
- Use GitHub Secrets for all credentials
- Rotate tokens periodically
- Use app-specific passwords (not main Apple ID password)
- Keep service account JSON secure

❌ **DON'T:**
- Commit secrets to git
- Share secrets in Slack/email
- Use personal tokens for production

### Access Control

- Limit who can trigger production builds
- Use branch protection on `main`
- Require code reviews for merges
- Enable 2FA on all accounts

---

## 📈 Advanced Configuration

### Custom Build Steps

Edit `.github/workflows/expo-build.yml`:

```yaml
- name: Custom step
  run: |
    # Your custom commands
    npm run custom-script
```

### Build on Tag

Add to workflow:

```yaml
on:
  push:
    tags:
      - 'v*.*.*'
```

### Slack Notifications

Add to workflow:

```yaml
- name: Notify Slack
  if: failure()
  uses: 8398a7/action-slack@v3
  with:
    status: ${{ job.status }}
    webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

### Cache Dependencies

Add to workflow:

```yaml
- name: Cache node modules
  uses: actions/cache@v3
  with:
    path: node_modules
    key: ${{ runner.os }}-node-${{ hashFiles('package-lock.json') }}
```

---

## 📋 Checklist: Production Release

Before releasing to production:

- [ ] All tests pass
- [ ] Version bumped in `app.json`
- [ ] Changelog updated
- [ ] Screenshots updated (if UI changed)
- [ ] Privacy policy reviewed
- [ ] Terms of service reviewed
- [ ] Test on real devices (iOS & Android)
- [ ] Build with production profile
- [ ] Submit to TestFlight/Internal testing first
- [ ] Beta test for 1-2 weeks
- [ ] Submit to App Store & Google Play

---

## 🎓 Learning Resources

- [EAS Build Documentation](https://docs.expo.dev/build/introduction/)
- [EAS Submit Documentation](https://docs.expo.dev/submit/introduction/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Expo Credentials](https://docs.expo.dev/app-signing/app-credentials/)

---

## 🆘 Support

If you encounter issues:

1. Check EAS build logs: `eas build:list` → View build
2. Check GitHub Actions logs in Actions tab
3. Review Expo status: [status.expo.dev](https://status.expo.dev)
4. Search Expo Forums: [forums.expo.dev](https://forums.expo.dev)

---

## ✅ Verification

After setup, verify everything works:

```bash
# 1. Local build test
eas build --profile development --platform ios --local

# 2. Remote build test
eas build --profile preview --platform android

# 3. Check GitHub Actions
# Push a commit and watch Actions tab

# 4. Manual workflow trigger
# GitHub → Actions → Run workflow
```

---

**CI/CD is now configured! 🎉**

Your app will automatically build and deploy with every commit to `main` or `develop`.

# FamVenture - Setup & Testing Guide

A gamified family chore planner built with Expo (React Native) and Supabase.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Project Structure](#project-structure)
3. [Supabase Setup](#supabase-setup)
4. [Local Development Setup](#local-development-setup)
5. [Testing the Application](#testing-the-application)
6. [Features Overview](#features-overview)
7. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before starting, ensure you have the following installed:

- **Node.js** (v18 or later) - [Download](https://nodejs.org/)
- **npm** or **yarn**
- **Expo CLI** - Install globally: `npm install -g expo-cli`
- **Supabase CLI** - Install: `npm install -g supabase`
- **Docker** (for local Supabase) - [Download](https://www.docker.com/)
- **iOS Simulator** (macOS) or **Android Emulator** or **Expo Go** app on your phone

---

## Project Structure

```
FamVenture/
├── app/                      # Expo Router pages
│   ├── (auth)/              # Authentication screens
│   │   ├── sign-in.tsx
│   │   └── sign-up.tsx
│   ├── (tabs)/              # Main app tabs
│   │   ├── index.tsx        # Home/Dashboard
│   │   ├── chores.tsx       # Chores list
│   │   ├── leaderboard.tsx  # Family leaderboard
│   │   ├── approvals.tsx    # Parent approvals (parents only)
│   │   └── profile.tsx      # User profile
│   └── _layout.tsx          # Root layout with providers
├── src/
│   ├── hooks/               # Custom React hooks
│   ├── lib/                 # Supabase client config
│   ├── providers/           # Context providers
│   ├── store/               # Zustand state management
│   └── types/               # TypeScript types
├── supabase/
│   ├── migrations/          # Database migrations
│   ├── functions/           # Edge Functions
│   │   ├── approve-chore/
│   │   ├── check-time-estimate/
│   │   ├── process-recurring-chores/
│   │   └── update-leaderboard/
│   └── config.toml          # Supabase config
└── package.json
```

---

## Supabase Setup

### Option 1: Local Development (Recommended for Testing)

1. **Initialize Supabase locally:**

```bash
cd /home/user/FamVenture
supabase init
```

2. **Start Supabase services:**

```bash
supabase start
```

This will start:
- PostgreSQL database
- Studio (web UI) at `http://localhost:54323`
- API at `http://localhost:54321`

3. **Apply migrations:**

```bash
supabase db push
```

Or manually apply the migration files:

```bash
psql -h localhost -p 54322 -d postgres -U postgres -f supabase/migrations/20250110_001_initial_schema.sql
psql -h localhost -p 54322 -d postgres -U postgres -f supabase/migrations/20250110_002_rls_policies.sql
```

4. **Get your local credentials:**

After running `supabase start`, you'll see output with:
- `API URL`: typically `http://localhost:54321`
- `anon key`: Your anonymous key
- `service_role key`: Your service role key

### Option 2: Supabase Cloud

1. Create a new project at [supabase.com](https://supabase.com)

2. In the SQL Editor, run the migration files:
   - Copy contents of `supabase/migrations/20250110_001_initial_schema.sql`
   - Copy contents of `supabase/migrations/20250110_002_rls_policies.sql`

3. Deploy Edge Functions:

```bash
supabase functions deploy approve-chore
supabase functions deploy check-time-estimate
supabase functions deploy process-recurring-chores
supabase functions deploy update-leaderboard
```

4. Get your credentials from Project Settings → API

---

## Local Development Setup

1. **Install dependencies:**

```bash
cd /home/user/FamVenture
npm install
```

2. **Create environment file:**

Create a `.env` file in the root directory:

```bash
# Local Supabase
EXPO_PUBLIC_SUPABASE_URL=http://localhost:54321
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Cloud Supabase (comment out local vars above if using cloud)
# EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
# EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Replace `your-anon-key-here` with the actual key from `supabase start` output.

3. **Start the Expo development server:**

```bash
npm start
```

4. **Run on your device:**

- **iOS Simulator:** Press `i` in the terminal
- **Android Emulator:** Press `a` in the terminal
- **Physical Device:** Scan the QR code with Expo Go app

---

## Testing the Application

### Step 1: Create a Family Account (Parent)

1. Open the app
2. Tap "Sign Up"
3. Fill in:
   - Family Name: "The Test Family"
   - Your Name: "Parent User"
   - Email: `parent@test.com`
   - Password: `password123`
4. Tap "Create Account"
5. Sign in with the created credentials

### Step 2: Verify Database Setup

Open Supabase Studio at `http://localhost:54323`:

1. Go to **Table Editor**
2. Check that these tables exist:
   - `families`
   - `profiles`
   - `chores`
   - `chore_instances`
   - `goals`
   - `approvals`
   - `notifications`
   - `leaderboard_snapshots`

3. In the `profiles` table, verify your parent profile exists

### Step 3: Create Test Chores (Manual via SQL)

Since the UI for creating chores is simplified in this initial version, let's create test data directly:

1. Open Supabase Studio SQL Editor
2. Run this SQL to create test chores:

```sql
-- Get your family_id and parent_id
SELECT id as family_id FROM families LIMIT 1;
SELECT id as parent_id FROM profiles WHERE role = 'parent' LIMIT 1;

-- Replace YOUR_FAMILY_ID and YOUR_PARENT_ID with values from above
-- Create a one-time chore
INSERT INTO chores (family_id, title, description, type, base_points, expected_duration_min, created_by, is_recurring, active)
VALUES
  ('YOUR_FAMILY_ID', 'Clean Your Room', 'Vacuum, dust, and organize', 'household', 20, 30, 'YOUR_PARENT_ID', false, true),
  ('YOUR_FAMILY_ID', 'Math Homework', 'Complete chapter 5 exercises', 'study', 30, 45, 'YOUR_PARENT_ID', false, true),
  ('YOUR_FAMILY_ID', 'Play Outside', 'Get some fresh air and exercise', 'activity', 15, 60, 'YOUR_PARENT_ID', false, true);

-- Create instances for these chores
INSERT INTO chore_instances (chore_id, family_id, title, description, type, base_points, expected_duration_min, due_at, status)
SELECT
  id,
  family_id,
  title,
  description,
  type,
  base_points,
  expected_duration_min,
  NOW() + INTERVAL '1 day',
  'open'
FROM chores
WHERE family_id = 'YOUR_FAMILY_ID';

-- Create a family goal
INSERT INTO goals (family_id, name, description, target_points, is_active)
VALUES ('YOUR_FAMILY_ID', 'Theme Park Trip', 'Earn 500 points for a family theme park visit!', 500, true);
```

### Step 4: Create a Child Account

Since parents can create child accounts, let's do this via SQL for testing:

```sql
-- Create a test child user
-- First, you need to create the auth user via Supabase Auth in Studio:
-- Go to Authentication > Users > Add User
-- Email: child@test.com
-- Password: password123
-- Auto-confirm: Yes

-- Then create the profile (replace YOUR_CHILD_USER_ID with the auth user id)
INSERT INTO profiles (id, family_id, role, display_name)
VALUES ('YOUR_CHILD_USER_ID', 'YOUR_FAMILY_ID', 'child', 'Test Child');
```

### Step 5: Test Child Workflows

1. **Sign out** from parent account
2. **Sign in** as child (`child@test.com` / `password123`)
3. Navigate to the **Chores** tab
4. You should see available chores
5. **Claim a chore** by tapping the "Claim" button
6. The chore status should change to "In Progress"

### Step 6: Submit a Chore (via SQL for now)

```sql
-- Submit the chore for approval
UPDATE chore_instances
SET
  status = 'submitted',
  completed_at = NOW(),
  notes = 'All done! Room is clean.'
WHERE claimed_by = 'YOUR_CHILD_USER_ID'
  AND status = 'claimed'
LIMIT 1;
```

### Step 7: Test Parent Approval Workflow

1. **Sign out** from child account
2. **Sign in** as parent
3. Navigate to the **Approvals** tab
4. You should see the submitted chore
5. Review the details
6. Tap **Approve** or **Reject**
7. The Edge Function will calculate overdue bonus and award points

### Step 8: Test Leaderboard

1. Go to the **Leaderboard** tab
2. Switch between Week/Month/All Time
3. Verify that approved chores show up in rankings
4. Parent should also appear in leaderboard if they complete chores

### Step 9: Test Overdue Bonus

1. Create a chore with a past due date:

```sql
INSERT INTO chore_instances (chore_id, family_id, title, type, base_points, due_at, claimed_by, status, completed_at)
SELECT
  id,
  family_id,
  title,
  type,
  base_points,
  NOW() - INTERVAL '5 days',  -- 5 days overdue
  'YOUR_CHILD_USER_ID',
  'submitted',
  NOW()
FROM chores
WHERE family_id = 'YOUR_FAMILY_ID'
LIMIT 1;
```

2. Approve this chore as parent
3. Check that bonus points were awarded (should be more than base_points)

### Step 10: Test Goal Progress

1. After approving several chores, go to the **Home** tab
2. Verify the Family Goal progress bar updates
3. Progress should show: `current_points / target_points`

---

## Features Overview

### For Children (and Parents who participate):

1. **Home Dashboard**
   - View today's chores
   - See personal stats (points, streak, level)
   - Track family goal progress
   - Get alerted about overdue chores

2. **Chores**
   - Browse available chores
   - Claim chores to work on
   - View "My Chores" (assigned or claimed)
   - See overdue bonuses

3. **Leaderboard**
   - Week/Month/All-time rankings
   - See family member rankings
   - Podium display for top 3
   - Parents included in rankings

4. **Profile**
   - View personal stats
   - See earned badges
   - Manage settings
   - Sign out

### For Parents:

1. **All Child Features** (parents can also do chores and compete!)

2. **Approvals Tab**
   - Review submitted chores
   - View proof photos
   - Approve or reject with feedback
   - Overdue bonus calculated automatically

3. **Additional Controls**
   - Create chores (via SQL for now, UI can be added)
   - Manage family members
   - Set family goals
   - Configure plan settings

---

## Key Features Implemented

✅ **Database Schema**
- Complete PostgreSQL schema with all tables
- Row Level Security (RLS) policies
- Triggers for auto-updating stats and goals
- Proper indexes for performance

✅ **Authentication**
- Email/password sign-up and sign-in
- Parent and child roles
- Secure session management

✅ **Chores System**
- One-time and recurring chores (RRULE support)
- Chore types: study, household, activity
- Claim and submit workflow
- Proof photos and notes

✅ **Approval Workflow**
- Parent review queue
- Approve/reject with reasons
- Automatic point calculation with overdue bonus
- Cash-out option for time-based chores

✅ **Gamification**
- Points system with overdue multipliers
- Leaderboard (week/month/all-time)
- **Parents included in leaderboard**
- Levels based on total points
- Streak tracking
- Badges system (framework in place)

✅ **Family Goals**
- Shared family point targets
- Auto-updating progress
- Visual progress tracking

✅ **Edge Functions**
- `approve-chore`: Handles approval logic with overdue calculations
- `check-time-estimate`: AI/heuristic time validation
- `update-leaderboard`: Calculates and caches rankings
- `process-recurring-chores`: Spawns instances from RRULE

---

## Testing the Overdue Bonus Formula

The overdue bonus is calculated as:

```
multiplier = 1 + min(cap, overdue_days / grace_days)
points_awarded = floor(base_points * multiplier)
```

Default settings:
- `grace_days = 3`
- `cap = 2.0` (max 200% bonus)

**Examples** (with base_points = 10):
- On time: 10 points
- 1 day late: 10 × (1 + 1/3) ≈ 13 points
- 3 days late: 10 × (1 + 3/3) = 20 points
- 6 days late: 10 × (1 + min(2, 6/3)) = 30 points
- 9+ days late: 10 × (1 + 2) = 30 points (capped)

Test by creating chores with various due dates in the past!

---

## Testing Cash-Out Feature

1. Set an hourly rate for a child:

```sql
UPDATE profiles
SET hourly_rate_cents = 1000  -- $10.00 per hour
WHERE id = 'YOUR_CHILD_USER_ID';
```

2. Create a time-based chore:

```sql
UPDATE chores
SET allow_cash_out = true
WHERE id = 'YOUR_CHORE_ID';
```

3. When submitting, set:
   - `cash_out_requested = true`
   - `minutes_reported = 30`

4. On approval, the Edge Function will calculate:
   - Cash = $10.00 × (30/60) = $5.00
   - Optional: small points percentage based on family settings

---

## Troubleshooting

### App doesn't start

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npx expo start -c
```

### Supabase connection errors

1. Verify Supabase is running: `supabase status`
2. Check `.env` file has correct `SUPABASE_URL` and `SUPABASE_ANON_KEY`
3. Restart Expo: `npm start`

### RLS Policy errors

If you get permission denied errors:
1. Check you're signed in correctly
2. Verify `family_id` matches between user and data
3. Check RLS policies in Supabase Studio → Authentication → Policies

### Edge Functions not working

```bash
# Check function logs
supabase functions serve approve-chore --debug

# Or via cloud dashboard:
# Go to Edge Functions → Function Name → Logs
```

### Migrations fail

```bash
# Reset local database
supabase db reset

# Re-apply migrations
supabase db push
```

---

## Next Steps for Production

1. **UI Enhancements**
   - Add chore creation form for parents
   - Implement photo upload for proof
   - Add timer for chores in progress
   - Implement badge unlock animations

2. **Notifications**
   - Push notifications for reminders
   - Due date alerts
   - Approval notifications

3. **Recurring Chores**
   - Set up cron job to call `process-recurring-chores`
   - Test RRULE patterns

4. **AI Time Check**
   - Integrate actual AI model for time estimation
   - Currently uses heuristics

5. **Plan & Billing**
   - Implement Free vs Premium plan logic
   - Add payment integration
   - Restrict features based on plan

6. **Testing**
   - Write unit tests
   - Integration tests for Edge Functions
   - E2E tests with Detox or Maestro

---

## Important Notes

### Parents as Participants

As requested, **parents can participate in chores just like children**:

1. Parents can claim and complete chores
2. Parents appear in the leaderboard
3. Parents earn points and can contribute to family goals
4. Another parent can approve their chores
5. Parents have the same streak and level progression

This creates a fun, collaborative environment where everyone participates!

### Data Seeding for Testing

For comprehensive testing, use the SQL snippets provided above to:
- Create multiple family members
- Create various chore types
- Set different due dates (past, today, future)
- Test overdue scenarios
- Test cash-out scenarios

---

## Support

For issues or questions:
1. Check Supabase logs: `supabase logs`
2. Check Expo logs in terminal
3. Review RLS policies in Supabase Studio
4. Verify migration was applied correctly

---

## License

MIT License - Feel free to use and modify for your family!

---

**Happy Testing! 🎉**

Enjoy building productive habits with your family through FamVenture!

# FamVenture - Project Summary

**A gamified family chore planner built with Expo (React Native) and Supabase.**

## Overview

FamVenture helps families organize chores in a fun, fair, and transparent way. Children (and parents!) complete tasks toward shared family goals, earning points and competing on a leaderboard.

### Key Innovation

✨ **Parents participate too!** Unlike typical chore apps, parents can also claim chores, earn points, and appear on the leaderboard, creating a truly collaborative family experience.

---

## Tech Stack

### Frontend (Mobile App)
- **Expo/React Native** - Cross-platform iOS & Android
- **Expo Router** - File-based navigation
- **TypeScript** - Type safety
- **TanStack Query** - Server state management
- **Zustand** - Client state management
- **React Native components** - UI

### Backend (Supabase)
- **PostgreSQL** - Database with Row Level Security
- **Supabase Auth** - Email/password, OAuth (Apple, Google ready)
- **Edge Functions** - Serverless TypeScript functions
- **Realtime** - Live updates (framework ready)
- **Storage** - Proof photo uploads

---

## Architecture Highlights

### Database Design

**Core Tables:**
- `families` - Family groups with settings
- `profiles` - Users (parents & children) with stats
- `chores` - Chore templates (recurring & one-time)
- `chore_instances` - Concrete chore occurrences
- `goals` - Shared family goals
- `approvals` - Audit trail
- `leaderboard_snapshots` - Pre-computed rankings
- `notifications` - In-app & push notifications

**Security:**
- Row Level Security (RLS) on all tables
- Family-based data isolation
- Role-based permissions (parent/child)
- Helper functions for auth checks

### Edge Functions

1. **approve-chore**
   - Handles approval workflow
   - Calculates overdue bonus
   - Awards points or cash
   - Sends notifications

2. **check-time-estimate**
   - Validates reported time
   - Uses heuristics (AI-ready)
   - Provides suggestions

3. **update-leaderboard**
   - Calculates rankings
   - Handles tie-breaking
   - Caches results

4. **process-recurring-chores**
   - Spawns instances from RRULE
   - Runs via cron job
   - Handles complex recurrence

---

## Features Implemented

### ✅ Authentication & Onboarding
- Email/password sign-up
- Family creation
- Role assignment (parent/child)
- Session management

### ✅ Chore Management
- Create one-time chores (via SQL/API)
- Create recurring chores (RRULE support)
- Three types: study, household, activity
- Expected duration tracking
- Cash-out option for time-based chores
- Proof photos framework
- Notes support

### ✅ Workflow States
- **Open** - Available to claim
- **Claimed** - Being worked on
- **Submitted** - Awaiting approval
- **Approved** - Points awarded
- **Rejected** - Denied with reason

### ✅ Overdue Bonus System
Formula: `points = base_points × (1 + min(cap, overdue_days / grace_days))`

Defaults:
- Grace period: 3 days
- Cap: 2.0x (200% bonus)
- Configurable per family

Examples (base = 10 points):
- On time: 10
- 3 days late: 20 (2x)
- 6+ days late: 30 (3x, capped)

### ✅ Cash-Out System
- Parents set hourly rate per child
- Time-based chores can be cashed out
- AI/heuristic time validation
- Cash = hourly_rate × (minutes / 60)
- Optional: award partial points with cash

### ✅ Gamification

**Points:**
- Earned on chore approval
- Includes overdue bonus
- Tracks lifetime total

**Levels:**
- Level = floor(total_points / 100) + 1
- Level up notifications
- Visual progression

**Streaks:**
- Daily completion tracking
- Increments on approved chore
- Breaks if day missed

**Badges:**
- Framework in place
- Stored as JSON array
- Examples: "First 5 Study Chores", "7-Day Streak", "100 Household Chores"

### ✅ Leaderboard

**Periods:**
- Week (current week)
- Month (current month)
- All Time (lifetime)

**Display:**
- Top 3 on podium with medals
- Ranked list for 4+
- **Parents included** ✨
- Shows points and chores completed

**Tie-Breaking:**
1. Most points
2. Most chores completed
3. Earliest completion time

### ✅ Family Goals
- Shared point targets
- Visual progress bar
- Auto-updates on approval
- Completion tracking
- One active goal at a time

### ✅ Parent Features
- Approval queue
- View submitted chores
- See proof photos/notes
- Approve with auto-calculation
- Reject with feedback
- Override points/cash
- **Can also do chores** ✨

### ✅ User Interface

**Screens:**
- Home/Dashboard - Stats, today's chores, goal progress
- Chores - Available & My Chores tabs
- Leaderboard - Week/Month/All-time rankings
- Approvals (Parents) - Review queue
- Profile - Stats, badges, settings

**Design:**
- Clean, modern UI
- Color-coded chore types (blue/green/purple)
- Iconography for actions
- Empty states
- Loading states
- Error handling

---

## Project Structure

```
FamVenture/
├── app/                          # Expo Router pages
│   ├── (auth)/                   # Auth flow
│   │   ├── sign-in.tsx           # Sign in screen
│   │   └── sign-up.tsx           # Sign up screen
│   ├── (tabs)/                   # Main app
│   │   ├── _layout.tsx           # Tabs navigator
│   │   ├── index.tsx             # Home/Dashboard
│   │   ├── chores.tsx            # Chores list
│   │   ├── leaderboard.tsx       # Leaderboard
│   │   ├── approvals.tsx         # Parent approvals
│   │   └── profile.tsx           # User profile
│   └── _layout.tsx               # Root layout
│
├── src/
│   ├── hooks/                    # Custom hooks
│   │   ├── useChores.ts          # Chore CRUD operations
│   │   └── useLeaderboard.ts     # Leaderboard queries
│   ├── lib/
│   │   └── supabase.ts           # Supabase client config
│   ├── providers/
│   │   └── AuthProvider.tsx      # Auth context provider
│   ├── store/
│   │   └── useAuthStore.ts       # Zustand auth store
│   └── types/
│       └── database.types.ts     # TypeScript definitions
│
├── supabase/
│   ├── migrations/               # Database migrations
│   │   ├── 20250110_001_initial_schema.sql
│   │   └── 20250110_002_rls_policies.sql
│   ├── functions/                # Edge Functions
│   │   ├── _shared/cors.ts
│   │   ├── approve-chore/
│   │   ├── check-time-estimate/
│   │   ├── process-recurring-chores/
│   │   └── update-leaderboard/
│   ├── config.toml               # Supabase config
│   └── seed.sql                  # Test data
│
├── .env.example                  # Environment template
├── .gitignore                    # Git ignore rules
├── app.json                      # Expo config
├── package.json                  # Dependencies
├── tsconfig.json                 # TypeScript config
├── README_SETUP.md               # Setup instructions
├── TESTING_CHECKLIST.md          # Testing guide
└── PROJECT_SUMMARY.md            # This file
```

---

## Setup & Deployment

### Local Development
1. Install dependencies: `npm install`
2. Start Supabase: `supabase start`
3. Apply migrations: `supabase db push`
4. Configure `.env` with Supabase credentials
5. Start Expo: `npm start`
6. Run on simulator/device

### Production Deployment

**Supabase:**
1. Create project on supabase.com
2. Run migrations in SQL Editor
3. Deploy Edge Functions
4. Set environment variables

**Expo:**
1. Configure `app.json` with project details
2. Build: `eas build`
3. Submit to App Store/Google Play: `eas submit`

---

## Testing

### Manual Testing
See `TESTING_CHECKLIST.md` for comprehensive test cases covering:
- Authentication flows
- Chore workflows (claim → submit → approve)
- Overdue bonus calculations
- Cash-out system
- Leaderboard rankings
- Family goal progress
- Parent participation
- Security (RLS policies)
- Edge cases

### Test Data
Use `supabase/seed.sql` to populate test data:
- Test family
- Parent account
- Child accounts
- Sample chores
- Family goal

### Key Test Scenarios

**Scenario 1: Happy Path**
1. Parent creates family
2. Child joins family
3. Child claims chore
4. Child completes chore
5. Parent approves
6. Points awarded
7. Leaderboard updates

**Scenario 2: Overdue Bonus**
1. Create chore with past due date
2. Child completes late
3. Parent approves
4. Verify bonus points (2-3x base)

**Scenario 3: Parent Participation**
1. Parent claims chore
2. Parent completes
3. Another parent approves
4. Parent appears in leaderboard
5. Points count toward family goal

---

## Performance Considerations

### Database
- **Indexes** on foreign keys, status, due_at
- **Materialized views** for leaderboard (via snapshots)
- **Triggers** for auto-updates (goals, stats)
- **RLS** for security (no app-level filtering)

### Edge Functions
- **Caching** leaderboard results
- **Batch processing** for recurring chores
- **Efficient queries** with joins

### Mobile App
- **TanStack Query** for caching
- **Optimistic updates** (framework ready)
- **Lazy loading** for images
- **Pagination** for long lists (ready)

---

## Future Enhancements

### Phase 2 - UI Completion
- [ ] Chore creation form for parents
- [ ] Photo upload for proof
- [ ] Timer for chores in progress
- [ ] Chore detail screen
- [ ] Goal creation UI
- [ ] Family member management

### Phase 3 - Engagement
- [ ] Push notifications
- [ ] Reminder system
- [ ] Badge award logic
- [ ] Achievement celebrations
- [ ] Streak recovery
- [ ] Custom avatars

### Phase 4 - Advanced Features
- [ ] Recurring chore automation (cron)
- [ ] AI time estimation (actual model)
- [ ] Cash balance & payouts
- [ ] Chore templates library
- [ ] Multi-family support
- [ ] Analytics dashboard

### Phase 5 - Monetization
- [ ] Free vs Premium plans
- [ ] Payment integration
- [ ] Feature gating
- [ ] Family subscription
- [ ] In-app purchases

---

## Business Logic Highlights

### Overdue Bonus Formula
```typescript
const overdueDays = max(0, floor((approvedAt - dueAt) / 1 day))
const multiplier = 1 + min(cap, overdueDays / graceDays)
const points = floor(basePoints * multiplier)
```

### Cash-Out Calculation
```typescript
const cashCents = floor((hourlyRateCents / 60) * minutesReported)
const points = cashPointsPercent > 0
  ? floor(basePoints * (cashPointsPercent / 100))
  : 0
```

### Level Calculation
```typescript
const level = floor(totalPoints / 100) + 1
```

### Leaderboard Ranking
```typescript
// Sort by:
1. points DESC
2. choresCompleted DESC
3. earliestCompletion ASC
```

---

## Security Model

### Authentication
- Email/password (Supabase Auth)
- OAuth ready (Apple, Google)
- Session tokens (JWT)
- Auto-refresh

### Authorization (RLS)
- Family-based isolation
- Role-based permissions
- Helper functions for checks
- Policies on all tables

### Data Protection
- Password hashing (Supabase)
- Secure storage (Expo SecureStore)
- HTTPS only
- No sensitive data in logs

### Compliance Notes
- COPPA/GDPR-K considerations for children
- Parental consent required
- Data deletion path
- Minimal PII collection

---

## Dependencies

### Frontend
```json
{
  "@supabase/supabase-js": "^2.39.3",
  "@tanstack/react-query": "^5.17.19",
  "expo": "~50.0.0",
  "expo-router": "~3.4.0",
  "react-native": "0.73.2",
  "zustand": "^4.4.7",
  "rrule": "^2.7.2"
}
```

### Backend
- Supabase (managed PostgreSQL)
- Deno runtime (Edge Functions)
- Storage API (photos)

---

## Known Limitations (V1)

1. **Chore Creation**: Currently requires SQL/API, no UI form
2. **Photo Upload**: Framework in place, UI not built
3. **Push Notifications**: Not implemented
4. **Recurring Automation**: Needs cron job setup
5. **Badge Awards**: Manual logic needed
6. **Cash Payouts**: Tracking only, no actual payments
7. **Offline Mode**: Limited (basic caching only)

---

## Success Metrics

### MVP Definition
✅ Users can create accounts
✅ Parents can create chores (via SQL/API)
✅ Children can claim and complete chores
✅ Parents can approve/reject chores
✅ Overdue bonuses work correctly
✅ Leaderboard displays rankings
✅ **Parents can participate and compete**
✅ Family goals track progress

### Feature Complete
- All MVP features
- + UI for chore creation
- + Photo uploads functional
- + Push notifications
- + Recurring chores automated
- + Badge system active

---

## Documentation Files

1. **README_SETUP.md** - Complete setup and installation guide
2. **TESTING_CHECKLIST.md** - Comprehensive testing checklist
3. **PROJECT_SUMMARY.md** - This file, project overview
4. **supabase/seed.sql** - Test data for development
5. **.env.example** - Environment configuration template

---

## Credits

**Developed for:** FamVenture
**Framework:** Expo + Supabase
**Design:** Clean, playful, family-friendly

---

## License

MIT License

---

## Contact & Support

For issues or questions:
- Check Supabase logs
- Review RLS policies
- Verify migrations applied
- See TESTING_CHECKLIST.md

---

**Built with ❤️ for families who want to make chores fun!**

---

## Quick Start Commands

```bash
# Setup
npm install
supabase start
supabase db push

# Development
npm start              # Start Expo
npm run ios            # Run on iOS
npm run android        # Run on Android

# Supabase
supabase status        # Check services
supabase db reset      # Reset database
supabase functions serve --debug  # Test functions locally

# Testing
# Use seed.sql to create test data
# Follow TESTING_CHECKLIST.md
```

---

**Ready to get started? See README_SETUP.md for detailed instructions!**

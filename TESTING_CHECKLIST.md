# FamVenture Testing Checklist

Use this checklist to verify all features work correctly.

## Prerequisites

- [ ] Supabase is running (`supabase status` shows all services up)
- [ ] Migrations applied successfully
- [ ] Expo dev server is running
- [ ] App loads without errors

## 1. Database Schema Verification

### Tables Created
- [ ] `families` table exists with correct columns
- [ ] `profiles` table exists with role, family_id, points, streak, level
- [ ] `chores` table exists with all chore types
- [ ] `chore_instances` table exists with status workflow
- [ ] `goals` table exists for family goals
- [ ] `approvals` table exists for audit trail
- [ ] `notifications` table exists
- [ ] `invites` table exists
- [ ] `leaderboard_snapshots` table exists

### Enums and Types
- [ ] `role` enum: parent, child
- [ ] `chore_type` enum: study, household, activity
- [ ] `chore_status` enum: open, claimed, submitted, approved, rejected, expired
- [ ] `period` enum: week, month, all_time

### Triggers
- [ ] `update_updated_at` trigger on relevant tables
- [ ] `update_goal_progress` trigger updates goals when chore approved
- [ ] `update_profile_stats` trigger updates user points and level

### RLS Policies
- [ ] Users can only see data from their family
- [ ] Parents can create/edit chores
- [ ] Children can claim and submit chores
- [ ] Parents can approve/reject chores
- [ ] Storage policies for proof photos work

## 2. Authentication Tests

### Sign Up
- [ ] Create new family account (parent)
- [ ] Family record created in database
- [ ] Profile record created with role='parent'
- [ ] Email verification works (if enabled)

### Sign In
- [ ] Parent can sign in
- [ ] Child can sign in
- [ ] Invalid credentials show error
- [ ] Session persists after app restart

### Sign Out
- [ ] Sign out clears session
- [ ] Redirects to sign-in screen
- [ ] Cannot access protected routes after sign out

## 3. Parent Workflows

### Create Chores (via SQL for now)
- [ ] Can create one-time chore
- [ ] Can create recurring chore with RRULE
- [ ] Can set chore type (study/household/activity)
- [ ] Can assign to specific child or leave unassigned
- [ ] Can enable cash-out option

### Approval Queue
- [ ] See list of submitted chores
- [ ] View child's name and completion details
- [ ] View proof photos (if uploaded)
- [ ] View notes from child
- [ ] See expected duration vs reported time

### Approve Chore
- [ ] Approve button works
- [ ] Overdue bonus calculated correctly
- [ ] Points awarded to child
- [ ] Goal progress updates
- [ ] Child's total_points increases
- [ ] Level up happens at 100 point intervals
- [ ] Leaderboard updates
- [ ] Notification sent to child

### Reject Chore
- [ ] Reject button works
- [ ] Can add rejection reason
- [ ] No points awarded
- [ ] Chore status changes to 'rejected'
- [ ] Notification sent to child

### Parents as Participants
- [ ] Parent can claim chores
- [ ] Parent can complete chores
- [ ] Parent appears in leaderboard
- [ ] Parent earns points
- [ ] Another parent can approve
- [ ] Parent contributes to family goal

## 4. Child Workflows

### View Available Chores
- [ ] See all open chores in "Available" tab
- [ ] See chores assigned to them
- [ ] See unassigned chores
- [ ] Cannot see chores assigned to others

### Claim Chore
- [ ] Claim button works
- [ ] Status changes to 'claimed'
- [ ] Chore moves to "My Chores" tab
- [ ] claimed_by and claimed_at set
- [ ] Other children cannot claim same chore

### Work on Chore
- [ ] Can view chore details
- [ ] Can see expected duration
- [ ] Can see base points
- [ ] Can see overdue bonus preview (if overdue)
- [ ] Timer feature (if implemented)

### Submit Chore
- [ ] Can submit completed chore (via SQL for now)
- [ ] Status changes to 'submitted'
- [ ] completed_at timestamp set
- [ ] Can add notes
- [ ] Can upload proof photos (if implemented)
- [ ] Can request cash-out (if allowed)
- [ ] Can report time spent (for cash-out)

### View Status
- [ ] See pending approval status
- [ ] Receive notification when approved
- [ ] Receive notification when rejected
- [ ] See points awarded after approval

## 5. Leaderboard Tests

### View Rankings
- [ ] Week tab shows current week rankings
- [ ] Month tab shows current month rankings
- [ ] All Time tab shows lifetime rankings
- [ ] **Parents appear in rankings**

### Podium Display
- [ ] Top 3 users shown on podium
- [ ] First place larger with crown
- [ ] Second place with silver badge
- [ ] Third place with bronze badge

### Ranking Details
- [ ] Shows profile name
- [ ] Shows avatar (or placeholder)
- [ ] Shows total points for period
- [ ] Shows chores completed count

### Tie Breaking
- [ ] Equal points → more chores completed ranks higher
- [ ] Equal points and chores → earliest completion ranks higher

### Current User Highlight
- [ ] User's own entry highlighted
- [ ] Shows user's current rank
- [ ] Works for both parents and children

## 6. Home Dashboard Tests

### Stats Cards
- [ ] Total points displayed correctly
- [ ] Streak days displayed
- [ ] Current week rank displayed
- [ ] Level displayed

### Family Goal
- [ ] Active goal displayed
- [ ] Progress bar shows correct percentage
- [ ] Current/target points accurate
- [ ] Updates after chore approval

### Today's Chores
- [ ] Shows chores due today
- [ ] Shows open and claimed chores
- [ ] Links to chore detail

### Overdue Alert
- [ ] Shows count of overdue chores
- [ ] Red alert styling
- [ ] Links to chores list

## 7. Overdue Bonus Tests

### Formula Verification
- [ ] On-time completion: base_points × 1 = base_points
- [ ] 1 day late: base_points × 1.33 ≈ base + 33%
- [ ] 3 days late (grace period): base_points × 2 = double
- [ ] 6 days late: base_points × 3 (capped at 2.0) = triple
- [ ] Cap works (doesn't exceed overdue_cap setting)

### Test Cases (base_points = 10)
- [ ] 0 days overdue → 10 points
- [ ] 1 day overdue → 13 points
- [ ] 3 days overdue → 20 points
- [ ] 6 days overdue → 30 points
- [ ] 9 days overdue → 30 points (capped)

### Audit Trail
- [ ] `audit` field stores overdue calculation
- [ ] Shows: overdue_days, multiplier, grace_days, cap
- [ ] Shows if override was applied

## 8. Cash-Out Feature Tests

### Setup
- [ ] Parent can set hourly_rate_cents for child
- [ ] Chore has allow_cash_out = true

### Request Cash-Out
- [ ] Child can request cash-out
- [ ] Child reports minutes spent
- [ ] cash_out_requested flag set
- [ ] minutes_reported saved

### AI Time Check (Edge Function)
- [ ] Reasonable time → status 'ok'
- [ ] Too fast → status 'low' with suggestion
- [ ] Too slow → status 'high' with suggestion
- [ ] Uses historical data if available
- [ ] Returns confidence score

### Approval with Cash-Out
- [ ] Cash calculated: (hourly_rate × minutes) / 60
- [ ] Cash amount displayed to parent
- [ ] Parent can override amount
- [ ] On approval: cash_cents saved
- [ ] On approval: points_awarded = 0 (or small % if configured)
- [ ] Child balance could be tracked (future feature)

## 9. Gamification Tests

### Points System
- [ ] Points awarded on approval
- [ ] total_points incremented
- [ ] Overdue bonus applies

### Levels
- [ ] Level 1 at start (0-99 points)
- [ ] Level 2 at 100 points
- [ ] Level 3 at 200 points
- [ ] Formula: level = floor(total_points / 100) + 1
- [ ] Level up notification sent

### Streaks
- [ ] streak_days increments when chore approved
- [ ] Only counts approved chores
- [ ] One chore per day needed
- [ ] Streak breaks if no chore approved that day
- [ ] last_completion_date tracked

### Badges (Framework)
- [ ] badges array in profile
- [ ] Can store badge objects
- [ ] Badge structure: id, name, description, icon, earned_at
- [ ] Displayed in profile

## 10. Family Goal Tests

### Create Goal
- [ ] Goal created with target_points
- [ ] is_active = true
- [ ] current_points = 0

### Progress Tracking
- [ ] current_points increments on chore approval
- [ ] Only counts approved chores with points
- [ ] Does NOT count cash-out chores (or counts partial)
- [ ] Progress bar updates in real-time

### Goal Completion
- [ ] completed_at set when target reached
- [ ] Goal shown as completed in UI
- [ ] Celebration/notification (if implemented)

### Multiple Goals
- [ ] Only one active goal at a time
- [ ] Can have historical completed goals

## 11. Edge Functions Tests

### approve-chore
- [ ] Accepts instanceId, approve, reason
- [ ] Requires parent authentication
- [ ] Calculates overdue multiplier
- [ ] Awards points or cash
- [ ] Updates chore_instances
- [ ] Creates approval record
- [ ] Sends notification
- [ ] Returns success/error

### check-time-estimate
- [ ] Accepts instanceId, reportedMinutes
- [ ] Compares to expected_duration_min
- [ ] Returns ok/high/low status
- [ ] Provides suggestion if out of range
- [ ] Uses historical data
- [ ] Returns confidence score

### update-leaderboard
- [ ] Calculates week rankings
- [ ] Calculates month rankings
- [ ] Calculates all-time rankings
- [ ] Upserts leaderboard_snapshots
- [ ] Handles tie-breaking correctly
- [ ] Can be called manually or via cron

### process-recurring-chores
- [ ] Reads RRULE from chores
- [ ] Generates next occurrences
- [ ] Creates chore_instances
- [ ] Doesn't duplicate instances
- [ ] Handles multiple recurrence patterns

## 12. Notifications Tests

### Types
- [ ] reminder_due: Before chore due
- [ ] approval_needed: When chore submitted (parent)
- [ ] approved: When chore approved (child)
- [ ] rejected: When chore rejected (child)
- [ ] level_up: When user levels up
- [ ] streak: Streak achievements
- [ ] goal_progress: Goal milestones

### Delivery
- [ ] Notification created in database
- [ ] User can view in-app (future feature)
- [ ] Push notification sent (if implemented)
- [ ] Can mark as read

## 13. Security Tests

### RLS Enforcement
- [ ] Cannot see other families' data
- [ ] Children cannot approve their own chores
- [ ] Children cannot edit family settings
- [ ] Parents can manage their family

### Authentication
- [ ] Cannot access app without sign-in
- [ ] Session token properly validated
- [ ] Session expires appropriately

### Data Validation
- [ ] Cannot set negative points
- [ ] Cannot set invalid chore status
- [ ] Cannot claim already-claimed chore
- [ ] Cannot approve already-approved chore

## 14. Performance Tests

### Database
- [ ] Queries complete in < 1 second
- [ ] Indexes improve query performance
- [ ] Leaderboard loads quickly
- [ ] Chore list loads quickly

### App
- [ ] Navigation is smooth
- [ ] No lag when switching tabs
- [ ] Images load quickly
- [ ] Animations are smooth

## 15. Error Handling

### Network Errors
- [ ] Graceful handling when offline
- [ ] Retry logic works
- [ ] User sees helpful error message

### Validation Errors
- [ ] Missing required fields show errors
- [ ] Invalid data shows errors
- [ ] User can correct and retry

### Permission Errors
- [ ] Clear message when action not allowed
- [ ] Redirects appropriately

## 16. Edge Cases

### Empty States
- [ ] No chores available
- [ ] No pending approvals
- [ ] Leaderboard with no data
- [ ] No family goal set

### Boundary Conditions
- [ ] Maximum overdue days (very old chore)
- [ ] Zero-point chore
- [ ] Very high point chore
- [ ] Chore with no due date

### Concurrent Actions
- [ ] Two children trying to claim same chore
- [ ] Parent approving while child editing
- [ ] Multiple approvals at same time

---

## Summary

Total test cases: ~200+

Mark each checkbox as you test the feature. Any failures should be documented and fixed.

## Known Limitations (Current Version)

- [ ] Chore creation UI not yet built (use SQL)
- [ ] Photo upload UI not yet built (framework in place)
- [ ] Timer for chores in progress (not implemented)
- [ ] Push notifications (not implemented)
- [ ] Recurring chore cron job (needs setup)
- [ ] Badge award logic (framework only)
- [ ] Cash balance tracking (payments not implemented)

## Success Criteria

✅ **Minimum Viable Product (MVP)**
- Authentication works
- Chores can be claimed and submitted
- Parents can approve/reject
- Overdue bonus calculates correctly
- Leaderboard displays correctly
- Parents included in leaderboard
- Family goals track progress

✅ **Feature Complete**
- All above + UI for chore creation
- Photo uploads
- Push notifications
- Recurring chores automated
- Badge system active
- Cash-out workflow complete

---

**Happy Testing! 🚀**

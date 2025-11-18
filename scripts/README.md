# Database Diagnostic & Setup Scripts

This directory contains comprehensive database diagnostic, monitoring, and Push Notification setup scripts for the Pizzeria Regina 2000 Torino project.

## 🔔 Push Notification Setup Scripts (ES Modules)

### Quick Setup
```bash
# Run all setup steps
npm run setup:all

# Or run individually:
npm run setup:supabase        # Create database table
npm run deploy:edge-function  # Deploy Edge Function (with instructions)
npm run setup:webhook         # Configure webhook (with instructions)
npm run test:push             # Test the system
```

## 🚀 Quick Start

### Run Basic Database Test
```bash
node test-database.js
```

### Run Comprehensive Health Check
```bash
node scripts/run-all-database-checks.js
```

## 📋 Available Scripts

### 1. `database-connection-test.js`
**Purpose**: Tests database connectivity, latency, and basic functionality

**Features**:
- Basic connection test with timing
- Latency measurement (5 quick queries)
- Throughput test (larger dataset)
- Auth system responsiveness
- Real-time connection verification

**Usage**:
```bash
node scripts/database-connection-test.js
```

**Output**: Connection health metrics and performance data

---

### 2. `database-schema-verification.js`
**Purpose**: Verifies database schema integrity and completeness

**Features**:
- Table existence verification
- Column structure validation
- Database functions check
- Row Level Security (RLS) policy testing
- Schema health scoring

**Usage**:
```bash
node scripts/database-schema-verification.js
```

**Output**: Schema health report with missing components identified

---

### 3. `database-performance-monitor.js`
**Purpose**: Monitors database performance over time

**Features**:
- Real-time query performance monitoring
- Connection health tracking
- Load testing with concurrent queries
- Real-time event monitoring
- Performance recommendations

**Usage**:
```bash
node scripts/database-performance-monitor.js [duration_in_seconds]
```

**Examples**:
```bash
# Monitor for 60 seconds (default)
node scripts/database-performance-monitor.js

# Monitor for 30 seconds
node scripts/database-performance-monitor.js 30
```

**Output**: Performance metrics and bottleneck identification

---

### 4. `database-issue-diagnostic.js`
**Purpose**: Diagnoses specific database issues found in console logs

**Features**:
- Multiple Supabase instance detection
- User registration trigger diagnostics
- Data loading timeout analysis
- RLS policy issue detection
- Missing function identification
- Actionable fix recommendations

**Usage**:
```bash
node scripts/database-issue-diagnostic.js
```

**Output**: Detailed issue analysis with priority-ordered fixes

---

### 5. `run-all-database-checks.js`
**Purpose**: Master script that runs all diagnostic tests in sequence

**Features**:
- Comprehensive health assessment
- Consolidated reporting
- Overall health scoring
- Priority action items
- Automated report generation

**Usage**:
```bash
node scripts/run-all-database-checks.js
```

**Output**: Complete database health report with recommendations

---

### 6. `fix-user-registration-trigger.js`
**Purpose**: Provides SQL to fix the user registration trigger issue

**Features**:
- Diagnoses trigger failure
- Provides complete SQL fix
- Verifies current state
- Step-by-step instructions

**Usage**:
```bash
node scripts/fix-user-registration-trigger.js
```

**Output**: SQL code and instructions for manual execution

---

## 🔍 Common Issues & Solutions

### Issue 1: "Database error saving new user"
**Cause**: Missing user profile creation trigger
**Solution**: Run `fix-user-registration-trigger.js` and execute the provided SQL

### Issue 2: "Multiple GoTrueClient instances detected"
**Cause**: Multiple Supabase client instances in frontend
**Solution**: Implement singleton pattern for Supabase client

### Issue 3: Slow query performance (>1s)
**Cause**: Missing database indexes or inefficient queries
**Solution**: Add indexes for frequently queried columns

### Issue 4: Connection timeouts
**Cause**: Network latency or database overload
**Solution**: Implement connection pooling and query optimization

## 📊 Understanding Health Scores

### Connection Health
- **Good**: Latency < 500ms, 100% success rate
- **Fair**: Latency 500-1000ms, >90% success rate  
- **Poor**: Latency >1000ms or <90% success rate

### Schema Health
- **Excellent**: 100% components present
- **Good**: 80-99% components present
- **Needs Attention**: <80% components present

### Performance Health
- **Good**: Average query time <500ms, >90% success rate
- **Fair**: Average query time 500-1000ms, >80% success rate
- **Poor**: Average query time >1000ms or <80% success rate

## 🛠️ Manual Database Fixes

### Required Supabase Dashboard Access
Some fixes require executing SQL in the Supabase Dashboard:

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to **SQL Editor**
4. Execute the provided SQL from fix scripts

### Service Role Key Required
For automated fixes, you need `SUPABASE_SERVICE_ROLE_KEY` in your environment:

```bash
# Add to .env.local
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

## 📈 Monitoring Recommendations

### Daily Health Checks
```bash
# Quick daily check
node test-database.js
```

### Weekly Comprehensive Analysis
```bash
# Full analysis with performance monitoring
node scripts/run-all-database-checks.js
```

### Performance Monitoring During High Load
```bash
# Extended monitoring during peak hours
node scripts/database-performance-monitor.js 300
```

## 🚨 Alert Thresholds

### Critical Issues (Immediate Action Required)
- User registration failures
- Connection success rate <50%
- Critical database functions missing

### High Priority Issues (Fix Within 24h)
- Query timeouts >8 seconds
- Connection latency >2 seconds
- Missing database indexes

### Medium Priority Issues (Fix Within Week)
- RLS policy misconfigurations
- Multiple client instance warnings
- Performance degradation trends

## 📝 Report Files

Scripts automatically generate detailed reports:
- `database-health-report-[timestamp].json` - Comprehensive health data
- `database-diagnostic-[timestamp].json` - Issue analysis details
- `performance-report-[timestamp].json` - Performance metrics

## 🔧 Troubleshooting

### Script Execution Errors
1. Ensure Node.js version 18+ is installed
2. Verify all dependencies are installed: `npm install`
3. Check environment variables in `.env.local`
4. Confirm Supabase URL and keys are correct

### Permission Errors
1. Verify anon key has proper permissions
2. Check RLS policies allow required operations
3. Ensure service role key is used for admin operations

### Network Issues
1. Check internet connectivity
2. Verify Supabase service status
3. Test from different network if possible

## 📞 Support

For additional help:
1. Check console logs for detailed error messages
2. Run diagnostic scripts for automated issue detection
3. Review Supabase Dashboard for service status
4. Consult project documentation for configuration details

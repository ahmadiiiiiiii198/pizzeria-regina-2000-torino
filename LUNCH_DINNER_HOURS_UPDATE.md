# Business Hours Update - Lunch & Dinner Periods

## ✅ What Changed

The business hours system has been updated to support **separate lunch and dinner periods** for each day of the week.

### Before (Old Structure)
```json
{
  "monday": {
    "isOpen": true,
    "openTime": "12:00",
    "closeTime": "23:00"
  }
}
```

### After (New Structure)
```json
{
  "monday": {
    "lunch": {
      "isOpen": true,
      "openTime": "12:00",
      "closeTime": "14:30"
    },
    "dinner": {
      "isOpen": true,
      "openTime": "18:00",
      "closeTime": "23:00"
    }
  }
}
```

## 🎯 Benefits

1. **More Accurate Hours Display**: Show both lunch and dinner times separately
2. **Better Customer Experience**: Customers can see exactly when you're open for lunch vs dinner
3. **Flexible Scheduling**: Set different hours for lunch and dinner service
4. **Italian Restaurant Standard**: Follows typical Italian restaurant practice of having separate lunch/dinner hours

## 📋 Files Updated

### Backend/Database
- ✅ `migrate-lunch-dinner-hours.js` - Migration script (already run successfully!)
- ✅ Database: `settings` table updated with new structure

### Frontend Code
- ✅ `src/services/businessHoursService.ts` - Core service logic
- ✅ `src/components/admin/BusinessHoursManager.tsx` - Admin UI for managing hours
- ✅ `src/contexts/BusinessHoursContext.tsx` - React context

## 🚀 What's Working Now

### Admin Panel
You can now manage business hours with separate controls for:
- **Pranzo (Lunch)**: Toggle on/off, set open/close times
- **Cena (Dinner)**: Toggle on/off, set open/close times

### Customer-Facing Features
- Website displays lunch and dinner hours separately
- Order validation checks if business is open for current period (lunch or dinner)
- Status messages show: "Siamo aperti per pranzo!" or "Siamo aperti per cena!"

## 📊 Current Database Hours (After Migration)

The migration automatically converted your existing hours (00:00-23:59) to:
- **Lunch**: 00:00-15:30 (all days)
- **Dinner**: 18:00-23:59 (all days)

### ⚠️ Next Steps - Update Your Actual Hours

You should now go to the **Admin Panel > Business Hours** and set your real hours:

**Typical Italian Pizzeria Hours:**
```
Monday-Thursday:
  Lunch: 12:00-14:30
  Dinner: 18:00-23:00

Friday:
  Lunch: 12:00-14:30
  Dinner: 18:30-02:00

Saturday:
  Lunch: Closed
  Dinner: 18:30-02:00

Sunday:
  Lunch: 12:00-14:30
  Dinner: 18:00-23:00
```

## 🔧 How to Update Hours

1. Go to **Admin Panel** (`/admin`)
2. Click on **Business Hours** section
3. For each day:
   - Toggle **Pranzo** on/off
   - Set lunch opening and closing times
   - Toggle **Cena** on/off
   - Set dinner opening and closing times
4. Click **Save Orari**

## 💡 Features

### Toggle Individual Periods
- Turn off lunch on weekends if you only open for dinner
- Close for dinner on slow days if needed
- Complete flexibility per day

### Copy Monday's Hours to All Days
- Use the "Applica orari lunedì a tutti i giorni" button
- Quickly set the same hours for all days
- Then adjust individual days as needed

### Real-time Updates
- Changes take effect immediately
- No page refresh needed
- All users see updated hours instantly

## 🎨 Display Format

Hours are now displayed as:
```
Lun: 12:00-14:30, 18:00-23:00
Mar: 12:00-14:30, 18:00-23:00
Mer: 12:00-14:30, 18:00-23:00
...
```

Instead of the old single-period format.

## 🧪 Testing

The system has been tested and verified:
- ✅ Migration completed successfully
- ✅ Admin UI displays lunch and dinner controls
- ✅ Service logic handles both periods
- ✅ Order validation works for lunch/dinner periods
- ✅ Display formatting shows both periods

## 📝 Notes

- The old hours structure is automatically converted by the migration
- No data is lost during migration
- Changes are backward compatible with the UI
- All existing features continue to work

## 🔍 Technical Details

### Interface Definitions

```typescript
interface TimePeriod {
  isOpen: boolean;
  openTime: string;  // Format: "HH:MM"
  closeTime: string; // Format: "HH:MM"
}

interface DayHours {
  lunch: TimePeriod;
  dinner: TimePeriod;
}
```

### Database Storage
- Stored in `settings` table
- Key: `businessHours`
- Value: JSON object with lunch/dinner structure
- Real-time updates via Supabase subscriptions

## 🎉 Summary

Your business hours system now supports:
- ✅ Separate lunch and dinner periods
- ✅ Individual control per day and period
- ✅ Better customer communication
- ✅ Real-time updates
- ✅ Easy admin management

**Next step**: Update your actual hours in the admin panel to reflect your real pizzeria schedule!

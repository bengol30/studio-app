# 🗄️ DB.md – זיכרון DB-AGENT
> מנוהל: DB-AGENT
> עדכן אחרי כל migration

---

## כלל עליון
**לפני כל migration** → שאל SECURITY-AGENT לאשר את ה-RLS.
**אחרי כל migration** → עדכן את הסכימה ב-MEMORY.md ואת הטבלאות פה.

---

## Migrations שבוצעו

| # | קובץ | תיאור | תאריך | סביבה |
|---|------|--------|-------|-------|
| — | — | טרם בוצע | — | — |

---

## RLS Policies מוגדרות

| טבלה | Policy Name | סוג | תנאי | תאריך |
|------|------------|-----|------|-------|
| — | — | — | — | — |

### מטריצת הרשאות (יעד)

| טבלה | לקוח אנונימי | לקוח עם token | מנהל |
|------|-------------|---------------|------|
| services | SELECT | SELECT | ALL |
| packages | SELECT | SELECT | ALL |
| service_fields | SELECT | SELECT | ALL |
| bookings | INSERT | SELECT לפי token | ALL |
| clients | — | — | ALL |
| events | SELECT | SELECT | ALL |
| event_registrations | INSERT | — | ALL |
| tasks | — | — | ALL |
| whatsapp_qa | — | — | ALL |
| whatsapp_templates | — | — | ALL |
| settings | SELECT (public keys) | SELECT | ALL |

---

## Indexes מוגדרים

| טבלה | עמודה/ות | סיבה |
|------|---------|-------|
| bookings | (booking_date, status) | חיפושי יומן |
| bookings | token | lookup מהיר |
| bookings | client_phone | קישור ללקוח |
| clients | phone | UNIQUE, חיפוש |
| event_registrations | event_id | שליפת נרשמים |
| service_fields | (service_id, display_order) | סדר שדות |

---

## Helper Functions ב-lib/supabase.ts

```typescript
// יתמלא על ידי DB-AGENT תוך כדי פיתוח
// פורמט:
// export async function getServices(): Promise<Service[]>
// export async function getAvailableSlots(serviceId: string, date: string, durationMin: number): Promise<string[]>
// export async function createBooking(data: CreateBookingInput): Promise<Booking>
// export async function getBookingByToken(token: string): Promise<Booking | null>
// export async function confirmBooking(id: string): Promise<void>
// export async function getClientByPhone(phone: string): Promise<Client | null>
// export async function upsertClient(name: string, phone: string): Promise<Client>
```

---

## תבנית Migration סטנדרטית

```sql
-- Migration: [שם תיאורי]
-- Date: [תאריך]
-- Author: DB-AGENT
-- Description: [מה עושה]

-- ─── יצירת טבלה ───────────────────────────────
CREATE TABLE IF NOT EXISTS table_name (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- ... שדות ...
  is_deleted  BOOLEAN NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── Auto-update updated_at ────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_table_name_updated_at
  BEFORE UPDATE ON table_name
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─── RLS ───────────────────────────────────────
ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;

-- ─── Policies ──────────────────────────────────
-- (לאשר עם SECURITY-AGENT לפני)
CREATE POLICY "public_select" ON table_name
  FOR SELECT USING (is_deleted = false);

-- ─── Indexes ───────────────────────────────────
CREATE INDEX idx_table_name_field ON table_name(field);
```

---

## לוגיקת זמינות – חשוב מאוד

```
slot פנוי = לא קיים booking שחופף לטווח [start_time, start_time + duration + buffer]
buffer = 10 דקות (מ-settings.buffer_minutes)
חסימה גם מ-Google Calendar (אירועים חיצוניים)
חישוב end_time = start_time + duration_minutes + buffer_minutes
```

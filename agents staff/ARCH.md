# 🏗️ ARCH.md – ארכיטקטורה והחלטות מבנה
> מנוהל: ARCHITECT-AGENT
> לא לשנות החלטות קיימות ללא תיעוד סיבה

---

## החלטות יסוד – סגורות

| # | החלטה | סיבה | תאריך |
|---|-------|-------|--------|
| 1 | Next.js 14 App Router בלבד | ביצועים, Server Components | פרה-פיתוח |
| 2 | TypeScript strict mode, אסור `any` | מניעת bugs | פרה-פיתוח |
| 3 | Supabase בלבד (לא Prisma, לא Drizzle) | פשטות + edge compatibility | פרה-פיתוח |
| 4 | Server Components כברירת מחדל | ביצועים + SEO | פרה-פיתוח |
| 5 | `use client` רק לevent handlers ו-state | ביצועים | פרה-פיתוח |
| 6 | Server Actions לכל mutations (לא client fetch) | security + simplicity | פרה-פיתוח |
| 7 | Tailwind CSS בלבד | עקביות | פרה-פיתוח |
| 8 | shadcn/ui לcomponents בסיסיים | מהירות + עקביות | פרה-פיתוח |

---

## Data Flow – הזמנה חדשה (קריטי) – עדכני ✅

```
לקוח ממלא אשף (5 שלבים)
        ↓
POST /api/bookings
        ↓
Server: בדיקת זמינות + חישוב end_time (start + duration + 10min buffer)
        ↓
DB: INSERT bookings (status='pending', token=UUID)
        ↓
lib/whatsapp.ts → sendGenericWhatsAppMessage(name, phone, 'new_booking', message)
        ↓
POST Make.com webhook: { name, phone: "972...", action: "new_booking", message }
        ↓
Make.com → WhatsApp ללקוח (אישור קבלה + לינק לפרטים)
        ↓
Response ללקוח: { token: "uuid..." }
        ↓
לקוח מועבר ל /booking/success (עם לינק לtoken)

─── מנהל מאשר בממשק ───

PATCH /api/admin/bookings/[id] { status: 'confirmed' }
        ↓
DB: UPDATE status='confirmed'
        ↓
lib/google-calendar.ts → createEvent()
        ↓
lib/whatsapp.ts → sendGenericWhatsAppMessage(..., 'booking_confirmed', message)
        ↓
Make.com → WhatsApp ללקוח (אישור + פרטים מלאים)
```

---

## WhatsApp Webhook Payload – קבוע לכל הפעולות

```json
{
  "name":    "שם הלקוח",
  "phone":   "97252...",
  "action":  "new_booking | booking_confirmed | booking_rejected | booking_cancelled_by_admin | booking_cancelled_by_client | quick_book | waitlist_joined | event_registered | bulk_whatsapp",
  "message": "תוכן ההודעה שהלקוח אמור לקבל"
}
```

> פונקציה: `lib/whatsapp.ts` → `sendGenericWhatsAppMessage(name, phone, action, message)`
> ווהוק: `https://hook.us2.make.com/f2jsjitosbx3ceeyd1u9emgydc9ou9a4`

---

## מבנה אשף הזמנה

```tsx
// /app/book/page.tsx – Server Component
// מביא services מ-DB, מעביר ל-BookingWizard

// /components/booking/BookingWizard.tsx – 'use client'
// מנהל state של כל 5 השלבים + הרשמה לרשימת המתנה (Waitlist)
// state: { step, serviceId, packageId, date, time, name, phone, answers, filesUrl, waitlistDate }

// שלב 1: Step1Service.tsx – רשימת שירותים
// שלב 2: Step2Package.tsx – חבילה + תאריך (קורא /api/availability)
// שלב 3: Step3Details.tsx – שם + טלפון + dynamic fields
// שלב 4: Step4Files.tsx – קישור קובץ + V תקנון
// שלב 5: Step5Confirm.tsx – סיכום + שליחה (Server Action)
```

---

## מבנה Admin Layout

```tsx
// /app/admin/layout.tsx
// בודק Supabase session → אם לא מחובר: redirect('/admin/login')
// מרנדר: sidebar navigation + main content (כולל כפתור Quick Book / Block Time גלובלי)
```

---

## TypeScript Types עיקריים

```typescript
// /types/index.ts – יוגדר על ידי ARCHITECT בתחילת שלב 1

type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'rejected'
type EventStatus = 'open' | 'full' | 'cancelled'
type TaskStatus = 'open' | 'in_progress' | 'done'
type FieldType = 'text' | 'textarea' | 'select' | 'checkbox'

interface Service { id: string; name: string; description: string; packages: Package[]; fields: ServiceField[] }
interface Package { id: string; service_id: string; name: string; duration_minutes: number; price: number }
interface ServiceField { id: string; label: string; field_type: FieldType; is_required: boolean; options?: string[] }
interface Booking { id: string; token: string; service_id: string; package_id: string; client_name: string; client_phone: string; booking_date: string; start_time: string; end_time: string; status: BookingStatus; dynamic_answers: Record<string,string>; notes_internal?: string }
interface Client { id: string; name: string; phone: string; notes?: string; payment_status: string; tags?: string[] }
interface Event { id: string; title: string; event_type: string; event_date: string; event_time: string; price: number; max_attendees: number; current_attendees: number; custom_fields: ServiceField[]; status: EventStatus }
interface Waitlist { id: string; service_id: string; client_name: string; client_phone: string; requested_date: string; created_at: string }
```

---

## פיצ'רים שטרם הוחלט עליהם

| פיצ'ר | שאלה | מחליט |
|-------|-------|-------|
| Caching strategy | SWR? React Query? next/cache? | ARCHITECT שלב 1 |
| Loading states | Skeleton UI? Spinner? | UI שלב 1 |
| Error boundaries | כמה רמות? | ARCHITECT שלב 1 |
| Image optimization | next/image + Supabase CDN? | ARCHITECT שלב 1 |

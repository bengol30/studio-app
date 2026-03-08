# 🧠 MEMORY.md – הזיכרון המשותף של כל האייג'נטים
> ⚠️ כל אייג'נט קורא את הקובץ הזה לפני שעושה כל דבר בכל סשן.
> ⚠️ כל אייג'נט מעדכן את הסעיפים הרלוונטיים לו אחרי כל פעולה.

---

## 🏢 על הפרויקט

**שם:** מערכת ניהול אולפן קריית שמונה
**בעלים:** בן – Bengo Productions
**מטרה:** מערכת ווב לניהול אולפן הקלטות – הזמנות, לקוחות, אירועים, WhatsApp, Google Calendar
**שפה:** עברית בלבד, RTL
**סגנון:** Dark theme, אולפן מוזיקה

---

## 📦 מבנה קבצי הפרויקט

```
/studio-app
├── /app                              ← Next.js 14 App Router
│   ├── page.tsx                      דף בית לקוח
│   ├── /book
│   │   └── page.tsx                  אשף הזמנת תור (5 שלבים)
│   ├── /about
│   │   └── page.tsx                  עמוד אודות האולפן
│   ├── /events
│   │   ├── page.tsx                  רשימת אירועים
│   │   └── /[id]
│   │       └── page.tsx              אירוע בודד + הרשמה
│   ├── /booking
│   │   ├── /[token]
│   │   │   └── page.tsx              לינק אישי לצפייה/ביטול/עריכה
│   │   └── /success
│   │       └── page.tsx              דף תודה
│   └── /admin                        ← ממשק מנהל (מוגן Auth)
│       ├── layout.tsx                בדיקת Auth + ניווט
│       ├── /dashboard/page.tsx
│       ├── /bookings/page.tsx        הזמנות ממתינות לאישור
│       ├── /calendar/page.tsx        יומן חודשי+שבועי+רשימה
│       ├── /clients/page.tsx         CRM – רשימת לקוחות
│       ├── /clients/[id]/page.tsx    תיק לקוח בודד
│       ├── /services/page.tsx        שירותים + חבילות
│       ├── /events/page.tsx          ניהול אירועים
│       ├── /tasks/page.tsx           לוח משימות
│       ├── /whatsapp/page.tsx        בוט + תבניות + Q&A
│       └── /settings/page.tsx        הגדרות מערכת
├── /components
│   ├── /ui                           shadcn/ui base components
│   ├── /booking                      קומפוננטות אשף הזמנה
│   │   ├── BookingWizard.tsx
│   │   ├── Step1Service.tsx
│   │   ├── Step2Package.tsx
│   │   ├── Step3Details.tsx
│   │   ├── Step4Files.tsx
│   │   └── Step5Confirm.tsx
│   ├── /admin                        קומפוננטות ממשק מנהל
│   └── /events                       קומפוננטות אירועים
├── /lib
│   ├── supabase.ts                   Supabase browser client
│   ├── supabase-server.ts            Supabase server client
│   ├── supabase-admin.ts             Supabase service role (server only!)
│   ├── google-calendar.ts            Google Calendar API wrapper
│   ├── make-webhooks.ts              Make.com webhook (legacy)
│   └── whatsapp.ts                   ⭐ חדש – sendGenericWhatsAppMessage → Make.com webhook ישיר
├── /types
│   └── index.ts                      כל ה-TypeScript types/interfaces
├── /app/api
│   ├── /bookings/route.ts            POST – הזמנה חדשה
│   ├── /bookings/[id]/route.ts       PATCH – עדכון הזמנה
│   ├── /bookings/token/[token]/route.ts  GET – הזמנה לפי token
│   ├── /availability/route.ts        GET – זמינות
│   ├── /services/route.ts            GET – שירותים + חבילות
│   ├── /events/route.ts              GET/POST – אירועים
│   ├── /events/[id]/register/route.ts POST – הרשמה לאירוע
│   └── /webhooks/make/route.ts       POST – webhook נכנס מ-Make.com
├── /supabase
│   └── /migrations                   קבצי SQL migration
├── .env.local                        ← לא מועלה ל-Git!
├── MEMORY.md                         ← הקובץ הזה
├── TASKS.md
├── STATUS.md
├── ARCH.md
├── DB.md
├── CODER.md
├── UI.md
├── REVIEW.md
├── SECURITY.md
├── DEPLOY.md
└── QA.md
```

---

## 🗄️ סכימת DB – כל הטבלאות

> מעדכן: DB-AGENT אחרי כל migration. תמיד מדויק.

### טבלה: `services`
| עמודה | סוג | תיאור |
|-------|-----|--------|
| id | UUID PK | |
| name | TEXT NOT NULL | שם השירות |
| description | TEXT | תיאור ללקוח |
| is_active | BOOLEAN DEFAULT true | |
| is_deleted | BOOLEAN DEFAULT false | |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |

### טבלה: `packages`
| עמודה | סוג | תיאור |
|-------|-----|--------|
| id | UUID PK | |
| service_id | UUID FK → services | |
| name | TEXT | שם חבילה |
| duration_minutes | INTEGER | משך בדקות |
| price | INTEGER | מחיר ב-₪ |
| is_active | BOOLEAN DEFAULT true | |
| is_deleted | BOOLEAN DEFAULT false | |

### טבלה: `service_fields`
| עמודה | סוג | תיאור |
|-------|-----|--------|
| id | UUID PK | |
| service_id | UUID FK → services | |
| label | TEXT | שאלה שמוצגת ללקוח |
| field_type | TEXT | text/textarea/select/checkbox |
| options | JSONB | אפשרויות לselect |
| is_required | BOOLEAN | |
| display_order | INTEGER | סדר הצגה |

### טבלה: `bookings`
| עמודה | סוג | תיאור |
|-------|-----|--------|
| id | UUID PK | |
| service_id | UUID FK → services | |
| package_id | UUID FK → packages | |
| client_name | TEXT NOT NULL | |
| client_phone | TEXT NOT NULL | |
| booking_date | DATE NOT NULL | |
| start_time | TIME NOT NULL | |
| end_time | TIME NOT NULL | אוטומטי = start + duration + buffer |
| status | TEXT | pending/confirmed/cancelled/rejected |
| dynamic_answers | JSONB | תשובות לשאלות הדינמיות |
| files_url | TEXT | קישור לקובץ/URL שנשלח |
| notes_internal | TEXT | הערות פנימיות (מנהל בלבד) |
| token | UUID UNIQUE | לינק אישי ללקוח |
| google_event_id | TEXT | ID באירוע ב-Google Calendar |
| is_deleted | BOOLEAN DEFAULT false | |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |

### טבלה: `clients`
| עמודה | סוג | תיאור |
|-------|-----|--------|
| id | UUID PK | |
| name | TEXT NOT NULL | |
| phone | TEXT UNIQUE NOT NULL | |
| notes | TEXT | הערות ידניות |
| payment_status | TEXT | paid/unpaid/partial |
| is_deleted | BOOLEAN DEFAULT false | |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |

### טבלה: `events`
| עמודה | סוג | תיאור |
|-------|-----|--------|
| id | UUID PK | |
| title | TEXT NOT NULL | |
| description | TEXT | |
| event_type | TEXT | jam/listening/workshop/performance/podcast/other |
| event_date | DATE NOT NULL | |
| event_time | TIME NOT NULL | |
| location | TEXT | חדר / כתובת |
| price | INTEGER | 0 = חינם |
| max_attendees | INTEGER | |
| current_attendees | INTEGER DEFAULT 0 | |
| image_url | TEXT | thumbnail |
| host_name | TEXT | שם מנחה/אמן |
| custom_fields | JSONB | שאלות דינמיות שהמנהל הגדיר |
| status | TEXT | open/full/cancelled |
| google_event_id | TEXT | |
| is_deleted | BOOLEAN DEFAULT false | |
| created_at | TIMESTAMPTZ | |

### טבלה: `event_registrations`
| עמודה | סוג | תיאור |
|-------|-----|--------|
| id | UUID PK | |
| event_id | UUID FK → events | |
| client_name | TEXT NOT NULL | |
| client_phone | TEXT NOT NULL | |
| answers | JSONB | תשובות לshidot דינמיים |
| created_at | TIMESTAMPTZ | |

### טבלה: `tasks`
| עמודה | סוג | תיאור |
|-------|-----|--------|
| id | UUID PK | |
| client_id | UUID FK → clients NULLABLE | |
| booking_id | UUID FK → bookings NULLABLE | |
| title | TEXT NOT NULL | |
| description | TEXT | |
| status | TEXT | open/in_progress/done |
| due_date | DATE | |
| created_at | TIMESTAMPTZ | |

### טבלה: `whatsapp_qa`
| עמודה | סוג | תיאור |
|-------|-----|--------|
| id | UUID PK | |
| question | TEXT NOT NULL | |
| answer | TEXT NOT NULL | |
| keywords | TEXT[] | מילות מפתח לzיהוי |
| is_active | BOOLEAN DEFAULT true | |

### טבלה: `whatsapp_templates`
| עמודה | סוג | תיאור |
|-------|-----|--------|
| id | UUID PK | |
| trigger_key | TEXT UNIQUE | booking_confirmed/booking_rejected/reminder_24h/event_registered/event_reminder/booking_cancelled |
| message_he | TEXT NOT NULL | תבנית עם {{variables}} |
| updated_at | TIMESTAMPTZ | |

### טבלה: `settings`
| עמודה | סוג | תיאור |
|-------|-----|--------|
| key | TEXT PK | |
| value | JSONB NOT NULL | |
| updated_at | TIMESTAMPTZ | |

**Settings keys:**
- `opening_hours` → `{"sunday":{"open":"09:00","close":"22:00","active":true}, ...}`
- `buffer_minutes` → `10`
- `cancellation_hours` → `48`
- `terms_of_service` → `"טקסט התקנון..."`
- `studio_info` → `{"name":"...", "address":"...", "phone":"...", "whatsapp":"..."}`

---

## 🔌 API Routes – מלא ועדכני

> מעדכן: CODER-AGENT אחרי כל route חדש

| Method | Route | Auth | תיאור |
|--------|-------|------|--------|
| GET | `/api/services` | ציבורי | שירותים + חבילות + שדות דינמיים |
| GET | `/api/availability` | ציבורי | זמינות לפי service_id + date |
| POST | `/api/bookings` | ציבורי | יצירת הזמנה חדשה → status=pending |
| GET | `/api/bookings/token/[token]` | ציבורי | הזמנה לפי token ללקוח |
| PATCH | `/api/bookings/token/[token]` | ציבורי | ביטול/עריכה ע"י לקוח (תוך 48ש') |
| GET | `/api/events` | ציבורי | אירועים פעילים |
| GET | `/api/events/[id]` | ציבורי | אירוע בודד |
| POST | `/api/events/[id]/register` | ציבורי | הרשמה לאירוע |
| POST | `/api/webhooks/make` | Secret header | webhook נכנס מ-Make.com |
| GET | `/api/admin/bookings` | Admin | כל ההזמנות |
| PATCH | `/api/admin/bookings/[id]` | Admin | אישור/דחייה/עריכה |
| GET | `/api/admin/clients` | Admin | רשימת לקוחות |
| GET | `/api/admin/clients/[id]` | Admin | תיק לקוח מלא |
| GET | `/api/admin/calendar` | Admin | אירועים לtimerange |
| * | `/api/admin/*` | Admin | כל שאר routes המנהל |

---

## 🏗️ החלטות ארכיטקטורה – לא לשנות

| # | החלטה | סיבה |
|---|-------|-------|
| 1 | Auth רק למנהל – Supabase Auth | לקוחות לא נרשמים |
| 2 | לקוח מזוהה רק עם UUID token | פשטות UX |
| 3 | Google Calendar דרך `lib/google-calendar.ts` בלבד | ריכוז |
| 4 | WhatsApp דרך ישירות ל-Make.com webhook | ללא Make.com Business API |
| 4a | כל וובהוק שולח `{name, phone, action, message}` ללקוח בלבד | פילוד נקי, Make.com מנהל השליחה |
| 4b | **אין** בוט/Q&A WhatsApp – רק שליחה יוצאת (outbound) | inbound webhooks (Make.com→App) יוצרים חוסר סנכרון – בוטל 08/03/26 |
| 5 | Files: Supabase Storage בלבד | ריכוז infra |
| 6 | DB queries: Supabase client בלבד (לא Prisma) | פשטות |
| 7 | Server Components כברירת מחדל | ביצועים |
| 8 | `use client` רק לevent handlers/state | ביצועים |
| 9 | Buffer 10 דקות – server-side בלבד, לא מוצג ללקוח | UX |
| 10 | Soft delete בלבד (`is_deleted=true`) | היסטוריה |
| 11 | TypeScript strict – אסור `any` | איכות קוד |
| 12 | כל mutation דרך Server Action | security |

---

## 🎨 עקרונות עיצוב – לא לשנות

| פרמטר | ערך |
|--------|-----|
| כיוון | RTL, `dir="rtl"` על כל container ראשי |
| שפה | עברית בלבד |
| bg ראשי | `#0F0F1A` |
| bg כרטיס | `#1A1A2E` |
| bg מוגבה | `#252540` |
| accent | `#E94560` |
| accent2 | `#0F3460` |
| טקסט ראשי | `#EAEAEA` |
| טקסט משני | `#888899` |
| גבול | `#2A2A3E` |
| הצלחה | `#27AE60` |
| שגיאה | `#E74C3C` |
| font עברית | Heebo |
| font אנגלית | Inter |
| CSS | Tailwind CSS בלבד |

---

## 👥 מי כל אייג'נט

| אייג'נט | תפקיד | קובץ זיכרון |
|---------|--------|------------|
| 🎯 ROUTER | מנתב משימות | MEMORY + STATUS |
| 📋 PM | TASKS.md + STATUS.md | MEMORY + TASKS + STATUS |
| 🏗️ ARCHITECT | מבנה לפני פיתוח | MEMORY + ARCH |
| 🗄️ DB | SQL, migrations, RLS | MEMORY + DB |
| 💻 CODER | Next.js, React, Server Actions | MEMORY + ARCH + CODER |
| 🎨 UI | Tailwind, RTL, dark theme | MEMORY + UI |
| 🔍 REVIEW | Code review לפני merge | MEMORY + REVIEW |
| 🔒 SECURITY | RLS, חשיפות, אבטחה | MEMORY + SECURITY |
| 🚀 DEPLOY | Vercel, env, CI/CD | MEMORY + DEPLOY |
| ✅ QA | בדיקות, edge cases | MEMORY + QA |

---

## 📊 מצב שלבי הפיתוח

| שלב | תוכן | סטטוס |
|-----|-------|--------|
| שלב 1 | Setup + הזמנות + יומן + Google Calendar | ✅ הושלם |
| שלב 2 | CRM + WhatsApp outbound + Admin Features | ✅ ~90% – Review/QA/Deploy נשארו |
| שלב 3 | אירועים + AI דאשבורד + גלריה | 🔲 לא התחיל |

---

## 📝 סיכום סשנים

> מעדכן: כל אייג'נט בסוף הסשן שלו

| תאריך | אייג'נט | מה נעשה | מה נשאר |
|--------|---------|---------|---------|
| 07/03/26 | CODER | Phase A-F: Next.js setup, DB migrations ל-Supabase, Auth, 6 API routes, Booking Wizard 5 שלבים, Homepage, Admin pages (bookings+calendar+settings) | Design pass, Code Review, Security, QA, Deploy |
| 07/03/26 | UI | Design pass – Tailwind color naming fix, homepage redesign | Design, QA, Deploy |
| 07/03/26 | REVIEW+SEC+CODER | Code Review ✅ + Security Audit ✅ + תיקונים: Server Action auth, loading/error pages, UUID token validation | QA, Deploy |
| 07/03/26 | QA | QA ✅ – API tests, edge cases, code analysis. bug: error.tsx חסר תוקן | Deploy |

## ⚙️ Tailwind Classes – IMPORTANT (עדכני)

| שימוש | Class |
|-------|-------|
| רקע ראשי | `bg-primary` |
| רקע כרטיס | `bg-card` |
| טקסט ראשי | `text-primary-text` |
| טקסט משני | `text-muted` |
| accent | `bg-accent` / `text-accent` |
| border | `border-white/10` |

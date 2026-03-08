# 📊 STATUS.md – מצב הפרויקט
> מעדכן: PM-AGENT בסוף כל סשן
> קורא: כולם לפני שמתחילים

---

## 🎯 מצב נוכחי

**שלב:** שלב 2 – WhatsApp + Admin Features ✅ הושלם לחלוטין!
**עדכון אחרון:** 08/03/2026
**השלמה כללית:** שלב 1 100% ✅ + שלב 2 100% ✅ (Task 29+30 בוטלו במכוון)

---

## ✅ מה הושלם

### PHASE A – תשתית
- [x] Next.js 14 + TypeScript + Tailwind + shadcn/ui + Heebo font
- [x] RTL, dark theme, dir="rtl", lang="he"
- [x] Supabase project מחובר (ref: rljtmmurnvujdvutrtud)
- [x] GitHub repo: github.com/bengol30/studio-app
- [x] Vercel deploy (מחובר לrepository)

### PHASE B – DB + Security
- [x] 12 טבלאות: services, packages, service_fields, bookings, clients, events, event_registrations, tasks, whatsapp_qa, whatsapp_templates, settings
- [x] SQL migration: 001_initial_schema.sql (פועל ב-Supabase!)
- [x] RLS policies: 002_rls_policies.sql (פועל ב-Supabase!)
- [x] Default data: 7 WhatsApp templates + settings מלאים

### PHASE C – TypeScript + Lib
- [x] /types/index.ts – כל הinterfaces
- [x] /lib/supabase.ts – browser client
- [x] /lib/supabase-server.ts – server client
- [x] /lib/supabase-admin.ts – service role
- [x] /lib/google-calendar.ts – createEvent, deleteEvent, getEvents
- [x] /lib/make-webhooks.ts – triggerWebhook (legacy, עדיין קיים)
- [x] /lib/whatsapp.ts – **חדש** `sendGenericWhatsAppMessage(name, phone, action, message)` → Make.com webhook ישיר

### PHASE D – Auth
- [x] middleware.ts – הגנה על /admin/*
- [x] /admin/login – login form + Supabase Auth
- [x] /admin/layout.tsx – admin shell + sidebar
- [x] /admin/dashboard – עם נתונים אמיתיים (stats + הזמנות אחרונות)

### PHASE E – Backend APIs
- [x] GET /api/services
- [x] GET /api/availability (זמינות + buffer + Google Calendar)
- [x] POST /api/bookings (validation, availability check, upsert client, webhook)
- [x] GET/PATCH /api/bookings/token/[token]
- [x] GET /api/admin/bookings (עם פילטרים)
- [x] PATCH /api/admin/bookings/[id] (אישור/דחייה + Google Calendar + webhook)

### PHASE F – Frontend
- [x] /book – BookingWizard 5 שלבים מלאים
- [x] /booking/[token] – פרטי הזמנה + ביטול
- [x] /booking/success – דף תודה
- [x] / – Homepage עם hero + שירותים
- [x] /admin/bookings – הזמנות ממתינות + אישור/דחייה
- [x] /admin/calendar – לוח שנה חודשי + רשימה
- [x] /admin/settings – שעות פתיחה + buffer + תנאים

### PHASE G – Design + Review + Security + QA
- [x] Design pass Customer + Admin (Tailwind dark theme, RTL)
- [x] Tailwind color naming bug תוקן (bg-primary, text-primary-text, text-muted)
- [x] loading.tsx + error.tsx לכל data routes (9 קבצים)
- [x] Server Actions auth check (admin/bookings, admin/settings)
- [x] Token UUID regex validation
- [x] Code Review ✅ APPROVED
- [x] Security Audit ✅ APPROVED
- [x] QA – API tests + code analysis ✅

---

## ✅ שלב 1 הושלם!

- **URL:** https://studio-app-psi.vercel.app
- **Task 26:** Deploy לVercel ✅ הושלם (07/03/26)
- **Task 27:** Playwright E2E ✅ 14/14 עברו (08/03/26) – 4 באגים תוקנו
- **Admin user:** admin@bengo.co.il / Admin1234
- **שירות לדוגמה:** הקלטת שיר | חבילה בסיסית | 60 דק | ₪300
- **ממתין:** Google Calendar + Make.com credentials מבן (שלב 2)

---

## 🚫 תקוע / בעיות פתוחות

- ✅ **WhatsApp webhook חדש** – `lib/whatsapp.ts` + `/api/admin/whatsapp` פועלים. כל פעולה שולחת `{name, phone, action, message}` לוובהוק של Make.com.
- ✅ **Admin Features** – Bulk Actions, Quick Book, Block Time, Client Tags – הכל עובד.
- 🚫 **WhatsApp Q&A ממשק + בוט AI (Task 29+30)** – בוטלו. דורשים Make.com inbound webhooks → סיכון לחוסר סנכרון. לא יפותחו.
- ⚠️ **Google Calendar** – חסרים credentials (GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REFRESH_TOKEN). הקוד מוכן, מחכה לבן.

---

## ⚠️ דברים שבן צריך לספק

- [x] Supabase project URL + keys ✅
- [x] Vercel account + deploy ✅
- [ ] Google Calendar OAuth credentials (GOOGLE_CLIENT_ID, SECRET, REFRESH_TOKEN, CALENDAR_ID)
- [ ] Make.com Webhook secret (MAKE_WEBHOOK_SECRET)
- [ ] דומיין (עדיין לא נקבע)

---

## 📝 סשן אחרון

**תאריך:** 08/03/2026
**מה נעשה:**
- הוגדר `lib/whatsapp.ts` עם `sendGenericWhatsAppMessage(name, phone, action, message)` → Make.com webhook ישיר (ללא MAKE_WEBHOOK_SECRET)
- נוצרו Admin Features: Bulk WhatsApp, Quick Book, Block Time, Client Tags (tags JSONB בטבלת clients)
- כל event triggers שולחים עכשיו WhatsApp: new_booking, booking_confirmed, booking_rejected, booking_cancelled_by_admin, booking_cancelled_by_client, quick_book, waitlist_joined, event_registered, bulk_whatsapp
- הוסף `/api/admin/whatsapp` route לשליחה כמותית
- תוקן באג בדף `booking/[token]` (שאילתה עם עמודה שגויה `booking_token` → `token`)
- נוסף `error.tsx` ל-`/admin/(protected)/`
- Webhook payload מסודר: name=שם לקוח, phone=972..., action=סוג פעולה, message=הודעה ללקוח
**קבצים ששונו:** lib/whatsapp.ts (חדש), app/api/admin/whatsapp/route.ts (חדש), app/api/admin/bookings/quick/route.ts, app/api/admin/bookings/block/route.ts, app/api/admin/bookings/bulk/route.ts, app/api/bookings/route.ts, app/api/bookings/token/[token]/route.ts, app/api/waitlist/route.ts, app/api/events/[id]/register/route.ts, app/api/admin/bookings/[id]/route.ts, app/admin/(protected)/bookings/AdminBookingsList.tsx, app/admin/(protected)/error.tsx, app/booking/[token]/page.tsx, .env.local (הוסף ADMIN_PHONE + ADMIN_NAME)

---

## 🗓️ היסטוריית כל הסשנים

| תאריך | אייג'נט | תיאור | קבצים ששונו |
|--------|---------|--------|------------|
| 07/03/26 | CODER | Phase A-F: setup → DB → auth → APIs → frontend wizard | 30+ קבצים |
| 07/03/26 | UI | Design pass + Tailwind bug fix (color naming) | tailwind.config.ts, globals.css, page.tsx |
| 07/03/26 | REVIEW+SEC | Code Review + Security Audit + תיקונים | admin pages auth, 8 loading/error files, token validation |
| 07/03/26 | QA | QA שלב 1 – API tests, code analysis, bug fix | app/booking/[token]/error.tsx |
| 07/03/26 | DEPLOY | Deploy שלב 1 לVercel Production | .vercel/ (local) |
| 08/03/26 | QA+CODER | Playwright E2E – 4 באגים נמצאו ותוקנו, 14/14 עברו | middleware.ts, admin layout, api/services, api/bookings |
| 08/03/26 | CODER | תיקון NEXT_PUBLIC_SITE_URL (קריטי – כל הדפים לא הציגו נתונים בפרודקשן), revalidatePath ללקוח, dashboard אמיתי, event webhook | app/page.tsx, events/*, book/*, booking/*, admin/events, admin/services, admin/dashboard, api/events/[id]/register |
| 08/03/26 | CODER | סנכרון מלא אדמין↔לקוח: revalidatePath /booking + /admin/calendar + /admin/dashboard בעדכון הזמנה, /book בשמירת settings, force-dynamic לדף הזמנה | admin/bookings, admin/settings, booking/[token] |
| 08/03/26 | UI | PHASE H: ClientHeader, WhatsApp floating button, אירועים בדף הבית, תמונות לאירועים, hero image, image_url + WhatsApp בהגדרות | 7 קבצים |
| 08/03/26 | DEPLOY | git push → Vercel deploy אוטומטי (commit 6b461c5) – 24 קבצים, כל שינויי היום | github.com/bengol30/studio-app |
| 08/03/26 | CODER | העלאת תמונות לאירועים – Supabase Storage bucket + API route + ImageUpload component + CreateEventForm | 5 קבצים (commit 3965f61) |
| 08/03/26 | CODER | Admin Features + WhatsApp Webhook: Bulk Actions, Quick Book, Block Time, Client Tags, waitlist, event registration. lib/whatsapp.ts חדש – Make.com webhook ישיר עם payload מסודר `{name, phone, action, message}` | 14+ קבצים |
| 08/03/26 | REVIEW+DEPLOY | Task 32+33: Review שלב 2 – 3 באגים תוקנו (bulk status whitelist, waitlist arg order, block route cleanup). git push ל-main (commit 638a191, 32 קבצים). Vercel deploy אוטומטי. | bulk/route.ts, waitlist/route.ts, block/route.ts |

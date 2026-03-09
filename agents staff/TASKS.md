# 📋 TASKS.md – ניהול משימות מרכזי
> מנוהל: PM-AGENT | קורא: כולם
> עדכן סטטוס אחרי כל שינוי

---

## 🔴 שלב 1 – עדיפות גבוהה (עכשיו)

| # | משימה | אייג'נט | סטטוס | הערות |
|---|--------|---------|--------|-------|
| 1 | Setup: Next.js 14 + TypeScript + Tailwind | CODER | ✅ הושלם | 07/03/26 |
| 2 | Setup: Supabase project + connect | CODER | ✅ הושלם | 07/03/26 – rljtmmurnvujdvutrtud |
| 3 | Setup: Vercel deploy ריק | DEPLOY | ✅ הושלם | 07/03/26 |
| 4 | יצירת כל טבלאות DB (migration מלא) | DB | ✅ הושלם | 001_initial_schema.sql |
| 5 | RLS לכל טבלאות שלב 1 | SECURITY | ✅ הושלם | 002_rls_policies.sql |
| 6 | TypeScript types + Supabase lib files | ARCHITECT | ✅ הושלם | types/index.ts + lib/* |
| 7 | Supabase Auth למנהל (login/logout/middleware) | CODER | ✅ הושלם | middleware.ts + admin/login |
| 8 | `/api/services` – שירותים + חבילות + שדות | CODER | ✅ הושלם | app/api/services/route.ts |
| 9 | `/api/availability` – לוגיקת זמינות + buffer | CODER | ✅ הושלם | app/api/availability/route.ts |
| 10 | `/api/bookings` POST – הזמנה חדשה | CODER | ✅ הושלם | app/api/bookings/route.ts |
| 11 | `/api/bookings/token/[token]` GET+PATCH | CODER | ✅ הושלם | app/api/bookings/token/[token]/route.ts |
| 12 | Admin: `/api/admin/bookings` GET+PATCH | CODER | ✅ הושלם | app/api/admin/bookings/ |
| 13 | אשף הזמנה – 5 שלבים (BookingWizard) | CODER | ✅ הושלם | components/booking/* |
| 14 | דף הזמנה + success + token page | CODER | ✅ הושלם | app/book, app/booking/* |
| 15 | דף בית לקוח | CODER | ✅ הושלם | app/page.tsx |
| 16 | Admin: הזמנות ממתינות + אישור/דחייה | CODER | ✅ הושלם | app/admin/bookings/ |
| 17 | Admin: יומן (חודשי + רשימה) | CODER | ✅ הושלם | app/admin/calendar/ |
| 18 | Admin: עמוד settings | CODER | ✅ הושלם | app/admin/settings/ |
| 19 | Google Calendar lib | CODER | ✅ הושלם | lib/google-calendar.ts |
| 20 | עיצוב dark theme – Customer pages | UI | ✅ הושלם | 07/03/26 |
| 21 | עיצוב dark theme – Admin pages | UI | ✅ הושלם | 07/03/26 |
| 22 | Code review – שלב 1 | REVIEW | ✅ הושלם | 07/03/26 – 2 MUST FIX תוקנו |
| 23 | Security check – שלב 1 | SECURITY | ✅ הושלם | 07/03/26 – APPROVED |
| 24 | תיקון ממצאי Review + Security | CODER | ✅ הושלם | 07/03/26 – auth+loading+token |
| 25 | QA – שלב 1 | QA | ✅ הושלם | 07/03/26 – API tests + code analysis. 1 bug תוקן |
| 26 | Deploy שלב 1 לVercel | DEPLOY | ✅ הושלם | 08/03/26 – https://studio-app-psi.vercel.app |
| 27 | E2E Playwright testing + bug fixes | QA+CODER | ✅ הושלם | 08/03/26 – 4 באגים תוקנו, 14/14 עברו |

---

## 🟡 שלב 2 – CRM + WhatsApp (ממתין לשלב 1)

| # | משימה | אייג'נט | סטטוס | הערות |
|---|--------|---------|--------|-------|
| 26 | תיק לקוח CRM – עמוד + לוגיקה | CODER | ✅ הושלם | /admin/clients – חיפוש, סטטוס תשלום, הערות |
| 27 | Make.com Webhooks – lib/whatsapp.ts (חדש) | CODER | ✅ הושלם | `sendGenericWhatsAppMessage(name, phone, action, message)` → Make.com ישיר |
| 28 | כל הודעות WhatsApp אוטומטיות (8 סוגים) | CODER | ✅ הושלם | new_booking, confirmed, rejected, cancelled×2, quick_book, waitlist, event_registered |
| 28a | `/api/admin/whatsapp` – endpoint שליחה כמותית | CODER | ✅ הושלם | Bulk WhatsApp מממשק האדמין |
| 29 | Admin: ממשק WhatsApp (Q&A + תבניות) | CODER | 🚫 בוטל | תלוי בwebook נכנס מMake.com – לא רלוונטי לארכיטקטורה הנוכחית |
| 30 | בוט AI לשאלות נפוצות | CODER | 🚫 בוטל | דורש Make.com Scenario + webhooks נכנסים – עלול לגרום לחוסר סנכרון |
| 31 | Admin: לוח משימות | CODER | ✅ הושלם | /admin/tasks – יצירה, סטטוסים, קישור ללקוח |
| 32 | Review + Security + QA שלב 2 | REVIEW+SEC+QA | ✅ הושלם | 08/03/26 – 3 באגים תוקנו, build עבר |
| 33 | Deploy שלב 2 | DEPLOY | ✅ הושלם | 08/03/26 – commit 638a191, 32 קבצים |

---

## 🟢 PHASE H – שדרוג ממשק לקוח (08/03/26)

| # | משימה | אייג'נט | סטטוס | הערות |
|---|--------|---------|--------|-------|
| H1 | ClientHeader – header אחיד לכל דפי לקוח | UI | ✅ הושלם | components/ClientHeader.tsx |
| H2 | WhatsAppButton – כפתור floating | UI | ✅ הושלם | components/WhatsAppButton.tsx |
| H3 | דף בית – סקשן אירועים קרובים + WhatsApp | UI | ✅ הושלם | app/page.tsx |
| H4 | דף אירועים – תמונות לכרטיסים + ניווט | UI | ✅ הושלם | app/events/page.tsx |
| H5 | דף אירוע בודד – תמונה hero + back button | UI | ✅ הושלם | app/events/[id]/page.tsx |
| H6 | Admin events – שדה image_url בטופס יצירה | UI | ✅ הושלם | app/admin/events/page.tsx |
| H7 | Admin settings – שדה WhatsApp | UI | ✅ הושלם | app/admin/settings/page.tsx |

---

## 🔵 שלב 3 – אירועים + AI (ממתין לשלב 2)

| # | משימה | אייג'נט | סטטוס |
|---|--------|---------|--------|
| 34/35 | שדות דינמיים באירועים (CreateEvent/Register) | CODER | 🔄 חלקי (חסר Edit) |
| 36 | גלריית תיק עבודות YouTube/Image Upload | UI | ✅ הושלם |
| 37 | דאשבורד משודרג – השוואת חודשים + Peak Times | CODER | ✅ הושלם |
| 38 | Review + Security + QA שלב 3 | REVIEW+SEC+QA | 🔄 בתהליך |
| 39 | Deploy שלב 3 | DEPLOY | 🔄 בתהליך |

---

## 🟣 PHASE I – פעולות ופיצ'רים מתקדמים לממשק משתמש (בפיתוח)

| # | משימה | אייג'נט | סטטוס | הערות |
|---|--------|---------|--------|-------|
| I1 | Add to Calendar (לקוח) בדף תודה וכרטיס הזמנה | CODER/UI | ✅ הושלם | יצירת קובץ .ics + Google Cal |
| I2 | Re-book (לקוח) בכרטיס הזמנה קיימת | CODER/UI | ✅ הושלם | מילוי טופס הזמנה מראש |
| I3 | כפתור התראת ביטולים (Waitlist) ב-BookingWizard | CODER/DB | ✅ הושלם | טבלת waitlist + UI |
| I4 | Share Event (לקוח) בעמוד אירוע | UI | ✅ הושלם | רכיב שיתוף חדש לווסטאפ/פייסבוק/קישור |
| I5 | Bulk Actions באדמין (הזמנות/לקוחות) | CODER/UI | ✅ הושלם | אישור/שליחת הודעות לקבוצה |
| I6 | Quick Book / Walk-in מיומן האדמין | CODER/UI | ✅ הושלם | הוספה מהירה של הזמנה (מודאל קופץ) |
| I7 | Block Time / Emergency ביומן האדמין | CODER/UI | ✅ הושלם | טבלת blocked_times + מודאל ליומן |
| I8 | תגים דינמיים (VIP, No-show) ב-CRM לקוחות | CODER/DB | ✅ הושלם | שדה tags מתעדכן + UI לניהול תגיות |

---

## 🐛 באגים ידועים

| # | תיאור | קובץ | חומרה | סטטוס |
|---|--------|------|-------|--------|
| 1 | tailwind class names לא תאמו config | tailwind.config.ts | גבוה | ✅ תוקן 07/03/26 |
| 2 | NEXT_PUBLIC_SITE_URL לא מוגדר בVercel → כל דפי הלקוח שאלו localhost ולא הציגו נתונים | app/page.tsx, app/events/*, app/book/*, app/booking/* | קריטי | ✅ תוקן 08/03/26 – הוחלף בשאילתות Supabase ישירות |
| 3 | revalidatePath לא כלל נתיבי לקוח → שינויים אדמין לא עדכנו ממשק לקוח | admin/events/page.tsx, admin/services/page.tsx | גבוה | ✅ תוקן 08/03/26 |
| 4 | Dashboard stats hardcoded "—" ללא שאילתות DB | admin/dashboard/page.tsx | בינוני | ✅ תוקן 08/03/26 |
| 5 | Event registration לא שלח webhook לMake.com | api/events/[id]/register/route.ts | בינוני | ✅ תוקן 08/03/26 |
| 6 | updateBookingStatus לא revalidate את /booking/[token] → לקוח רואה סטטוס ישן | admin/bookings/page.tsx | גבוה | ✅ תוקן 08/03/26 |
| 7 | saveSettings לא revalidate את /book → שינוי שעות לא עדכן אשף הזמנה | admin/settings/page.tsx | בינוני | ✅ תוקן 08/03/26 |
| 8 | /booking/[token] חסר force-dynamic → עלול להיות cached | app/booking/[token]/page.tsx | בינוני | ✅ תוקן 08/03/26 |

---

## ✅ הושלם

| # | משימה | תאריך | על ידי |
|---|--------|-------|--------|
| 1-19 | כל PHASE A-E (Setup, DB, Auth, APIs, Frontend) | 07/03/26 | CODER |

---

## 📌 אגדה
🔲 פתוח | 🔄 בתהליך | ⏸ ממתין לשלב קודם | ✅ הושלם | 🚫 חסום

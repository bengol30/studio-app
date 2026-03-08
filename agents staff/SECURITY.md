# 🔒 SECURITY.md – זיכרון SECURITY-AGENT
> מנוהל: SECURITY-AGENT
> עדכן אחרי כל בדיקה

---

## כלל עליון
בדיקת אבטחה חובה לפני כל deploy.
DB-AGENT מראה migration → SECURITY מאשר RLS → רק אז מריצים.

---

## צ'קליסט לפני כל Deploy

### Supabase RLS
- [ ] כל טבלה חדשה יש לה `ENABLE ROW LEVEL SECURITY`
- [ ] אין `FOR ALL USING (true)` על טבלאות רגישות (clients, settings, tasks)
- [ ] לקוח לא יכול לראות הזמנות של לקוח אחר (רק לפי token)
- [ ] PATCH /api/bookings/token/[token] – בדוק שלקוח לא יכול לשנות הזמנה של אחר

### Environment Variables
- [ ] `SUPABASE_SERVICE_KEY` לא ב-`NEXT_PUBLIC_*`
- [ ] לא מופיע ב-client-side code
- [ ] `.env.local` ב-`.gitignore`
- [ ] כל vars ב-Vercel dashboard

### API Routes
- [ ] כל `/api/admin/*` בודק Supabase session
- [ ] `/api/webhooks/make` מאמת `x-make-secret` header
- [ ] Rate limiting על POST /api/bookings (מניעת spam)
- [ ] CORS מוגדר נכון

### Tokens
- [ ] token הזמנה הוא UUID v4 (לא sequential)
- [ ] token לא חשוף ב-server logs

### Input
- [ ] מספר טלפון מסונן (רק ספרות + +)
- [ ] text fields מוגבלים באורך
- [ ] file URL מוולידט (URL תקין בלבד)

---

## בדיקות שבוצעו

| תאריך | רכיב | ממצאים | סטטוס |
|--------|------|--------|-------|
| 07/03/26 | שלב 1 מלא | 1 MUST FIX (תוקן), rate limiting חסר (noted) | ✅ APPROVED |

---

## חורים שנמצאו

| # | תיאור | חומרה | תוקן? | תאריך |
|---|--------|-------|-------|-------|
| 1 | Server Actions ב-admin ללא auth check | גבוהה | ✅ תוקן | 07/03/26 |
| 2 | Token validation רופף (length<10) | בינונית | ✅ תוקן | 07/03/26 |
| 3 | Rate limiting חסר על POST /api/bookings | נמוכה | ⏸ שלב 2 | — |

---

## RLS Policies מאושרות

| טבלה | Policy | אושר |
|------|--------|------|
| services | public SELECT (active+not deleted), admin ALL | ✅ |
| packages | public SELECT (active+not deleted), admin ALL | ✅ |
| service_fields | public SELECT, admin ALL | ✅ |
| bookings | public INSERT, token SELECT via API (admin client), admin ALL | ✅ |
| clients | admin only | ✅ |
| events | public SELECT, admin ALL | ✅ |
| event_registrations | public INSERT, admin ALL | ✅ |
| tasks | admin only | ✅ |
| whatsapp_qa | admin only | ✅ |
| whatsapp_templates | admin only | ✅ |
| settings | public SELECT, admin ALL | ✅ |

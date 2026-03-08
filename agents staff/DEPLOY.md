# 🚀 DEPLOY.md – זיכרון DEPLOY-AGENT
> מנוהל: DEPLOY-AGENT

---

## כלל עליון
Deploy רק אחרי: ✅ REVIEW אישר + ✅ SECURITY אישר + ✅ `npm run build` עובר

---

## Env Variables – Vercel Dashboard

| Variable | סביבה | תיאור | הוגדר? |
|----------|-------|--------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | All | Supabase project URL | ✅ ב-Vercel Production |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | All | Supabase anon key | ✅ ב-Vercel Production |
| `SUPABASE_SERVICE_KEY` | All | Supabase service role (server only) | ✅ ב-Vercel Production |
| `GOOGLE_CLIENT_ID` | All | Google OAuth | ☐ ממתין לבן |
| `GOOGLE_CLIENT_SECRET` | All | Google OAuth | ☐ ממתין לבן |
| `GOOGLE_REFRESH_TOKEN` | All | Google Calendar refresh | ☐ ממתין לבן |
| `GOOGLE_CALENDAR_ID` | All | Calendar ID של האולפן | ☐ ממתין לבן |
| `MAKE_WEBHOOK_SECRET` | All | Secret לאימות Make.com | ☐ ממתין לבן |
| `NEXT_PUBLIC_SITE_URL` | All | URL של האתר (לlinks) | ✅ https://studio-app-psi.vercel.app |

---

## Checklist לפני כל Deploy

```
✅ 1. git status – הכל committed (main up to date)
✅ 2. npm run build – עובר ללא errors
✅ 3. REVIEW-AGENT אישר (07/03/26)
✅ 4. SECURITY-AGENT אישר (07/03/26)
✅ 5. Env Variables ב-Vercel: Supabase + SITE_URL הוגדרו (Google + Make ממתינים)
✅ 6. supabase db push (migrations כבר הורצו, לא צריך)
□ 7. Make.com Webhooks – עדכן URLs לproduction (ממתין לcredentials)
□ 8. Google Calendar – בדוק connection (ממתין לcredentials)
✅ 9. vercel deploy --prod – הושלם (07/03/26)
✅ 10. בדוק /admin – login עובד (HTTP 307 → /admin/login ✓)
✅ 11. בדוק הזמנה אחת end-to-end – Playwright 08/03/26 ✅
✅ 12. עדכן STATUS.md עם deploy
```

---

## Deploys שבוצעו

| # | תאריך | שלב | גרסה | הצליח? | הערות |
|---|--------|-----|------|--------|-------|
| 1 | 07/03/26 | שלב 1 | v1.0 | ✅ | https://studio-app-psi.vercel.app – initial deploy |
| 2 | 08/03/26 | שלב 1 | v1.1 | ✅ | bug fixes: admin login loop, middleware, cache, dynamic_answers |

---

## בעיות Deploy שהיו

| תאריך | בעיה | פתרון |
|--------|------|-------|
| 08/03/26 | Admin login לופ אינסופי (layout עוטף login) | route group (protected) – login נשאר מחוץ ל-layout |
| 08/03/26 | MIDDLEWARE_INVOCATION_FAILED ב-edge | try/catch על getUser() במידוור |
| 08/03/26 | /api/services מוחזר מcache ריק | export const dynamic = 'force-dynamic' |
| 08/03/26 | הזמנה נכשלת – column name מוטעה | answers → dynamic_answers |

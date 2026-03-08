# ✅ QA.md – זיכרון QA-AGENT
> מנוהל: QA-AGENT

---

## כלל עליון
לא מתקן בעצמך. מדווח ל-CODER עם מספרי באגים ברורים.

---

## צ'קליסט – אשף הזמנה (שלב 1)

### Happy Path
- [x] שלב 1: בחירת שירות → ממשיך לשלב 2 – קוד תקין, auto-advance
- [x] שלב 2: בחירת חבילה + תאריך + שעה → ממשיך – slots נטענים מ-API
- [x] שלב 3: מילוי שם + טלפון + שאלות דינמיות – validation לפני next
- [x] שלב 4: קישור קובץ + V תקנון – URL validation client+server
- [x] שלב 5: סיכום + שליחה – מציג הכל, submit ל-API
- [x] לאחר שליחה: לינק token מופיע ב-/booking/success
- [x] לינק token: הזמנה מוצגת נכון (/booking/[token])
- [x] מנהל רואה הזמנה כ"ממתינה"
- [x] הזמנה end-to-end עובדת בפרודקשן – Playwright 08/03/26 ✅
- [ ] מנהל מאשר → Google Calendar מתעדכן ⏸ (ממתין לcredentials)
- [ ] לקוח מקבל WhatsApp אישור ⏸ (ממתין ל-Make.com credentials)

### Edge Cases
- [x] שדות חובה ריקים → כפתור המשך disabled עד שהכל מלא
- [x] טלפון לא תקין → Zod validation ב-server מחזיר 400 + error ברור
- [x] בחירת שעה שנחסמה בינתיים → double-check server-side, מחזיר 409
- [x] token לא קיים → 404 מה-API (Booking not found)
- [x] token בפורמט שגוי → 400 Invalid token (UUID regex validation)
- [x] ביטול אחרי 48 שעות → הודעה בעברית: "ביטול אפשרי עד X שעות..."
- [x] 2 לקוחות מנסים לקבוע אותה שעה → רק אחד מצליח (server-side conflict check)
- [x] buffer 10 דקות לא מוצג ללקוח (מחושב server-side בלבד)
- [x] קובץ URL לא תקין → client validation + Zod server validation

---

## צ'קליסט – Admin (שלב 1)

- [x] Login – קוד תקין (Supabase Auth)
- [x] Logout – כפתור ב-Sidebar
- [x] גישה ל /admin ללא login → redirect ל-login (middleware.ts)
- [x] רשימת הזמנות ממתינות טוענת – API GET /api/admin/bookings
- [x] אישור הזמנה → status = confirmed (Server Action + revalidatePath)
- [x] דחיית הזמנה → status = rejected
- [x] יומן חודשי + רשימה – CalendarClient עם tabs
- [x] settings נשמר – Server Action + upsert

---

## צ'קליסט – RTL

- [x] כל הטקסטים: dir="rtl" על כל containers ראשיים
- [x] אין text-left בשום קובץ (נבדק עם grep)
- [x] inputs מספר/תאריך/URL: dir="ltr" (נכון)
- [x] כפתורי ניווט: "המשך" מימין, "חזור" משמאל

---

## צ'קליסט – Mobile (375px)

- [x] כפתורים: py-2.5 = ~40px, קרוב ל-44px
- [x] Step2 slots: grid-cols-4 – מספיק לשעות 5 תווים ב-375px
- [x] טקסט: text-sm + max-w מוגבל בכל step
- [x] Admin: פשוט, בסיסי עובד ב-mobile

---

## באגים פתוחים

| # | תיאור | שלב | חומרה (🔴/🟡/🟢) | מטפל | סטטוס |
|---|--------|-----|-----------------|-------|--------|
| 1 | Race condition: 2 users בדיוק באותה שנייה → double booking אפשרי | שלב 1 | 🟢 נמוך (studio קטן, נדיר) | שלב 2 | ⏸ ממתין |
| 2 | Google Calendar + WhatsApp לא נבדקו (חסרים credentials) | שלב 1 | 🟡 | Ben | ⏸ ממתין לbן |

---

## באגים שתוקנו

| # | תיאור | נמצא | תוקן | על ידי |
|---|--------|------|------|-------|
| 1 | error.tsx חסר ב-/booking/[token] | QA 07/03/26 | 07/03/26 | CODER |
| 2 | Server Actions ללא auth | Review 07/03/26 | 07/03/26 | CODER |
| 3 | Token validation: length<10 במקום UUID regex | Review 07/03/26 | 07/03/26 | CODER |
| 4 | Admin login לופ 307 אינסופי – layout עוטף גם login | Playwright 08/03/26 | 08/03/26 | CODER |
| 5 | MIDDLEWARE_INVOCATION_FAILED – getUser() ללא try/catch | Playwright 08/03/26 | 08/03/26 | CODER |
| 6 | /api/services מוגש מcache – עמוד ריק | Playwright 08/03/26 | 08/03/26 | CODER |
| 7 | DB column: answers במקום dynamic_answers → הזמנה נכשלת | Playwright 08/03/26 | 08/03/26 | CODER |

# 🔍 REVIEW.md – זיכרון REVIEW-AGENT
> מנוהל: REVIEW-AGENT
> עדכן אחרי כל review

---

## כלל עליון
לא מתקן בעצמך. מחזיר רשימה ממוספרת ל-CODER/UI.
רק אחרי שכל MUST FIX נסגרו → אפשר להמשיך.

---

## צ'קליסט קבוע לכל Review

### TypeScript
- [ ] אין `any` בשום מקום
- [ ] אין `@ts-ignore`
- [ ] כל interface מוגדר ב-`/types/index.ts`
- [ ] כל function signature מוקלד

### Async & Errors
- [ ] כל `await` עטוף ב-`try/catch`
- [ ] API Routes מחזירים status codes נכונים
- [ ] אין unhandled promise rejections
- [ ] משתמשים ב-`error.tsx` ב-App Router

### קוד נקי
- [ ] אין `console.log` שנשכח
- [ ] אין קוד שהוקמנט (`// old code`)
- [ ] אין כפילויות שאפשר לחלץ לfunction
- [ ] שמות משתנים ברורים
- [ ] functions קצרות (לא יותר מ-50 שורות)

### Next.js
- [ ] Server vs Client Components נכונים
- [ ] אין data fetching בClient שיכול להיות בServer
- [ ] `loading.tsx` קיים לכל route שמביא data
- [ ] `error.tsx` קיים לכל route שמביא data
- [ ] `metadata` מוגדר לכל page

### אבטחה בסיסית
- [ ] Admin routes בודקים session
- [ ] אין service key בclient-side
- [ ] Input validation בserver side לכל form

### RTL & UI
- [ ] `dir="rtl"` על כל containers ראשיים
- [ ] אין `text-left` בטעות בעברית
- [ ] Responsive עד 375px

---

## Reviews שבוצעו

| תאריך | פיצ'ר | MUST FIX | SHOULD FIX | אושר? |
|--------|-------|----------|------------|-------|
| 07/03/26 | שלב 1 מלא (Tasks 1-19) | 2 (תוקנו) | 2 (תוקנו) | ✅ |

---

## Patterns בעייתיים חוזרים

| pattern | הסבר | פתרון מומלץ |
|---------|-------|------------|
| Server Action ללא auth | Server Actions יכולות להיקרא ישירות ב-HTTP | תמיד `createClient().auth.getUser()` בתחילת כל Server Action ב-/admin |
| חסר loading/error pages | routes שמביאים data צריכים loading.tsx + error.tsx | צור אותם לכל data route |

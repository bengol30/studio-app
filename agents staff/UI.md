# 🎨 UI.md – זיכרון UI-AGENT
> מנוהל: UI-AGENT
> עדכן אחרי כל שינוי עיצובי

---

## כלל עליון
עובד רק על קוד שCODER כבר כתב.
משנה Tailwind classes בלבד – לא לוגיקה, לא Server Actions.

---

## Tailwind Config – צבעים מוגדרים (עדכני!)

```typescript
// tailwind.config.ts – הצבעים כפי שמוגדרים כרגע
theme: {
  extend: {
    colors: {
      primary: '#0F0F1A',        // bg-primary
      card: '#1A1A2E',           // bg-card
      elevated: '#252540',       // bg-elevated
      accent: '#E94560',         // bg-accent / text-accent
      'accent-2': '#0F3460',
      'border-c': '#2A2A3E',
      'primary-text': '#EAEAEA', // text-primary-text
      'secondary-text': '#888899', // text-secondary-text
      muted: '#555566',          // text-muted
      success: '#27AE60',
      error: '#E74C3C',
    }
  }
}
```

---

## Classes שימושיות לפרויקט – עדכני!

```
רקע: bg-primary / bg-card / bg-elevated
כרטיס: bg-card border border-white/10 rounded-xl p-4
כפתור ראשי: bg-accent hover:bg-accent/90 text-white px-6 py-3 rounded-lg font-medium
כפתור שני: border border-white/10 text-primary-text hover:bg-elevated px-6 py-3 rounded-lg
טקסט ראשי: text-primary-text
טקסט משני: text-secondary-text
טקסט מינורי: text-muted
גבול: border border-white/10 (מועדף) / border-border-c
```

> ⚠️ הערה: בפועל border-white/10 מועדף על border-border-c בגלל opacity טוב יותר

---

## RTL – כללים קבועים

```tsx
// ✅ נכון
<div dir="rtl" className="text-right">
<input className="text-right placeholder:text-right" />
// margin/padding: mr-4 / pr-4 (ימין)

// ❌ שגוי
<div className="text-left flex flex-row">
<div className="ml-4">  // בעיה ב-RTL
```

---

## עיצוב כל רכיב עיקרי

### כרטיס שירות (Step1)
```
bg-card border border-white/10 rounded-xl p-6
hover: border-white/30 transition-colors
selected: border-accent bg-accent/10 text-primary-text
```

### כפתור זמן פנוי (Step2)
```
bg-primary border border-white/10 rounded-lg py-2 text-sm font-medium
hover: border-accent
selected: bg-accent text-white
```

### כפתור הזמנה (Hero)
```
bg-accent text-white text-lg font-bold px-8 py-4 rounded-xl
hover:bg-accent/90 transition-all
```

### Input
```
w-full bg-primary border border-white/10 rounded-lg px-4 py-2.5
text-primary-text placeholder:text-muted
focus:outline-none focus:border-accent
```

### Admin Sidebar link active
```
bg-accent/20 text-accent font-medium rounded-lg
```

---

## קומפוננטות שנוצרו ✅

| שם | קובץ | סטטוס |
|----|------|--------|
| BookingWizard | components/booking/BookingWizard.tsx | ✅ קוד |
| Step1Service | components/booking/Step1Service.tsx | ✅ קוד |
| Step2Package | components/booking/Step2Package.tsx | ✅ קוד |
| Step3Details | components/booking/Step3Details.tsx | ✅ קוד |
| Step4Files | components/booking/Step4Files.tsx | ✅ קוד |
| Step5Confirm | components/booking/Step5Confirm.tsx | ✅ קוד |
| AdminSidebar | components/admin/AdminSidebar.tsx | ✅ קוד |
| CalendarClient | app/admin/calendar/CalendarClient.tsx | ✅ קוד |
| LoginForm | app/admin/login/LoginForm.tsx | ✅ קוד |

---

## Mobile Breakpoints

```
sm: 640px  → טאבלט
md: 768px  → לפטופ קטן
lg: 1024px → דסקטופ
```

כל קומפוננט חייב לעבוד ב-375px (iPhone SE).

# 💻 CODER.md – זיכרון CODER-AGENT
> מנוהל: CODER-AGENT
> עדכן אחרי כל קובץ/route חדש

---

## כלל עליון
לפני שמתחיל: קרא MEMORY.md + ARCH.md + DB.md
אחרי שמסיים: עדכן את הטבלאות כאן + עדכן API Routes ב-MEMORY.md

---

## כללי כתיבה – חובה

```
✅ TypeScript strict – אסור any
✅ Server Components כברירת מחדל
✅ 'use client' רק לevent handlers / useState / useEffect
✅ כל async → try/catch עם error handling
✅ כל Server Action → validation בserver side
✅ כל route API → status codes נכונים (200/400/401/404/500)
✅ RTL: dir="rtl" על כל <main> ו-<section> ראשי
✅ אין console.log בקוד production
✅ אין hardcoded strings – כל text ב-Hebrew בcomponent
```

---

## קבצים שנוצרו

| קובץ | תיאור | תאריך |
|------|--------|-------|
| — | טרם נוצרו קבצים | — |

---

## Server Actions שנוצרו

| Action | קובץ | תיאור |
|--------|------|--------|
| — | — | — |

---

## Packages מותקנים

```json
{
  "dependencies": {
    "עדיין לא הותקן": "יתמלא אחרי npm install"
  }
}
```

---

## TODO פתוחים בקוד

> כל TODO בקוד חייב להירשם כאן ובTASKS.md

| # | קובץ | שורה | תיאור | עדיפות |
|---|------|-------|--------|--------|
| — | — | — | — | — |

---

## Patterns שנקבעו (יתמלא תוך כדי)

```typescript
// ── Server Component שמביא data ──────────────
// /app/some-page/page.tsx
import { createClient } from '@/lib/supabase-server'

export default async function Page() {
  const supabase = createClient()
  const { data, error } = await supabase.from('table').select()
  if (error) throw error  // error.tsx יתפוס
  return <Component data={data} />
}

// ── Server Action ─────────────────────────────
// /app/some-page/actions.ts
'use server'
import { createClient } from '@/lib/supabase-server'

export async function doSomething(formData: FormData) {
  // validation
  // DB operation
  // revalidatePath()
}

// ── API Route ────────────────────────────────
// /app/api/route/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    // validation
    // logic
    return NextResponse.json({ data }, { status: 200 })
  } catch (error) {
    return NextResponse.json({ error: 'שגיאה' }, { status: 500 })
  }
}
```

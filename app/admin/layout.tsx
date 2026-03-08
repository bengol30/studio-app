// Pass-through layout – auth check is in app/admin/(protected)/layout.tsx
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

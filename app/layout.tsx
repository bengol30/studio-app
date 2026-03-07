import type { Metadata } from "next";
import { Heebo, Inter } from "next/font/google";
import "./globals.css";

const heebo = Heebo({
  subsets: ["hebrew", "latin"],
  variable: "--font-heebo",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "אולפן קריית שמונה | Bengo Productions",
  description: "מערכת הזמנות לאולפן הקלטות קריית שמונה – הקלטות, מיקס, מאסטרינג ועוד",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="he" dir="rtl" className={`${heebo.variable} ${inter.variable}`}>
      <body className="font-heebo bg-bg-primary text-text-primary antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}

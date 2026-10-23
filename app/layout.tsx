import type { Metadata } from "next";
import "modern-normalize/modern-normalize.css";
import "./globals.css";
import { Montserrat } from "next/font/google";
import QueryProvider from "@/components/providers/QueryProvider";
import AuthProvider from "@/components/providers/AuthProvider";
import { cookies } from "next/headers";

const montserrat = Montserrat({
  subsets: ["latin", "cyrillic"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-montserrat",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Природні мандри",
    template: "%s | Природні мандри",
  },
  description: "Історії подорожей Україною та спільнота мандрівників.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const hasSessionCookie =
    cookieStore.has("sessionId") && cookieStore.has("refreshToken");

  return (
    <html lang="uk" className={montserrat.variable}>
      <body>
<<<<<<< HEAD
        <QueryProvider>{children}</QueryProvider>
=======
        <QueryProvider>
          <AuthProvider hasSessionCookie={hasSessionCookie}>
            {children}
          </AuthProvider>
        </QueryProvider>
>>>>>>> origin/main
      </body>
    </html>
  );
}

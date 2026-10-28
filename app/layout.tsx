import type { Metadata } from "next";
import Script from "next/script";
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

const themeInitializationScript = `try {
  const cookieTheme = document.cookie
    .split(";")
    .map((cookie) => cookie.trim())
    .find((cookie) => cookie.startsWith("theme="))
    ?.slice(6);
  const savedTheme = localStorage.getItem("theme");
  const theme =
    cookieTheme === "dark" || cookieTheme === "light"
      ? cookieTheme
      : savedTheme;

  if (theme === "dark" || theme === "light") {
    document.documentElement.dataset.theme = theme;
    document.cookie = "theme=" + theme + "; Path=/; Max-Age=31536000; SameSite=Lax";
  }
} catch {}
`;

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const hasSessionCookie =
    cookieStore.has("sessionId") && cookieStore.has("refreshToken");
  const initialTheme = cookieStore.get("theme")?.value === "dark" ? "dark" : "light";

  return (
    <html
      lang="uk"
      className={montserrat.variable}
      data-theme={initialTheme}
      suppressHydrationWarning
    >
      <Script
        id="theme-initializer"
        strategy="beforeInteractive"
        dangerouslySetInnerHTML={{ __html: themeInitializationScript }}
      />
      <body>
        <QueryProvider>
          <AuthProvider hasSessionCookie={hasSessionCookie}>
            {children}
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}

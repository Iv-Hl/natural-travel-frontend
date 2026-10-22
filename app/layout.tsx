import type { Metadata } from "next";
import "modern-normalize/modern-normalize.css";
import "./globals.css";
import { Montserrat } from "next/font/google";
import QueryProvider from "@/components/providers/QueryProvider";


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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uk" className={montserrat.variable}>
      <body>
        
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}

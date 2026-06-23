import type { Metadata } from "next";
import { Montserrat, Source_Sans_3 } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import GlobalApiErrorBanner from "@/components/GlobalApiErrorBanner";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const sourceSans = Source_Sans_3({
  variable: "--font-source-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "IPROTEX - Gestion de machines Industrielles",
  description: "IPROTEX - Gestion de machines Industrielles",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html suppressHydrationWarning>
      <body>
        <AuthProvider>
          {children}
          <GlobalApiErrorBanner />
        </AuthProvider>
      </body>
    </html>
  );
}




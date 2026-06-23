import type { Metadata } from "next";
import { Montserrat, Source_Sans_3 } from "next/font/google";
import "../globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { locales } from "@/i18n/config";
import React from "react";
import { isRtlLocale } from "@/i18n/config";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

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

type Props = {
  children: React.ReactNode;
  params: Promise<{
    locale: string;
  }>;
};


export default async function LocaleLayout({
  children,
  params,
}: Props) {
  const { locale } = await params;

  if (!locales.includes(locale as any)) {
    notFound();
  }

  const messages = await getMessages({ locale });
  const isRtl = isRtlLocale(locale);
  return (
    <div dir={isRtl ? "rtl" : "ltr"}>
      <NextIntlClientProvider locale={locale} messages={messages}>
        <AuthProvider>{children}</AuthProvider>
      </NextIntlClientProvider>
    </div>
  );
}
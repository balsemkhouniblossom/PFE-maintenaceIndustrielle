"use client";

import { useRouter } from "next/navigation";

export function setLocale(locale: string) {
  document.cookie = `NEXT_LOCALE=${locale}; path=/; max-age=31536000; SameSite=Lax`;
  window.location.reload();
}

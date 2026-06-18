import { redirect } from "@/i18n/navigation";
import { defaultLocale } from "@/i18n/config";

export default function Root() {
  // Redirect to the default locale's login page
  redirect({
    href: "/auth/login",
    locale: defaultLocale,
  });
}



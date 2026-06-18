# GMAO Frontend — App Architecture Schema (Next.js App Router)

This document describes the folder/file architecture under **`frontend/src/app`**, including layouts, routes, and i18n middleware.

---

## 1) Global Layouts

### 1.1 Root Layout
- **File:** `frontend/src/app/layout.tsx`
- **Applies to:** All routes (global wrapper)
- **Responsibilities (from code):**
  - Sets fonts + global html/body structure
  - Provides `NextIntlClientProvider` (next-intl)
  - Wraps the app in `AuthProvider`
  - Sets `dir`/RTL based on locale (via `isRtlLocale`)
  - Exports `metadata`

### 1.2 Locale Layout
- **File:** `frontend/src/app/[locale]/layout.tsx`
- **Applies to:** `/:locale/*`
- **Responsibilities (from code):**
  - Reads `params.locale`
  - Loads translations dynamically from: `frontend/messages/${locale}.json`
  - Calls `notFound()` if the locale messages cannot be imported
  - Sets:
    - `<html lang={locale}>`
    - `<html dir="rtl" | "ltr">`
  - Wraps children in `NextIntlClientProvider`

---

## 2) Routing Schema (URLs)

> Next.js App Router convention: `folder name` + `page.tsx` => route.

### 2.1 Non-locale entry
- **File:** `frontend/src/app/page.tsx`
- **URL:** `/`
- **Description:** Default/non-locale app entry page (actual app navigation is largely handled under `/:locale/*`).

### 2.2 Locale-prefixed routes
All routes below live under folder **`frontend/src/app/[locale]/`** so the URL pattern is:
- **URL prefix:** `/:locale`
- **Locales supported (from middleware + locale config):** `en, fr, ar, es, de, it`

#### Dashboard entry
- **File:** `frontend/src/app/[locale]/page.tsx`
- **URL:** `/:locale/`
- **Description:** Admin dashboard.
  - Uses `ProtectedRoute requiredRole="admin"`
  - Fetches dashboard data using `apiService.getDashboardData()`
  - Displays statistics (hooks: `useDashboardStatistics`, `useHealthStatus`)

#### Authentication
- **File:** `frontend/src/app/[locale]/auth/login/page.tsx`
- **URL:** `/:locale/auth/login`
- **Description:** Login form.
  - Calls `useAuth().login(email, password)`
  - Redirects based on returned role

- **File:** `frontend/src/app/[locale]/auth/register/page.tsx`
- **URL:** `/:locale/auth/register`
- **Description:** Registration form.
  - Calls `useAuth().register(payload)`
  - Validates password confirmation + minimum password length
  - Redirects to login on success

#### Feature pages
- **File:** `frontend/src/app/[locale]/work-orders/page.tsx`
- **URL:** `/:locale/work-orders`
- **Description:** Work orders UI

- **File:** `frontend/src/app/[locale]/users/page.tsx`
- **URL:** `/:locale/users`
- **Description:** Users UI

- **File:** `frontend/src/app/[locale]/capteurs/page.tsx`
- **URL:** `/:locale/capteurs`
- **Description:** Sensors (“capteurs”) UI

- **File:** `frontend/src/app/[locale]/catalogues/page.tsx`
- **URL:** `/:locale/catalogues`
- **Description:** Catalogues UI

- **File:** `frontend/src/app/[locale]/machine-types/page.tsx`
- **URL:** `/:locale/machine-types`
- **Description:** Machine types UI

- **File:** `frontend/src/app/[locale]/machines/page.tsx`
- **URL:** `/:locale/machines`
- **Description:** Machines UI

- **File:** `frontend/src/app/[locale]/module-types/page.tsx`
- **URL:** `/:locale/module-types`
- **Description:** Module types UI

- **File:** `frontend/src/app/[locale]/operator/page.tsx`
- **URL:** `/:locale/operator`
- **Description:** Operator role UI/landing

- **File:** `frontend/src/app/[locale]/technician/page.tsx`
- **URL:** `/:locale/technician`
- **Description:** Technician role UI/landing

---

## 3) i18n / Middleware Architecture

### 3.1 Middleware
- **File:** `frontend/middleware.ts`
- **Purpose:** next-intl routing enforcement
- **Behavior (from code):**
  - `locales: ['en','fr','ar','es','de','it']`
  - `defaultLocale: 'en'`
  - `localePrefix: 'always'` (URLs always include `/:locale`)
  - `matcher` excludes: `api`, `_next`, and static files (`.*\\..*`)

### 3.2 next-intl Request Config (messages)
- **File:** `frontend/i18n/request.ts`
- **Purpose:** message loading for next-intl
- **Behavior (from code):**
  - Uses `getRequestConfig` with `locale`
  - Imports `frontend/messages/${locale}.json`
  - Returns `messages`

---

## 4) Translation Files

- **Directory:** `frontend/messages/`
- **Files:**
  - `en.json`, `fr.json`, `ar.json`, `es.json`, `de.json`, `it.json`
- **Description:** Translation dictionaries used by next-intl.

---

## 5) Quick Tree View (frontend/src/app)

```text
frontend/src/app/
  layout.tsx                          # RootLayout (global)
  page.tsx                            # Non-locale entry (/)
  [locale]/
    layout.tsx                        # LocaleLayout (/:locale/*)
    page.tsx                          # Dashboard (/:locale/)
    auth/
      login/page.tsx                 # /:locale/auth/login
      register/page.tsx             # /:locale/auth/register
    users/page.tsx                   # /:locale/users
    capteurs/page.tsx                # /:locale/capteurs
    catalogues/page.tsx              # /:locale/catalogues
    machine-types/page.tsx          # /:locale/machine-types
    machines/page.tsx                # /:locale/machines
    module-types/page.tsx           # /:locale/module-types
    operator/page.tsx               # /:locale/operator
    technician/page.tsx             # /:locale/technician
    work-orders/page.tsx            # /:locale/work-orders
```

---

End of schema.


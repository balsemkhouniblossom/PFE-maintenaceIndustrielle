'use client';

import { useEffect, useMemo } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
  allowedRoles?: string[];
}

export default function ProtectedRoute({
  children,
  requiredRole,
  allowedRoles,
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const localePrefix = useMemo(() => {
    // next-intl localePrefix: 'always' => /{locale}/...
    const firstSegment = pathname?.split('/')[1];
    if (firstSegment && firstSegment.length >= 2) return `/${firstSegment}`;
    return '';
  }, [pathname]);

  const redirectLogin = () => {
    router.push(`${localePrefix}/auth/login`.replace('//', '/'));
  };

  const redirectRole = () => {
    if (user?.role === 'operator') {
      router.push(`${localePrefix}/operator`.replace('//', '/'));
    } else if (user?.role === 'technician') {
      router.push(`${localePrefix}/technician`.replace('//', '/'));
    } else {
      redirectLogin();
    }
  };

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        redirectLogin();
        return;
      }

      // Check role-based access
      if (requiredRole && user?.role !== requiredRole) {
        redirectRole();
        return;
      }

      if (allowedRoles && !allowedRoles.includes(user?.role || '')) {
        redirectRole();
        return;
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, isLoading, user?.role, requiredRole, allowedRoles, router, localePrefix]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md rounded-lg border border-slate-200 bg-white p-6 text-center shadow-sm">
          <p className="text-lg font-semibold text-slate-800">Redirecting to login...</p>
          <p className="mt-2 text-sm text-slate-600">
            Your session is not available yet. If this takes too long, refresh the page.
          </p>
        </div>
      </div>
    );
  }

  // Additional role check for rendering
  if (requiredRole && user?.role !== requiredRole) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md rounded-lg border border-amber-200 bg-amber-50 p-6 text-center shadow-sm">
          <p className="text-lg font-semibold text-amber-900">Access restricted</p>
          <p className="mt-2 text-sm text-amber-800">
            You do not have permission to view this page. Redirecting...
          </p>
        </div>
      </div>
    );
  }

  if (allowedRoles && !allowedRoles.includes(user?.role || '')) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md rounded-lg border border-amber-200 bg-amber-50 p-6 text-center shadow-sm">
          <p className="text-lg font-semibold text-amber-900">Access restricted</p>
          <p className="mt-2 text-sm text-amber-800">
            You do not have permission to view this page. Redirecting...
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}


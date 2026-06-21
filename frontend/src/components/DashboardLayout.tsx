'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useDashboardStatistics } from '@/hooks/useDashboardStatistics';
import { useTranslations } from 'next-intl';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { useParams } from 'next/navigation';

import {
  HomeIcon,
  UsersIcon,
  CogIcon,
  ClipboardDocumentListIcon,
  Bars3Icon,
  XMarkIcon,
  CpuChipIcon,
  ExclamationTriangleIcon,
  ChartBarIcon,
  ArrowRightOnRectangleIcon,
  SignalIcon,
  BuildingStorefrontIcon,
  CubeIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';

interface DashboardLayoutProps {
  children: React.ReactNode;
  title: string;
}




function DashboardLayoutBody({ children, title }: DashboardLayoutProps) {

  const pathname = usePathname() || "";
  const params = useParams();
  const locale = params.locale as string;
  const tCommon = useTranslations('common');
  const tUsers = useTranslations('users');
  const tDashboardStatus = useTranslations('dashboard.status');
  const t = useTranslations('sidebar');
  const [sidebarOpen, setSidebarOpen] = useState(false);


  const router = useRouter();
  const { user, logout } = useAuth();
  const { statistics } = useDashboardStatistics();
  const localePrefix = `/${locale}`;

  const withLocale = (href: string) => {
    if (!localePrefix) return href;
    if (href === '/') return localePrefix;
    return `${localePrefix}${href}`;
  };

  const handleLogoClick = () => {
    if (user?.role === 'admin') router.push(withLocale('/'));
    else if (user?.role === 'operator') router.push(withLocale('/operator'));
    else if (user?.role === 'technician') router.push(withLocale('/technician'));
    else router.push(withLocale('/'));
  };

  const role = user?.role ?? 'operator';

  const navigation = (() => {
    if (role === 'admin') {
      return [

        { name: t('navigation.dashboard'), href: '/', icon: HomeIcon, categoryKey: 'categories.overview' },
        { name: t('navigation.users'), href: '/users', icon: UsersIcon, categoryKey: 'categories.users' },
        { name: t('navigation.machines'), href: '/machines', icon: CogIcon, categoryKey: 'categories.equipment' },
        { name: t('navigation.workOrders'), href: '/work-orders', icon: ClipboardDocumentListIcon, categoryKey: 'categories.maintenance' },
        { name: t('navigation.interventionReports'), href: '/intervention-reports', icon: ClipboardDocumentListIcon, categoryKey: 'categories.maintenance' },
        { name: t('navigation.pannes'), href: '/pannes', icon: ExclamationTriangleIcon, categoryKey: 'categories.maintenance' },
        { name: t('navigation.panneSolutions'), href: '/panne-solutions', icon: DocumentTextIcon, categoryKey: 'categories.maintenance' },
        { name: t('navigation.catalogues'), href: '/catalogues', icon: BuildingStorefrontIcon, categoryKey: 'categories.partsInventory' },
        { name: t('navigation.machineTypes'), href: '/machine-types', icon: CubeIcon, categoryKey: 'categories.equipmentTypes' },
        { name: t('navigation.capteurs'), href: '/capteurs', icon: CpuChipIcon, categoryKey: 'categories.iotMonitoring' },
        { name: t('navigation.documents'), href: '/documents', icon: DocumentTextIcon, categoryKey: 'categories.technicalReference' },
        { name: t('navigation.moduleTypes'), href: '/module-types', icon: DocumentTextIcon, categoryKey: 'categories.systemModules' }
      ];
    }

    if (role === 'technician') {
      return [
        { name: t('navigation.dashboard'), href: '/technician', icon: HomeIcon, categoryKey: 'categories.overview' },
        { name: t('navigation.workOrders'), href: '/work-orders', icon: ClipboardDocumentListIcon, categoryKey: 'categories.maintenance' },
        { name: t('navigation.interventionReports'), href: '/intervention-reports', icon: ClipboardDocumentListIcon, categoryKey: 'categories.maintenance' },
        { name: t('navigation.pannes'), href: '/pannes', icon: ExclamationTriangleIcon, categoryKey: 'categories.maintenance' },
        { name: t('navigation.panneSolutions'), href: '/panne-solutions', icon: DocumentTextIcon, categoryKey: 'categories.maintenance' },
        { name: t('navigation.machines'), href: '/machines', icon: CogIcon, categoryKey: 'categories.equipment' },
        { name: t('navigation.capteurs'), href: '/capteurs', icon: CpuChipIcon, categoryKey: 'categories.iotMonitoring' },
        { name: t('navigation.documents'), href: '/documents', icon: DocumentTextIcon, categoryKey: 'categories.technicalReference' },
        { name: t('navigation.catalogues'), href: '/catalogues', icon: BuildingStorefrontIcon, categoryKey: 'categories.partsInventory' },
        { name: t('navigation.machineTypes'), href: '/machine-types', icon: CubeIcon, categoryKey: 'categories.equipmentTypes' }
      ];
    }

    // Operator
    return [
      { name: t('navigation.dashboard'), href: '/operator', icon: HomeIcon, categoryKey: 'categories.overview' },
      { name: t('navigation.workOrders'), href: '/work-orders', icon: ClipboardDocumentListIcon, categoryKey: 'categories.maintenance' },
      { name: t('navigation.interventionReports'), href: '/intervention-reports', icon: ClipboardDocumentListIcon, categoryKey: 'categories.maintenance' },
      { name: t('navigation.pannes'), href: '/pannes', icon: ExclamationTriangleIcon, categoryKey: 'categories.maintenance' },
      { name: t('navigation.panneSolutions'), href: '/panne-solutions', icon: DocumentTextIcon, categoryKey: 'categories.maintenance' },
      { name: t('navigation.machines'), href: '/machines', icon: CogIcon, categoryKey: 'categories.equipment' },
      { name: t('navigation.capteurs'), href: '/capteurs', icon: CpuChipIcon, categoryKey: 'categories.iotMonitoring' },
      { name: t('navigation.documents'), href: '/documents', icon: DocumentTextIcon, categoryKey: 'categories.technicalReference' }
    ];
  })();

  // Get translated navigation items based on role

  return (
    <div className="dashboard-grid relative overflow-hidden" >
      <img
        src="/Iprotex logo.png"
        alt="IPROTEX Logo Background"
        className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6xl h-288 object-contain opacity-20 pointer-events-none z-0"
      />

      {/* Sidebar */}
      <div className={`sidebar-modern ${sidebarOpen ? 'sidebar-open' : ''} relative z-10`}>
        <div className="sidebar-header-modern">
          <div className="flex items-center gap-3">
            <img
              src="/Iprotex%20logo.png"
              alt="IPROTEX Logo"
              className="w-50 h-50 object-contain cursor-pointer hover:opacity-80 transition-opacity"
              onClick={handleLogoClick}
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
        </div>

        {/* System Status */}
        <div className="system-status-modern">
          <div className="status-item-modern">
            <SignalIcon className="w-4 h-4 text-green-500" />
            <span>{t('systemStatus.online')}</span>
          </div>
          <div className="status-item-modern warning">
            <ExclamationTriangleIcon className="w-4 h-4 text-amber-500" />
            <span>{statistics ? `${statistics.pendingMaintenance} ${t('systemStatus.maintenanceDue')}` : t('systemStatus.loading')}</span>
          </div>
          <div className="status-item-modern success">
            <ChartBarIcon className="w-4 h-4 text-green-500" />
            <span>
              {statistics ? (
                statistics.percentageChange >= 0
                  ? t('systemStatus.percentageChange.positive', { value: statistics.percentageChange })
                  : t('systemStatus.percentageChange.negative', { value: statistics.percentageChange })
              ) : (
                t('systemStatus.loading')
              )}
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="nav-modern">
          {Array.isArray(navigation) && navigation.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.href} className="mb-2">
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 px-4">
                  {t(item.categoryKey)}
                </div>
                <Link
                  href={withLocale(item.href)}
                  className={`nav-link-modern ${pathname === withLocale(item.href) ? 'active' : ''}`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon className="w-5 h-5" />
                  {item.name}
                </Link>
              </div>
            );
          })}
        </nav>

        {/* User Info and Logout - Mobile Only */}
        <div className="mt-auto pt-4 border-t border-slate-200 md:hidden">
          <div className="px-4 py-2">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-full overflow-hidden bg-blue-600 flex items-center justify-center">
                {user?.photo ? (
                  <img
                    src={`http://localhost:3001${user.photo}`}
                    alt={user.nom_complet || 'User'}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).style.display = 'none';
                    }}
                  />
                ) : null}
                <span
                  className={`text-white text-sm font-medium ${user?.photo ? 'hidden' : ''}`}
                >
                  {user?.nom_complet?.split(' ').map((n) => n[0]).join('').toUpperCase() || 'U'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-slate-800 truncate">{user?.nom_complet || 'User'}</div>
                <div className="text-xs text-slate-500 capitalize">{user?.role ? tUsers(`roles.${user.role}`)
                  : 'User'}</div>
              </div>
            </div>

            <button
              onClick={logout}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <ArrowRightOnRectangleIcon className="w-5 h-5" />
              {tCommon('auth.logout')}
            </button>
          </div>
        </div>


      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="main-content relative z-10">
        <header className="panel">
          <div className="flex items-center justify-between gap-4 flex-wrap md:flex-nowrap">
            <div className="flex items-center gap-3 min-w-0">
              <h1 className="text-lg md:text-xl lg:text-2xl font-bold truncate">{title}</h1>
            </div>

            <div className="flex items-center gap-4">
              <LanguageSwitcher />

              <div className="hidden md:flex items-center gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full overflow-hidden bg-blue-600 flex items-center justify-center">
                    {user?.photo ? (
                      <img
                        src={`http://localhost:3001${user.photo}`}
                        alt={user.nom_complet || 'User'}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    ) : null}
                    <span
                      className={`text-white text-sm font-medium ${user?.photo ? 'hidden' : ''}`}
                    >
                      {user?.nom_complet?.split(' ').map((n) => n[0]).join('').toUpperCase() || 'U'}
                    </span>
                  </div>
                  <div className="text-end">
                    <div className="text-sm font-medium text-slate-800">{user?.nom_complet || tCommon('user.defaultName')}</div>
                    <div className="text-xs text-slate-500 capitalize">{user?.role ? tUsers(`roles.${user.role}`)
                      : 'User'}</div>
                  </div>
                </div>

                <button
                  onClick={logout}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <ArrowRightOnRectangleIcon className="w-5 h-5" />
                  <span className="hidden lg:inline">{tCommon('auth.logout')}</span>
                </button>
              </div>

              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="mobile-menu-btn md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                {sidebarOpen ? <XMarkIcon className="w-6 h-6" /> : <Bars3Icon className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </header>

        <main className="p-4 md:p-6 lg:p-8">{children}</main>
      </div>
    </div>

  );
}

export default function DashboardLayout(props: DashboardLayoutProps) {
  return <DashboardLayoutBody {...props} />;
}


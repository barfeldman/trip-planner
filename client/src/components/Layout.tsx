import { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useI18n } from '@/lib/i18n';
import {
  LayoutDashboard, CalendarDays, Hotel, MapPin, Wallet,
  Plane, CheckSquare, FileText, Map, StickyNote, Sun, Moon,
  Menu, X, ChevronRight, Languages, Plus, ChevronDown, LogOut
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/lib/auth';

const navItems = [
  { to: '/', icon: LayoutDashboard, labelKey: 'nav.dashboard' as const },
  { to: '/itinerary', icon: CalendarDays, labelKey: 'nav.itinerary' as const },
  { to: '/accommodations', icon: Hotel, labelKey: 'nav.stays' as const },
  { to: '/activities', icon: MapPin, labelKey: 'nav.activities' as const },
  { to: '/budget', icon: Wallet, labelKey: 'nav.budget' as const },
  { to: '/transport', icon: Plane, labelKey: 'nav.transport' as const },
  { to: '/packing', icon: CheckSquare, labelKey: 'nav.packing' as const },
  { to: '/documents', icon: FileText, labelKey: 'nav.documents' as const },
  { to: '/map', icon: Map, labelKey: 'nav.map' as const },
  { to: '/notes', icon: StickyNote, labelKey: 'nav.notes' as const },
];

interface LayoutProps {
  children: React.ReactNode;
  tripId: string;
  trips?: any[];
  onSelectTrip?: (id: string) => void;
  onCreateTrip?: () => void;
}

export function Layout({ children, tripId, trips, onSelectTrip, onCreateTrip }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [tripMenuOpen, setTripMenuOpen] = useState(false);
  const { t, locale, setLocale } = useI18n();
  const { user, logout } = useAuth();
  const [dark, setDark] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark';
    }
    return false;
  });
  const location = useLocation();

  const { data: trip } = useQuery({
    queryKey: ['trip', tripId],
    queryFn: () => api.getTrip(tripId),
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('theme', dark ? 'dark' : 'light');
  }, [dark]);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 z-50 h-full glass-card transition-all duration-300 flex flex-col',
          'start-0',
          sidebarOpen ? 'w-60' : 'w-[4.5rem]',
          mobileOpen
            ? 'translate-x-0 rtl:-translate-x-0'
            : 'ltr:-translate-x-full rtl:translate-x-full md:translate-x-0 md:rtl:-translate-x-0'
        )}
      >
        {/* Gradient accent bar */}
        <div className="gradient-bar h-1 w-full rounded-b-full" />

        {/* Header */}
        <div className="p-4 pb-3">
          <button
            onClick={() => sidebarOpen && setTripMenuOpen(!tripMenuOpen)}
            className={cn(
              'flex items-center gap-3 w-full rounded-xl transition-colors',
              sidebarOpen && 'hover:bg-[hsl(var(--accent))] p-1 -m-1 cursor-pointer'
            )}
          >
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-saffron-400 to-saffron-600 flex items-center justify-center flex-shrink-0 shadow-lg">
              <span className="text-xl">✈️</span>
            </div>
            {sidebarOpen && (
              <div className="min-w-0 flex-1 text-start animate-fade-up">
                <h1 className="font-bold text-sm truncate text-[hsl(var(--foreground))]">
                  {trip?.name || t('app.tripPlanner')}
                </h1>
                <p className="text-[11px] text-[hsl(var(--muted-foreground))] truncate">
                  {t('app.tripPlanner')}
                </p>
              </div>
            )}
            {sidebarOpen && trips && trips.length > 0 && (
              <ChevronDown className={cn(
                'h-3.5 w-3.5 text-[hsl(var(--muted-foreground))] transition-transform',
                tripMenuOpen && 'rotate-180'
              )} />
            )}
          </button>

          {/* Trip switcher dropdown */}
          {tripMenuOpen && sidebarOpen && (
            <div className="mt-2 p-1 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-lg animate-fade-up">
              {trips?.map((tr: any) => (
                <button
                  key={tr.id}
                  onClick={() => {
                    onSelectTrip?.(tr.id);
                    setTripMenuOpen(false);
                  }}
                  className={cn(
                    'w-full text-start px-3 py-2 rounded-lg text-sm transition-colors cursor-pointer',
                    tr.id === tripId
                      ? 'bg-saffron-500/10 text-saffron-700 dark:text-saffron-400 font-medium'
                      : 'hover:bg-[hsl(var(--accent))] text-[hsl(var(--foreground))]'
                  )}
                >
                  {tr.name}
                </button>
              ))}
              <div className="border-t border-[hsl(var(--border))] mt-1 pt-1">
                <button
                  onClick={() => {
                    onCreateTrip?.();
                    setTripMenuOpen(false);
                  }}
                  className="w-full text-start px-3 py-2 rounded-lg text-sm hover:bg-[hsl(var(--accent))] transition-colors flex items-center gap-2 text-ocean-600 dark:text-ocean-400 cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" />
                  {t('trip.createTrip')}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="mx-4 border-t border-[hsl(var(--border))] opacity-50" />

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                cn(
                  'group flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200',
                  isActive
                    ? 'bg-saffron-500/10 text-saffron-700 dark:text-saffron-400 warm-shadow'
                    : 'text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--foreground))]',
                  !sidebarOpen && 'justify-center px-0'
                )
              }
            >
              <item.icon className={cn(
                'h-[18px] w-[18px] flex-shrink-0 transition-transform duration-200',
                'group-hover:scale-110'
              )} />
              {sidebarOpen && <span className="truncate">{t(item.labelKey)}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-3 space-y-3">
          <div className="mx-1 border-t border-[hsl(var(--border))] opacity-50 mb-3" />

          {sidebarOpen ? (
            <div className="space-y-2.5 animate-fade-up">
              {/* Language toggle */}
              <button
                onClick={() => setLocale(locale === 'he' ? 'en' : 'he')}
                className="flex items-center gap-2 w-full px-3 py-2 rounded-xl hover:bg-[hsl(var(--accent))] transition-colors text-xs text-[hsl(var(--muted-foreground))] cursor-pointer"
              >
                <Languages className="h-3.5 w-3.5" />
                <span>{locale === 'he' ? 'English' : 'עברית'}</span>
              </button>

              {/* Dark mode toggle */}
              <div className="flex items-center justify-between px-3">
                <div className="flex items-center gap-2">
                  <Sun className="h-3.5 w-3.5 text-saffron-500" />
                  <Switch checked={dark} onCheckedChange={setDark} />
                  <Moon className="h-3.5 w-3.5 text-ocean-500" />
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <button
                onClick={() => setLocale(locale === 'he' ? 'en' : 'he')}
                className="flex items-center justify-center w-full p-2 rounded-xl hover:bg-[hsl(var(--accent))] transition-colors cursor-pointer"
                title={locale === 'he' ? 'English' : 'עברית'}
              >
                <Languages className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
              </button>
              <button
                onClick={() => setDark(!dark)}
                className="flex items-center justify-center w-full p-2 rounded-xl hover:bg-[hsl(var(--accent))] transition-colors cursor-pointer"
              >
                {dark ? (
                  <Sun className="h-4 w-4 text-saffron-500" />
                ) : (
                  <Moon className="h-4 w-4 text-ocean-500" />
                )}
              </button>
            </div>
          )}

          {/* User + logout */}
          {sidebarOpen ? (
            <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-[hsl(var(--accent))]/50">
              <span className="text-xs font-medium text-[hsl(var(--foreground))]">
                {t('login.greeting')}, {user}
              </span>
              <button
                onClick={logout}
                title={t('login.logout')}
                className="text-[hsl(var(--muted-foreground))] hover:text-red-500 transition-colors cursor-pointer"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={logout}
              title={t('login.logout')}
              className="flex items-center justify-center w-full p-2 rounded-xl hover:bg-[hsl(var(--accent))] transition-colors text-[hsl(var(--muted-foreground))] hover:text-red-500 cursor-pointer"
            >
              <LogOut className="h-4 w-4" />
            </button>
          )}

          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="hidden md:flex items-center justify-center w-full p-2 rounded-xl hover:bg-[hsl(var(--accent))] transition-colors cursor-pointer"
          >
            <ChevronRight className={cn(
              'h-4 w-4 transition-transform duration-300',
              sidebarOpen && 'rtl:rotate-0 ltr:rotate-180',
              !sidebarOpen && 'rtl:rotate-180 ltr:rotate-0'
            )} />
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className={cn(
        'flex-1 transition-all duration-300',
        sidebarOpen ? 'md:ms-60' : 'md:ms-[4.5rem]'
      )}>
        {/* Mobile header */}
        <div className="sticky top-0 z-30 md:hidden flex items-center gap-3 p-4 glass-card border-b border-[hsl(var(--border))]">
          <button onClick={() => setMobileOpen(true)} className="cursor-pointer">
            <Menu className="h-5 w-5" />
          </button>
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-saffron-400 to-saffron-600 flex items-center justify-center">
            <span className="text-base">✈️</span>
          </div>
          <span className="font-semibold text-sm text-saffron-700 dark:text-saffron-400 truncate">
            {trip?.name || t('app.tripPlanner')}
          </span>
        </div>

        <div className="p-4 md:p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}

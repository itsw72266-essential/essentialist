'use client';

import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useRouter, usePathname } from 'next/navigation';
import {
  Menu as MenuIcon,
  X as CloseIcon,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';
import UserMenu from '../../components/UserMenu';
import isAdmin from '../../utils/isAdmin';
import {
  DASHBOARD_ADMIN_PATHS,
  DASHBOARD_USER_PATHS,
} from '@/config/navigationPrefetch';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';

const STORAGE_KEY = 'essentialist_dash_sidebar';
const SIDEBAR_W_OPEN = 280;
const SIDEBAR_W_CLOSED = 52;

const DashboardLayout = ({ children }) => {
  const router = useRouter();
  const pathname = usePathname();
  const user = useSelector((state) => state.user);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    try {
      const s = localStorage.getItem(STORAGE_KEY);
      if (s === '0') setSidebarOpen(false);
    } catch {
      /* noop */
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, sidebarOpen ? '1' : '0');
    } catch {
      /* noop */
    }
  }, [sidebarOpen]);

  useEffect(() => {
    if (!user?._id) return undefined;
    if (!pathname.startsWith('/dashboard')) return undefined;
    const paths = isAdmin(user?.role)
      ? DASHBOARD_ADMIN_PATHS
      : DASHBOARD_USER_PATHS;
    const run = () => {
      paths.forEach((href) => {
        try {
          router.prefetch(href);
        } catch {
          /* noop */
        }
      });
    };
    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      const id = window.requestIdleCallback(run);
      return () => window.cancelIdleCallback(id);
    }
    const t = setTimeout(run, 200);
    return () => clearTimeout(t);
  }, [pathname, router, user?._id, user?.role]);

  const sidebarPx = sidebarOpen ? SIDEBAR_W_OPEN : SIDEBAR_W_CLOSED;

  return (
    <section className="min-h-screen bg-slate-50/90">
      <div className="lg:hidden flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-white sticky top-0 z-20">
        <div className="font-semibold text-lg text-slate-800">Dashboard</div>
        <button
          type="button"
          className="p-2 rounded-md border border-slate-200 bg-white"
          onClick={() => setMobileMenuOpen(true)}
          aria-label="Open dashboard menu"
        >
          <MenuIcon className="h-6 w-6" />
        </button>
      </div>

      <button
        type="button"
        className={`fixed inset-0 z-40 bg-black/40 transition-opacity ${
          mobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        } lg:hidden`}
        onClick={() => setMobileMenuOpen(false)}
        aria-label="Close dashboard menu overlay"
      />

      <aside
        className={`fixed top-0 left-0 z-50 h-full w-64 bg-white border-r border-slate-200 shadow-lg transition-transform transform lg:hidden ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ transition: 'transform 0.2s ease-in-out' }}
        aria-label="Dashboard navigation"
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
          <div className="font-semibold text-lg text-slate-800">
            {user?.name ? `${user.name}'s Menu` : 'Menu'}
          </div>
          <button
            type="button"
            className="p-2 rounded-md border border-slate-200"
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Close dashboard menu"
          >
            <CloseIcon className="h-6 w-6" />
          </button>
        </div>
        <div className="p-4 h-[calc(100%-56px)] overflow-y-auto overflow-x-hidden scrollbar-none">
          <UserMenu onSelect={() => setMobileMenuOpen(false)} />
        </div>
      </aside>

      <aside
        className="hidden lg:flex fixed left-0 top-0 z-30 h-svh flex-col border-r border-slate-200 bg-white shadow-sm transition-[width] duration-200 overflow-hidden"
        style={{ width: sidebarPx }}
        aria-label="Dashboard sidebar"
      >
        <Collapsible
          open={sidebarOpen}
          onOpenChange={setSidebarOpen}
          className="flex flex-col flex-1 min-h-0"
        >
          <div
            className={cn(
              'flex shrink-0 items-center gap-2 border-b border-slate-100 bg-slate-50/90 px-2 py-2',
              sidebarOpen ? 'justify-between' : 'justify-center',
            )}
          >
            {sidebarOpen ? (
              <span className="truncate text-xs font-bold uppercase tracking-wide text-slate-500">
                Menu
              </span>
            ) : null}
            <CollapsibleTrigger asChild>
              <button
                type="button"
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-700 hover:bg-pink-50 hover:text-pink-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-400 focus-visible:ring-offset-2"
                aria-expanded={sidebarOpen}
                aria-label={
                  sidebarOpen ? 'Collapse navigation' : 'Expand navigation'
                }
              >
                {sidebarOpen ? (
                  <PanelLeftClose className="h-4 w-4" aria-hidden />
                ) : (
                  <PanelLeftOpen className="h-4 w-4" aria-hidden />
                )}
              </button>
            </CollapsibleTrigger>
          </div>
          <CollapsibleContent className="flex flex-1 min-h-0 flex-col">
            <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden scrollbar-none p-3">
              <UserMenu />
            </div>
          </CollapsibleContent>
        </Collapsible>
      </aside>

      <div
        className={cn(
          'min-h-screen w-full overflow-x-hidden overflow-y-auto',
          sidebarOpen ? 'lg:pl-[280px]' : 'lg:pl-[52px]',
        )}
      >
        <div className="mx-auto w-full max-w-[1600px] px-4 py-6 pb-16">
          {children}
        </div>
      </div>
    </section>
  );
};

export default DashboardLayout;

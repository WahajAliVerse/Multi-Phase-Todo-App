'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  HomeIcon,
  CalendarIcon,
  TagIcon,
  UserIcon,
  Cog6ToothIcon,
  MoonIcon,
  SunIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import ThemeToggle from '@/components/common/ThemeToggle';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { logoutUser } from '@/redux/slices/authSlice';
import { useRouter } from 'next/navigation';

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
}

const navItems: NavItem[] = [
  { name: 'Dashboard', href: '/', icon: HomeIcon },
  { name: 'Tasks', href: '/tasks', icon: CalendarIcon },
  { name: 'Tags', href: '/tags', icon: TagIcon },
  { name: 'Profile', href: '/profile', icon: UserIcon },
];

const Sidebar: React.FC<{ collapsed?: boolean; onCollapseToggle?: () => void }> = ({
  collapsed = false,
  onCollapseToggle
}) => {
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { user } = useAppSelector(state => state.auth);
  const [isCollapsed, setIsCollapsed] = useState(collapsed);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  const toggleCollapse = () => {
    const newCollapsed = !isCollapsed;
    setIsCollapsed(newCollapsed);
    if (onCollapseToggle) {
      onCollapseToggle();
    }
  };

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // On mobile, show collapsible menu
  if (isMobile) {
    return (
      <>
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="fixed top-4 left-4 z-40 p-2 rounded-md bg-card text-foreground shadow-lg md:hidden"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 z-50 w-64 bg-card text-card-foreground border-r border-border flex flex-col h-full shadow-xl"
            >
              {/* Logo/Brand Section */}
              <div className="p-4 border-b border-border flex items-center justify-between">
                <Link href="/" className="flex items-center space-x-2">
                  <div className="bg-gradient-to-r from-primary to-indigo-600 w-8 h-8 rounded-lg flex items-center justify-center">
                    <CalendarIcon className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <span className="text-xl font-bold bg-gradient-to-r from-primary to-indigo-600 bg-clip-text text-transparent">
                    TodoApp
                  </span>
                </Link>

                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              {/* Navigation Items */}
              <nav className="flex-1 overflow-y-auto py-4">
                <ul className="space-y-1 px-2">
                  {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                      <li key={item.name}>
                        <Link 
                          href={item.href} 
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <motion.div
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className={`group flex items-center rounded-lg px-3 py-2.5 transition-all duration-200 ${
                              isActive
                                ? 'bg-primary text-primary-foreground shadow-md'
                                : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                            }`}
                          >
                            <item.icon
                              className={`h-5 w-5 flex-shrink-0 ${
                                isActive ? 'text-primary-foreground' : 'text-muted-foreground group-hover:text-foreground'
                              }`}
                            />
                            <span className={`ml-3 ${isActive ? 'font-medium' : 'font-normal'}`}>
                              {item.name}
                            </span>
                          </motion.div>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </nav>

              {/* User Profile and Settings */}
              <div className="p-4 border-t border-border">
                <div className="space-y-4">
                  {/* Theme Toggle */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <ThemeToggle />
                      <span className="text-sm text-muted-foreground ml-2">Theme</span>
                    </div>
                  </div>

                  {/* User Info */}
                  {user && (
                    <div className="flex items-center">
                      <div className="bg-gradient-to-r from-primary to-indigo-600 w-8 h-8 rounded-full flex items-center justify-center text-xs text-primary-foreground font-bold">
                        {user.name?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase()}
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-foreground truncate max-w-[100px]">
                          {user.name || user.email}
                        </p>
                        <p className="text-xs text-muted-foreground">Member</p>
                      </div>
                    </div>
                  )}

                  {/* Logout Button */}
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center rounded-md px-3 py-2 text-sm font-medium transition-colors text-muted-foreground hover:bg-destructive hover:text-destructive-foreground"
                  >
                    <div className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      <span className="ml-3">Sign out</span>
                    </div>
                  </button>
                </div>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Overlay for mobile menu */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
          />
        )}
      </>
    );
  }

  // Desktop sidebar
  return (
    <motion.aside
      className={`hidden md:flex h-screen sticky top-0 bg-card text-card-foreground flex-col border-r border-border transition-all duration-300 ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
      initial={false}
      animate={{ width: isCollapsed ? 80 : 256 }}
    >
      {/* Logo/Brand Section */}
      <div className={`p-4 border-b border-border flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
        {!isCollapsed ? (
          <Link href="/" className="flex items-center space-x-2">
            <div className="bg-gradient-to-r from-primary to-indigo-600 w-8 h-8 rounded-lg flex items-center justify-center">
              <CalendarIcon className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-indigo-600 bg-clip-text text-transparent">
              TodoApp
            </span>
          </Link>
        ) : (
          <div className="bg-gradient-to-r from-primary to-indigo-600 w-8 h-8 rounded-lg flex items-center justify-center">
            <CalendarIcon className="h-5 w-5 text-primary-foreground" />
          </div>
        )}

        <button
          onClick={toggleCollapse}
          className="p-1.5 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
        >
          {isCollapsed ? (
            <ChevronRightIcon className="h-5 w-5" />
          ) : (
            <ChevronLeftIcon className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.name}>
                <Link href={item.href}>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`group flex items-center rounded-lg px-3 py-2.5 transition-all duration-200 ${
                      isActive
                        ? 'bg-primary text-primary-foreground shadow-md'
                        : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                    }`}
                  >
                    <item.icon
                      className={`h-5 w-5 flex-shrink-0 ${
                        isActive ? 'text-primary-foreground' : 'text-muted-foreground group-hover:text-foreground'
                      }`}
                    />
                    {!isCollapsed && (
                      <span className={`ml-3 ${isActive ? 'font-medium' : 'font-normal'}`}>
                        {item.name}
                      </span>
                    )}
                  </motion.div>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Profile and Settings */}
      <div className="p-4 border-t border-border">
        <div className="space-y-4">
          {/* Theme Toggle */}
          <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
            <ThemeToggle />
            {!isCollapsed && <span className="text-sm text-muted-foreground ml-2">Theme</span>}
          </div>

          {/* User Info */}
          {user && (
            <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
              <div className="flex items-center">
                <div className="bg-gradient-to-r from-primary to-indigo-600 w-8 h-8 rounded-full flex items-center justify-center text-xs text-primary-foreground font-bold">
                  {user.name?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase()}
                </div>
                {!isCollapsed && (
                  <div className="ml-3">
                    <p className="text-sm font-medium text-foreground truncate max-w-[100px]">
                      {user.name || user.email}
                    </p>
                    <p className="text-xs text-muted-foreground">Member</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className={`w-full flex items-center justify-center rounded-md px-3 py-2 text-sm font-medium transition-colors ${
              isCollapsed
                ? 'hover:bg-destructive hover:text-destructive-foreground'
                : 'text-muted-foreground hover:bg-destructive hover:text-destructive-foreground'
            }`}
          >
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              {!isCollapsed && <span className="ml-3">Sign out</span>}
            </div>
          </button>
        </div>
      </div>
    </motion.aside>
  );
};

export default Sidebar;
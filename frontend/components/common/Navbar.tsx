'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import ThemeToggle from '@/components/common/ThemeToggle';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { logoutUser } from '@/redux/slices/authSlice';
import { useRouter } from 'next/navigation';
import { usePathname } from 'next/navigation';

const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { user } = useAppSelector(state => state.auth);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const navLinks = [
    { name: 'Dashboard', href: '/' },
    { name: 'Tasks', href: '/tasks' },
    { name: 'Tags', href: '/tags' },
    { name: 'Profile', href: '/profile' },
  ];

  return (
    <nav className={`sticky top-0 z-50 transition-all duration-300 ${
      scrolled
        ? 'bg-background/95 backdrop-blur-md border-b border-border shadow-md'
        : 'bg-background/90 backdrop-blur-md border-b border-border'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="text-xl font-bold text-primary dark:text-primary-foreground">
                TodoApp
              </Link>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    className="text-foreground hover:bg-accent px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 relative"
                  >
                    {link.name}
                    {pathname === link.href && (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"></span>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <ThemeToggle />

            {user ? (
              <div className="flex items-center space-x-4">
                <span className="text-foreground hidden md:inline">
                  Welcome, {user.name || user.email}
                </span>
                <button
                  onClick={handleLogout}
                  className="bg-secondary text-secondary-foreground px-4 py-2 rounded-md text-sm font-medium hover:bg-accent transition-colors duration-200"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <Link href="/login">
                <button className="bg-secondary text-secondary-foreground px-4 py-2 rounded-md text-sm font-medium hover:bg-accent transition-colors duration-200">
                  Sign In
                </button>
              </Link>
            )}
          </div>

          <div className="md:hidden flex items-center space-x-2">
            <ThemeToggle />

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md text-foreground hover:bg-accent focus:outline-none focus:ring-2 focus:ring-primary"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {mobileMenuOpen ? (
                <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-foreground hover:bg-accent block px-3 py-2 rounded-md text-base font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.name}
              </Link>
            ))}
            <div className="pt-4 pb-3 border-t border-border">
              {user ? (
                <>
                  <p className="text-base font-medium text-foreground px-3">
                    {user.name || user.email}
                  </p>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left bg-secondary text-secondary-foreground px-3 py-2 rounded-md text-base font-medium mt-2 hover:bg-accent transition-colors duration-200"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <Link href="/login">
                  <button className="w-full text-left bg-secondary text-secondary-foreground px-3 py-2 rounded-md text-base font-medium hover:bg-accent transition-colors duration-200">
                    Sign In
                  </button>
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import ThemeToggle from '../ThemeToggle/ThemeToggle';
import { Button } from '@/components/ui/Button';

const Navigation = () => {
  const pathname = usePathname();
  const { logout, isAuthenticated } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
  };

  const navLinks = [
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'Tasks', href: '/tasks' },
    { name: 'Tags', href: '/tags' },
  ];

  return (
    <nav className="bg-background border-b border-border py-4 px-6">
      <div className="flex justify-between items-center">
        {/* Logo */}
        <Link href="/" className="text-xl font-bold text-primary">
          Todo App
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-6">
          {isAuthenticated ? (
            <>
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`font-medium transition-colors ${
                    pathname === link.href
                      ? 'text-primary'
                      : 'text-foreground/70 hover:text-foreground'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
              <Button
                onClick={handleLogout}
                variant="ghost"
                className="text-foreground/70 hover:text-destructive"
              >
                Logout
              </Button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className={`font-medium transition-colors ${
                  pathname === '/login'
                    ? 'text-primary'
                    : 'text-foreground/70 hover:text-foreground'
                }`}
              >
                Login
              </Link>
              <Link
                href="/register"
                className={`font-medium transition-colors ${
                  pathname === '/register'
                    ? 'text-primary'
                    : 'text-foreground/70 hover:text-foreground'
                }`}
              >
                Register
              </Link>
            </>
          )}
          <ThemeToggle />
        </div>

        {/* Mobile menu button */}
        <div className="md:hidden flex items-center">
          <ThemeToggle />
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="ml-4 text-foreground/70 focus:outline-none focus:ring-1 focus:ring-ring rounded-md p-1"
            aria-expanded={menuOpen}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          >
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {menuOpen && (
        <div className="md:hidden mt-4 py-4 border-t border-border">
          <div className="flex flex-col space-y-4">
            {isAuthenticated ? (
              <>
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`font-medium transition-colors ${
                      pathname === link.href
                        ? 'text-primary'
                        : 'text-foreground/70 hover:text-foreground'
                    }`}
                    onClick={() => setMenuOpen(false)}
                  >
                    {link.name}
                  </Link>
                ))}
                <Button
                  onClick={() => {
                    handleLogout();
                    setMenuOpen(false);
                  }}
                  variant="ghost"
                  className="justify-start text-foreground/70 hover:text-destructive"
                >
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className={`font-medium transition-colors ${
                    pathname === '/login'
                      ? 'text-primary'
                      : 'text-foreground/70 hover:text-foreground'
                  }`}
                  onClick={() => setMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className={`font-medium transition-colors ${
                    pathname === '/register'
                      ? 'text-primary'
                      : 'text-foreground/70 hover:text-foreground'
                  }`}
                  onClick={() => setMenuOpen(false)}
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation;
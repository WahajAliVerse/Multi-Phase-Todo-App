'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { useAppSelector, useAppDispatch } from '@/hooks/redux';
import { logout } from '@/store/slices/authSlice';
import { authService } from '@/services/auth';
import ThemeToggle from '../ThemeToggle/ThemeToggle';

const Navigation = () => {
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAppSelector(state => state.auth);
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    authService.logout();
    dispatch(logout());
  };

  const navLinks = [
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'Tasks', href: '/tasks' },
    { name: 'Tags', href: '/tags' },
  ];

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-md py-4 px-6">
      <div className="flex justify-between items-center">
        {/* Logo */}
        <Link href="/" className="text-xl font-bold text-blue-600 dark:text-blue-400">
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
                  className={`font-medium ${
                    pathname === link.href
                      ? 'text-blue-600 dark:text-blue-400'
                      : 'text-gray-600 hover:text-blue-500 dark:text-gray-300 dark:hover:text-blue-400'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
              <button
                onClick={handleLogout}
                className="text-gray-600 hover:text-red-500 dark:text-gray-300 dark:hover:text-red-400 font-medium"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className={`font-medium ${
                  pathname === '/login'
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-gray-600 hover:text-blue-500 dark:text-gray-300 dark:hover:text-blue-400'
                }`}
              >
                Login
              </Link>
              <Link
                href="/register"
                className={`font-medium ${
                  pathname === '/register'
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-gray-600 hover:text-blue-500 dark:text-gray-300 dark:hover:text-blue-400'
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
            className="ml-4 text-gray-600 dark:text-gray-300 focus:outline-none"
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
        <div className="md:hidden mt-4 py-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex flex-col space-y-4">
            {isAuthenticated ? (
              <>
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`font-medium ${
                      pathname === link.href
                        ? 'text-blue-600 dark:text-blue-400'
                        : 'text-gray-600 hover:text-blue-500 dark:text-gray-300 dark:hover:text-blue-400'
                    }`}
                    onClick={() => setMenuOpen(false)}
                  >
                    {link.name}
                  </Link>
                ))}
                <button
                  onClick={() => {
                    handleLogout();
                    setMenuOpen(false);
                  }}
                  className="text-left text-gray-600 hover:text-red-500 dark:text-gray-300 dark:hover:text-red-400 font-medium"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className={`font-medium ${
                    pathname === '/login'
                      ? 'text-blue-600 dark:text-blue-400'
                      : 'text-gray-600 hover:text-blue-500 dark:text-gray-300 dark:hover:text-blue-400'
                  }`}
                  onClick={() => setMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className={`font-medium ${
                    pathname === '/register'
                      ? 'text-blue-600 dark:text-blue-400'
                      : 'text-gray-600 hover:text-blue-500 dark:text-gray-300 dark:hover:text-blue-400'
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
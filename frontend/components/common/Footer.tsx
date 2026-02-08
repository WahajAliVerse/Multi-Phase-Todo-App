import React from 'react';
import Link from 'next/link';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="md:flex md:items-center md:justify-between">
          <div className="flex justify-center md:justify-start">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                TodoApp
              </Link>
            </div>
          </div>
          <div className="mt-4 md:mt-0 md:order-1">
            <p className="text-center text-sm text-gray-500 dark:text-gray-400">
              &copy; {new Date().getFullYear()} TodoApp. All rights reserved.
            </p>
          </div>
          <div className="mt-4 flex justify-center space-x-6 md:mt-0 md:justify-end">
            <Link href="/privacy" className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300">
              Terms
            </Link>
            <Link href="/contact" className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300">
              Contact
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
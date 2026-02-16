import React from 'react';
import Link from 'next/link';

const Footer: React.FC = () => {
  return (
    <footer className="bg-background border-t border-border">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="md:flex md:items-center md:justify-between">
          <div className="flex justify-center md:justify-start">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="text-lg font-bold text-primary">
                TodoApp
              </Link>
            </div>
          </div>
          <div className="mt-4 md:mt-0 md:order-1">
            <p className="text-center text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} TodoApp. All rights reserved.
            </p>
          </div>
          <div className="mt-4 flex justify-center space-x-6 md:mt-0 md:justify-end">
            <Link href="/privacy" className="text-muted-foreground hover:text-foreground">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-muted-foreground hover:text-foreground">
              Terms
            </Link>
            <Link href="/contact" className="text-muted-foreground hover:text-foreground">
              Contact
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
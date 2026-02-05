import React from 'react';
import Link from 'next/link';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-gray-800 text-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-lg font-semibold mb-4">Multi-Phase Todo App</h3>
            <p className="text-gray-300 text-sm">
              A feature-rich todo application with recurrence patterns, notifications, reminders, and tags
              to help you stay organized and productive.
            </p>
          </div>
          
          <div>
            <h4 className="text-md font-medium mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li><Link href="/" className="text-gray-300 hover:text-white text-sm">Home</Link></li>
              <li><Link href="/tasks" className="text-gray-300 hover:text-white text-sm">Tasks</Link></li>
              <li><Link href="/tags" className="text-gray-300 hover:text-white text-sm">Tags</Link></li>
              <li><Link href="/profile" className="text-gray-300 hover:text-white text-sm">Profile</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-md font-medium mb-4">Legal</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-300 hover:text-white text-sm">Privacy Policy</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white text-sm">Terms of Service</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white text-sm">Cookie Policy</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-8 pt-6 text-center">
          <p className="text-gray-400 text-sm">
            © {currentYear} Multi-Phase Todo App. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
'use client';

import React from 'react';
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { useThemeSync } from '@/hooks/useThemeSync';

const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useThemeSync();

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={toggleTheme}
      className="p-2 rounded-full text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none transition-colors duration-200"
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      {theme === 'light' ? (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        >
          <MoonIcon className="h-5 w-5" />
        </motion.div>
      ) : (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        >
          <SunIcon className="h-5 w-5 text-yellow-400" />
        </motion.div>
      )}
    </motion.button>
  );
};

export default ThemeToggle;
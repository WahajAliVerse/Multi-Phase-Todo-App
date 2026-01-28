import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

type ThemeTransitionProps = {
  children: React.ReactNode;
} & HTMLMotionProps<'div'>;

export const ThemeTransition: React.FC<ThemeTransitionProps> = ({ children, ...props }) => {
  return (
    <motion.div
      initial={{ opacity: 0.8 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }} // Smooth transition for theme changes
      {...props}
    >
      {children}
    </motion.div>
  );
};

export default ThemeTransition;
import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

type PageTransitionProps = HTMLMotionProps<'div'>;

export const PageTransition: React.FC<PageTransitionProps> = ({ children, ...props }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.08 }} // <100ms as required
      {...props}
    >
      {children}
    </motion.div>
  );
};

export default PageTransition;
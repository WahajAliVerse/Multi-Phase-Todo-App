import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

type MotionDivProps = HTMLMotionProps<'div'>;

export const MotionWrapper: React.FC<MotionDivProps> = ({ children, ...props }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.08 }} // <100ms as required
      {...props}
    >
      {children}
    </motion.div>
  );
};

export default MotionWrapper;
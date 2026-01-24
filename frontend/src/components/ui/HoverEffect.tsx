import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

type HoverEffectProps = {
  children: React.ReactNode;
} & HTMLMotionProps<'div'>;

export const HoverEffect: React.FC<HoverEffectProps> = ({ children, ...props }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.08 }} // <100ms as required
      {...props}
    >
      {children}
    </motion.div>
  );
};

export default HoverEffect;
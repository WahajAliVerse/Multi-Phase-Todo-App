import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { Button, ButtonProps } from '@mui/material';

type AnimatedButtonProps = {
  children: React.ReactNode;
} & ButtonProps & Omit<HTMLMotionProps<'button'>, 'color'>;

export const AnimatedButton: React.FC<AnimatedButtonProps> = ({ children, ...props }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.08 }} // <100ms as required
    >
      <Button
        {...props}
      >
        {children}
      </Button>
    </motion.div>
  );
};

export default AnimatedButton;
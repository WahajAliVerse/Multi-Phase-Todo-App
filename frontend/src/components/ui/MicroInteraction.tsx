import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

type MicroInteractionProps = {
  children: React.ReactNode;
  triggerOnHover?: boolean;
  triggerOnClick?: boolean;
} & HTMLMotionProps<'div'>;

export const MicroInteraction: React.FC<MicroInteractionProps> = ({ 
  children, 
  triggerOnHover = true, 
  triggerOnClick = true,
  ...props 
}) => {
  const motionProps: any = {};
  
  if (triggerOnHover) {
    motionProps.whileHover = { scale: 1.03 };
  }
  
  if (triggerOnClick) {
    motionProps.whileTap = { scale: 0.98 };
  }
  
  motionProps.transition = { duration: 0.08 }; // <100ms as required
  
  return (
    <motion.div
      {...motionProps}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export default MicroInteraction;
import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { Card, CardContent, CardHeader } from '@mui/material';

type AnimatedCardProps = {
  title?: string;
  children: React.ReactNode;
} & HTMLMotionProps<'div'>;

export const AnimatedCard: React.FC<AnimatedCardProps> = ({ title, children, ...props }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.08 }} // <100ms as required
      whileHover={{ y: -5 }}
      {...props}
    >
      <Card>
        {title && <CardHeader title={<motion.span whileTap={{ scale: 0.95 }}>{title}</motion.span>} />}
        <CardContent>
          {children}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default AnimatedCard;
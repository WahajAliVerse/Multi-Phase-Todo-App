import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { List, ListItem, ListItemText } from '@mui/material';

type AnimatedListProps = {
  items: string[];
} & HTMLMotionProps<'ul'>;

export const AnimatedList: React.FC<AnimatedListProps> = ({ items, ...props }) => {
  return (
    <motion.ul
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: 0.05, // Stagger each child by 50ms
          },
        },
      }}
      {...props}
    >
      {items.map((item, index) => (
        <motion.li
          key={index}
          variants={{
            hidden: { y: 20, opacity: 0 },
            visible: { y: 0, opacity: 1 },
          }}
          transition={{ duration: 0.08 }} // <100ms as required
        >
          <List>
            <ListItem>
              <ListItemText primary={item} />
            </ListItem>
          </List>
        </motion.li>
      ))}
    </motion.ul>
  );
};

export default AnimatedList;
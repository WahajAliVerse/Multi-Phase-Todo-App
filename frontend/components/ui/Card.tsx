'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  elevated?: boolean;
  animated?: boolean;
}

const Card: React.FC<CardProps> = ({ 
  children, 
  elevated = false, 
  animated = false,
  className = '', 
  ...props 
}) => {
  const baseClasses = 'rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/70 backdrop-blur-sm shadow-sm overflow-hidden';
  const elevationClass = elevated ? 'shadow-xl' : '';
  const animationClass = animated ? 'hover:shadow-xl transition-shadow duration-300' : '';
  
  const classes = `${baseClasses} ${elevationClass} ${animationClass} ${className}`;
  
  if (animated) {
    return (
      <motion.div 
        whileHover={{ y: -5 }}
        className={classes} 
        {...(props as any)}
      >
        {children}
      </motion.div>
    );
  }
  
  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
};

interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}

const CardHeader: React.FC<CardHeaderProps> = ({ 
  children, 
  className = '', 
  ...props 
}) => {
  return (
    <div className={`p-6 border-b border-gray-200 dark:border-gray-700 ${className}`} {...props}>
      {children}
    </div>
  );
};

interface CardBodyProps extends React.HTMLAttributes<HTMLDivElement> {}

const CardBody: React.FC<CardBodyProps> = ({ 
  children, 
  className = '', 
  ...props 
}) => {
  return (
    <div className={`p-6 ${className}`} {...props}>
      {children}
    </div>
  );
};

interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {}

const CardFooter: React.FC<CardFooterProps> = ({ 
  children, 
  className = '', 
  ...props 
}) => {
  return (
    <div className={`p-6 border-t border-gray-200 dark:border-gray-700 ${className}`} {...props}>
      {children}
    </div>
  );
};

interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {}

const CardTitle: React.FC<CardTitleProps> = ({ 
  children, 
  className = '', 
  ...props 
}) => {
  return (
    <h3 className={`text-xl font-bold text-gray-900 dark:text-white ${className}`} {...props}>
      {children}
    </h3>
  );
};

interface CardDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {}

const CardDescription: React.FC<CardDescriptionProps> = ({ 
  children, 
  className = '', 
  ...props 
}) => {
  return (
    <p className={`text-sm text-gray-500 dark:text-gray-400 mt-2 ${className}`} {...props}>
      {children}
    </p>
  );
};

export { Card, CardHeader, CardBody, CardFooter, CardTitle, CardDescription };
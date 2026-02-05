import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}

interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {}

interface CardDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {}

interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {}

interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {}

const Card: React.FC<CardProps> = ({ className, ...props }) => {
  const classes = `bg-white shadow rounded-lg ${className || ''}`;
  return <div className={classes} {...props} />;
};

const CardHeader: React.FC<CardHeaderProps> = ({ className, ...props }) => {
  const classes = `p-6 ${className || ''}`;
  return <div className={classes} {...props} />;
};

const CardTitle: React.FC<CardTitleProps> = ({ className, ...props }) => {
  const classes = `text-2xl font-bold leading-none tracking-tight ${className || ''}`;
  return <h3 className={classes} {...props} />;
};

const CardDescription: React.FC<CardDescriptionProps> = ({ className, ...props }) => {
  const classes = `text-sm text-gray-500 ${className || ''}`;
  return <p className={classes} {...props} />;
};

const CardContent: React.FC<CardContentProps> = ({ className, ...props }) => {
  const classes = `p-6 pt-0 ${className || ''}`;
  return <div className={classes} {...props} />;
};

const CardFooter: React.FC<CardFooterProps> = ({ className, ...props }) => {
  const classes = `p-6 pt-0 ${className || ''}`;
  return <div className={classes} {...props} />;
};

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent
};
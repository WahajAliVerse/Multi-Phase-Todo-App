import React from 'react';

interface NotificationBadgeProps {
  count?: number;
  maxCount?: number;
  variant?: 'dot' | 'count';
  className?: string;
  children?: React.ReactNode;
}

const NotificationBadge: React.FC<NotificationBadgeProps> = ({ 
  count = 0, 
  maxCount = 99,
  variant = 'count',
  className = '',
  children 
}) => {
  const displayCount = count > maxCount ? `${maxCount}+` : count;
  const displayCountNumeric = typeof displayCount === 'number' ? displayCount : parseInt(displayCount);

  const badgeClasses = `
    relative inline-block
    ${className}
  `;

  const badgeStyle = {
    position: 'relative' as const,
    display: 'inline-block',
  };

  const badgeIndicator = count > 0 ? (
    <span
      className={`
        absolute inline-flex items-center justify-center
        transform translate-x-1/2 -translate-y-1/2
        -top-1 -right-1
        text-xs font-bold text-white
        rounded-full
        ${count > 0
          ? 'bg-red-500 min-w-[18px] h-5 px-1'
          : 'bg-transparent'
        }
      `}
    >
      {variant === 'count' && displayCountNumeric > 0 ? displayCount : ''}
    </span>
  ) : null;

  return (
    <div className={badgeClasses} style={badgeStyle}>
      {children}
      {badgeIndicator}
    </div>
  );
};

export default NotificationBadge;
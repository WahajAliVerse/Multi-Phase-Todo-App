// Responsive design implementation using breakpoints from UIConfig
import { UIConfig } from '../config/ui-config';

// Breakpoint definitions
export const breakpoints = {
  xs: 0,
  sm: UIConfig.breakpoints.sm, // 600px
  md: UIConfig.breakpoints.md, // 960px
  lg: UIConfig.breakpoints.lg, // 1280px
  xl: UIConfig.breakpoints.xl, // 1920px
};

// Media query helpers
export const mediaQueries = {
  xs: `@media (min-width: ${breakpoints.xs}px)`,
  sm: `@media (min-width: ${breakpoints.sm}px)`,
  md: `@media (min-width: ${breakpoints.md}px)`,
  lg: `@media (min-width: ${breakpoints.lg}px)`,
  xl: `@media (min-width: ${breakpoints.xl}px)`,
  
  // Max width queries
  maxSm: `@media (max-width: ${breakpoints.sm - 1}px)`,
  maxMd: `@media (max-width: ${breakpoints.md - 1}px)`,
  maxLg: `@media (max-width: ${breakpoints.lg - 1}px)`,
  maxXl: `@media (max-width: ${breakpoints.xl - 1}px)`,
  
  // Range queries
  betweenSmMd: `@media (min-width: ${breakpoints.sm}px) and (max-width: ${breakpoints.md - 1}px)`,
  betweenMdLg: `@media (min-width: ${breakpoints.md}px) and (max-width: ${breakpoints.lg - 1}px)`,
  betweenLgXl: `@media (min-width: ${breakpoints.lg}px) and (max-width: ${breakpoints.xl - 1}px)`,
};

// Responsive utility functions
export const responsiveStyles = {
  // Responsive font sizes
  fontSize: {
    xs: '0.75rem',  // 12px
    sm: '0.875rem', // 14px
    md: '1rem',     // 16px
    lg: '1.125rem', // 18px
    xl: '1.25rem',  // 20px
    responsive: (minSize: number, maxSize: number) => `
      /* Fluid typography */
      font-size: calc(${minSize}px + (${maxSize} - ${minSize}) * ((100vw - 320px) / (1920 - 320)));
      
      /* Clamp to prevent text from becoming too small or too large */
      font-size: clamp(${minSize}px, calc(${minSize}px + (${maxSize} - ${minSize}) * ((100vw - 320px) / (1920 - 320))), ${maxSize}px);
    `,
  },
  
  // Responsive spacing
  spacing: (size: keyof typeof UIConfig.spacing) => UIConfig.spacing[size],
  
  // Responsive grid layouts
  grid: {
    columns: (count: number) => ({
      xs: 1,
      sm: count >= 2 ? 2 : 1,
      md: count >= 3 ? 3 : count,
      lg: count >= 4 ? 4 : count,
      xl: count >= 6 ? 6 : count,
    }),
  },
  
  // Responsive component sizing
  componentSizes: {
    button: {
      xs: { padding: '4px 8px', fontSize: '0.75rem' },
      sm: { padding: '6px 12px', fontSize: '0.875rem' },
      md: { padding: '8px 16px', fontSize: '1rem' },
      lg: { padding: '10px 20px', fontSize: '1.125rem' },
      xl: { padding: '12px 24px', fontSize: '1.25rem' },
    },
    card: {
      xs: { padding: '8px', margin: '4px' },
      sm: { padding: '12px', margin: '6px' },
      md: { padding: '16px', margin: '8px' },
      lg: { padding: '20px', margin: '10px' },
      xl: { padding: '24px', margin: '12px' },
    },
  },
};

// CSS utility classes for responsive design
export const responsiveClassNames = {
  container: 'responsive-container',
  grid: 'responsive-grid',
  hideOnMobile: 'hide-on-mobile',
  hideOnDesktop: 'hide-on-desktop',
  showBelowMd: 'show-below-md',
  showAboveMd: 'show-above-md',
};

// Example of how to apply responsive styles in a component
export const applyResponsiveStyles = () => {
  // This would typically be used in styled components or CSS-in-JS libraries
  // to apply responsive styles based on the breakpoints defined above
  console.log('Applying responsive design to components using breakpoints from UIConfig');
};
import React from 'react';
import Button from '@mui/material/Button';
import { useTheme } from '../../contexts/ThemeContext';

export const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button 
      variant="outlined" 
      onClick={toggleTheme}
      sx={{
        position: 'fixed',
        top: 16,
        right: 16,
        zIndex: 1300,
      }}
    >
      Switch to {theme === 'light' ? 'dark' : 'light'} mode
    </Button>
  );
};

export default ThemeToggle;
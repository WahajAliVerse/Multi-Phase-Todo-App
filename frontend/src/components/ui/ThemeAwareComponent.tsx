import React from 'react';
import { Box, Paper, Typography } from '@mui/material';
import { useTheme } from '../../contexts/ThemeContext'; // Note: exact filename with capital T

interface ThemeAwareComponentProps {
  children: React.ReactNode;
  title?: string;
}

export const ThemeAwareComponent: React.FC<ThemeAwareComponentProps> = ({ children, title }) => {
  const { theme } = useTheme();

  return (
    <Paper
      elevation={3}
      sx={{
        backgroundColor: theme === 'light' ? '#fff' : '#1e1e1e',
        color: theme === 'light' ? '#000' : '#fff',
        padding: 2,
        borderRadius: 2,
        boxShadow: theme === 'light'
          ? '0 4px 6px rgba(0, 0, 0, 0.1)'
          : '0 4px 6px rgba(255, 255, 255, 0.1)'
      }}
    >
      {title && (
        <Typography 
          variant="h6" 
          sx={{ 
            marginBottom: 1,
            color: theme === 'light' ? '#1976d2' : '#90caf9' 
          }}
        >
          {title}
        </Typography>
      )}
      <Box>
        {children}
      </Box>
    </Paper>
  );
};

export default ThemeAwareComponent;
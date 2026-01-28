import React from 'react';
import { Box, Paper, Typography } from '@mui/material';
import { useTheme } from '../../contexts/ThemeContext'; // Note: exact filename with capital T

interface ThemeAwareComponentProps {
  children: React.ReactNode;
  title?: string;
}

export const ThemeAwareComponent: React.FC<ThemeAwareComponentProps> = ({ children, title }) => {
  const { themeMode } = useTheme();
  
  return (
    <Paper 
      elevation={3}
      sx={{
        backgroundColor: themeMode === 'light' ? '#fff' : '#1e1e1e',
        color: themeMode === 'light' ? '#000' : '#fff',
        padding: 2,
        borderRadius: 2,
        boxShadow: themeMode === 'light' 
          ? '0 4px 6px rgba(0, 0, 0, 0.1)' 
          : '0 4px 6px rgba(255, 255, 255, 0.1)'
      }}
    >
      {title && (
        <Typography 
          variant="h6" 
          sx={{ 
            marginBottom: 1,
            color: themeMode === 'light' ? '#1976d2' : '#90caf9' 
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
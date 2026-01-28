import React from 'react';
import { 
  Box, 
  LinearProgress, 
  Alert, 
  CircularProgress, 
  Typography,
  Fade
} from '@mui/material';
import { CheckCircle, Info } from '@mui/icons-material';

type FormStatesProps = {
  isLoading?: boolean;
  isSuccess?: boolean;
  successMessage?: string;
  errorMessage?: string;
  showLoadingIndicator?: boolean;
  showSuccessAlert?: boolean;
  showErrorAlert?: boolean;
};

export const FormStates: React.FC<FormStatesProps> = ({
  isLoading = false,
  isSuccess = false,
  successMessage = 'Form submitted successfully!',
  errorMessage,
  showLoadingIndicator = true,
  showSuccessAlert = true,
  showErrorAlert = true,
}) => {
  return (
    <>
      {/* Loading State */}
      {isLoading && showLoadingIndicator && (
        <Fade in={isLoading}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <CircularProgress size={20} sx={{ mr: 2 }} />
            <Typography variant="body2">Processing...</Typography>
          </Box>
        </Fade>
      )}
      
      {isLoading && (
        <LinearProgress sx={{ mb: 2 }} />
      )}

      {/* Success State */}
      {isSuccess && showSuccessAlert && (
        <Fade in={isSuccess}>
          <Alert 
            severity="success" 
            icon={<CheckCircle />}
            sx={{ mb: 2 }}
          >
            {successMessage}
          </Alert>
        </Fade>
      )}

      {/* Error State */}
      {errorMessage && showErrorAlert && (
        <Fade in={!!errorMessage}>
          <Alert 
            severity="error" 
            icon={<Info />}
            sx={{ mb: 2 }}
          >
            {errorMessage}
          </Alert>
        </Fade>
      )}
    </>
  );
};

export default FormStates;
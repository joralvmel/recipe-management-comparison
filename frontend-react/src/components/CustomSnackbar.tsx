import type React from 'react';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import '@styles/components/_snackbar.scss';

interface CustomSnackbarProps {
  open: boolean;
  message: string;
  severity: 'error' | 'warning' | 'info' | 'success';
  onClose: (event?: React.SyntheticEvent | Event, reason?: string) => void;
}

const CustomSnackbar: React.FC<CustomSnackbarProps> = ({ open, message, severity, onClose }) => {
  return (
    <Snackbar
      open={open}
      autoHideDuration={5000}
      onClose={onClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      className="custom-snackbar"
    >
      <Alert onClose={onClose} severity={severity} className="custom-alert">
        {message}
      </Alert>
    </Snackbar>
  );
};

export default CustomSnackbar;

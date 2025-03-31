import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { AuthProvider } from './context/AuthContext';
import { SnackbarProvider } from './context/SnackbarContext';
import { SearchProvider } from './context/SearchContext.tsx';
import App from './App';
import './index.css';

const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <AuthProvider>
        <SnackbarProvider>
          <SearchProvider>
            <App />
          </SearchProvider>
        </SnackbarProvider>
      </AuthProvider>
    </StrictMode>
  );
} else {
  console.error('Root element not found');
}

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { AuthProvider } from './context/AuthContext';
import { SnackbarProvider } from './context/SnackbarContext';
import { RecipeSearchProvider } from './context/RecipeSearchContext.tsx';
import App from './App';
import './index.css';

const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <AuthProvider>
        <SnackbarProvider>
          <RecipeSearchProvider>
            <App />
          </RecipeSearchProvider>
        </SnackbarProvider>
      </AuthProvider>
    </StrictMode>
  );
} else {
  console.error('Root element not found');
}

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { AuthProvider } from './context/AuthContext';
import { SnackbarProvider } from './context/SnackbarContext';
import { RecipeSearchProvider } from './context/RecipeSearchContext';
import { FavoriteProvider } from './context/FavoriteContext';
import App from './App';
import './index.css';

const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <SnackbarProvider>
        <AuthProvider>
          <FavoriteProvider>
            <RecipeSearchProvider>
              <App />
            </RecipeSearchProvider>
          </FavoriteProvider>
        </AuthProvider>
      </SnackbarProvider>
    </StrictMode>
  );
} else {
  console.error('Root element not found');
}

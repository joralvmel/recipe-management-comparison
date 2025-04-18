import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import { SnackbarProvider } from './context/SnackbarContext';
import { RecipeSearchProvider } from './context/RecipeSearchContext';
import { FavoriteProvider } from './context/FavoriteContext';
import App from './App';
import './index.css';

const queryClient = new QueryClient();

const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <SnackbarProvider>
          <AuthProvider>
            <FavoriteProvider>
              <RecipeSearchProvider>
                <App />
              </RecipeSearchProvider>
            </FavoriteProvider>
          </AuthProvider>
        </SnackbarProvider>
      </QueryClientProvider>
    </StrictMode>
  );
} else {
  console.error('Root element not found');
}

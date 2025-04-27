import type React from 'react';
import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useSnackbar } from '@context/SnackbarContext';
import Navbar from '@components/Navbar';
import Footer from '@components/Footer';
import CustomSnackbar from '@components/CustomSnackbar';
import AuthGuard from '@components/AuthGuard';
import Loader from '@components/Loader';
import '@styles/styles.scss';

const Home = lazy(() => import('@pages/Home'));
const Search = lazy(() => import('@pages/Search'));
const Favorites = lazy(() => import('@pages/Favorites'));
const RecipeDetail = lazy(() => import('@pages/RecipeDetail'));
const Login = lazy(() => import('@pages/Login'));
const Register = lazy(() => import('@pages/Register'));
const NotFound = lazy(() => import('@pages/NotFound'));

const App: React.FC = () => {
  const { snackbar, closeSnackbar } = useSnackbar();

  return (
    <Router>
      <Navbar />
      <Suspense fallback={<Loader message="Loading page..." size="large" />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<Search />} />
          <Route
            path="/favorites"
            element={
              <AuthGuard>
                <Favorites />
              </AuthGuard>
            }
          />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/recipe/:id" element={<RecipeDetail />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
      <Footer />
      <CustomSnackbar
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={closeSnackbar}
      />
    </Router>
  );
};

export default App;

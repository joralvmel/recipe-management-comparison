import type React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useSnackbar } from './context/SnackbarContext';
import Home from './pages/Home';
import Search from './pages/Search';
import Favorites from './pages/Favorites';
import RecipeDetail from './pages/RecipeDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CustomSnackbar from './components/CustomSnackbar';
import AuthGuard from './components/AuthGuard';
import NotFound from './pages/NotFound';
import '@styles/styles.scss';

const App: React.FC = () => {
  const { snackbar, closeSnackbar } = useSnackbar();

  return (
    <Router>
      <Navbar />
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

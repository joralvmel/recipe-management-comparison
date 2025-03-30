import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Search from './pages/Search';
import Favorites from './pages/Favorites';
import RecipeDetail from './pages/RecipeDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import '@styles/styles.scss';

function App() {
  const [isSignedIn, setIsSignedIn] = useState(true);

  return (
    <Router>
      <Navbar isSignedIn={isSignedIn} setIsSignedIn={setIsSignedIn} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/search" element={<Search />} />
        <Route path="/favorites" element={<Favorites />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/recipe/:id" element={<RecipeDetail isSignedIn={isSignedIn} />} />
      </Routes>
      <Footer />
    </Router>
  );
}

export default App;

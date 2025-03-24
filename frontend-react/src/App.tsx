import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import '@styles/styles.scss';
import Home from './pages/Home';
import Search from './pages/Search.tsx';
import Login from './pages/Login';
import Register from './pages/Register.tsx';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/search" element={<Search />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
      <Footer />
    </Router>
  );
}

export default App;

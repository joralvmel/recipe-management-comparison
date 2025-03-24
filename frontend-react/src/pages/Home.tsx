import type React from 'react';
import '@styles/pages/_home.scss';
import HeroSection from '../components/HeroSection';
import FeatureSection from '../components/FeatureSection';

const Home: React.FC = () => {
  return (
    <div className="home container">
      <HeroSection />
      <FeatureSection />
    </div>
  );
};

export default Home;

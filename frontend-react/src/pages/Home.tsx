import type React from 'react';
import HeroSection from '../components/HeroSection';
import FeatureSection from '../components/FeatureSection';
import '@styles/pages/_home.scss';

const Home: React.FC = () => {
  return (
    <div className="home container">
      <HeroSection />
      <FeatureSection />
    </div>
  );
};

export default Home;

import type React from 'react';
import Feature from './Feature';

const FeatureSection: React.FC = () => {
  return (
    <section className="features">
      <Feature title="Explore Recipes" description="Find recipes from around the world." />
      <Feature title="Save Favorites" description="Keep track of your favorite recipes." />
      <Feature title="Share with Friends" description="Share your favorite recipes with friends and family." />
    </section>
  );
};

export default FeatureSection;

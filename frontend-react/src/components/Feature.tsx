import type React from 'react';

interface FeatureProps {
  title: string;
  description: string;
}

const Feature: React.FC<FeatureProps> = ({ title, description }) => {
  return (
    <div className="feature">
      <h2>{title}</h2>
      <p>{description}</p>
    </div>
  );
};

export default Feature;
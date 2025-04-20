import { render, screen } from '@testing-library/react';
import FeatureSection from '@components/FeatureSection';
import '@testing-library/jest-dom';

describe('FeatureSection Component', () => {
  it('renders the FeatureSection with all Feature components', () => {
    render(<FeatureSection />);

    const section = document.querySelector('.features');
    expect(section).toBeInTheDocument();

    expect(screen.getByText('Explore Recipes')).toBeInTheDocument();
    expect(screen.getByText('Save Favorites')).toBeInTheDocument();
    expect(screen.getByText('Share with Friends')).toBeInTheDocument();

    expect(screen.getByText('Find recipes from around the world.')).toBeInTheDocument();
    expect(screen.getByText('Keep track of your favorite recipes.')).toBeInTheDocument();
    expect(screen.getByText('Share your favorite recipes with friends and family.')).toBeInTheDocument();
  });
});
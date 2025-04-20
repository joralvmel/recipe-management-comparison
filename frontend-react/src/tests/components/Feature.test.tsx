import { render, screen } from '@testing-library/react';
import Feature from '@components/Feature';
import '@testing-library/jest-dom';

describe('Feature Component', () => {
  const mockTitle = 'Awesome Feature';
  const mockDescription = 'This feature is truly awesome and will improve your experience!';

  it('renders the title correctly', () => {
    render(<Feature title={mockTitle} description={mockDescription} />);

    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(mockTitle);
  });

  it('renders the description correctly', () => {
    render(<Feature title={mockTitle} description={mockDescription} />);

    expect(screen.getByText(mockDescription)).toBeInTheDocument();
  });
});

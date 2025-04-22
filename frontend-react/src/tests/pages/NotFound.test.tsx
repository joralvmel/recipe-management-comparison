import { render, screen } from '@testing-library/react';
import NotFound from '@pages/NotFound';
import '@testing-library/jest-dom';

describe('NotFound Component', () => {
  it('should render the NotFound component with the correct message', () => {
    render(<NotFound />);
    expect(
      screen.getByText(
        'The page you are looking for does not exist. Please check the URL or return to the homepage.'
      )
    ).toBeInTheDocument();
  });
});

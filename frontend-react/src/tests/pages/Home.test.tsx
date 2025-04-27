import { render, screen } from '@testing-library/react'
import { vi } from 'vitest'
import Home from '@pages/Home'
import '@testing-library/jest-dom'

vi.mock('@components/HeroSection', () => ({
  default: () => <div data-testid="hero-section">HeroSection</div>
}))

vi.mock('@components/FeatureSection', () => ({
  default: () => <div data-testid="feature-section">FeatureSection</div>
}))

describe('Home Component', () => {
  it('should render the Home component', () => {
    render(<Home />)
    expect(screen.getByTestId('hero-section')).toBeInTheDocument()
    expect(screen.getByTestId('feature-section')).toBeInTheDocument()
  })

  it('should have the correct container class', () => {
    render(<Home />)
    const container = screen.getByText('HeroSection').closest('.home.container');
    expect(container).not.toBeNull();
    expect(container).toHaveClass('home container');
  })
})

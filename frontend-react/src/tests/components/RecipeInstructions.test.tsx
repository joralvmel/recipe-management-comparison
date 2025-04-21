import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import RecipeInstructions from '@components/RecipeInstructions';

describe('RecipeInstructions Component', () => {
  it('renders the instructions label', () => {
    render(<RecipeInstructions instructions={[]} />);

    expect(screen.getByText('Instructions')).toBeInTheDocument();
  });

  it('renders a list of instructions', () => {
    const instructions = [
      'Preheat oven to 350°F.',
      'Mix all ingredients in a bowl.',
      'Pour the mixture into a baking dish.',
      'Bake for 25 minutes or until golden brown.',
    ];

    render(<RecipeInstructions instructions={instructions} />);

    const steps = screen.getAllByRole('listitem');
    expect(steps).toHaveLength(instructions.length);

    instructions.forEach((instruction, index) => {
      expect(steps[index]).toHaveTextContent(instruction);
    });
  });

  it('renders an empty list when no instructions are provided', () => {
    render(<RecipeInstructions instructions={[]} />);

    const list = screen.getByRole('list');
    expect(list).toBeInTheDocument();
    expect(list).toBeEmptyDOMElement();
  });

  it('handles a single instruction correctly', () => {
    const instructions = ['Chop the vegetables.'];

    render(<RecipeInstructions instructions={instructions} />);

    const steps = screen.getAllByRole('listitem');
    expect(steps).toHaveLength(1);
    expect(steps[0]).toHaveTextContent('Chop the vegetables.');
  });
});
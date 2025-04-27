import type React from 'react';

interface RecipeInstructionsProps {
  instructions: string[];
}

const RecipeInstructions: React.FC<RecipeInstructionsProps> = ({ instructions }) => {
  return (
    <div className="recipe-instructions">
      <label htmlFor="instructions">Instructions</label>
      <ol className="instructions-steps">
        {instructions.map((instruction) => (
          <li className="instruction-step" key={instruction}>{instruction}</li>
        ))}
      </ol>
    </div>
  );
};

export default RecipeInstructions;

import type React from 'react';
import type { RecipeType } from '../types';
import Card from './Card';
import '@styles/components/_cards.scss';

interface CardsProps {
  recipes: RecipeType[];
}

const Cards: React.FC<CardsProps> = ({ recipes }) => {
  return (
    <div className="grid">
      {recipes.map((recipe) => {
        const key = recipe.id || recipe.externalId || Math.random().toString();
        return <Card key={key} recipe={recipe} />;
      })
      }
    </div>
  );
};

export default Cards;

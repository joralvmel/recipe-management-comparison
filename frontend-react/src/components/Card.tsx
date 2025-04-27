import type { RecipeType } from '@src/types';
import { forwardRef } from 'react';
import { Link } from 'react-router-dom';
import Image from '@components//Image';
import Favorite from '@components//Favorite';

interface CardProps {
  recipe: RecipeType;
}

const Card = forwardRef<HTMLDivElement, CardProps>(({ recipe }, ref) => {
  const recipeId = recipe.id || recipe.externalId || '';

  if (!recipeId) {
    return null;
  }

  const { image = '', title = '', readyInMinutes = 0, healthScore = 0 } = recipe;

  return (
    <div ref={ref} className="card">
      <Link to={`/recipe/${recipeId}`}>
        <Image src={image} alt={title} />
        <div className="title">{title}</div>
      </Link>
      <div className="details">
        <span className="prep-time">Preparation time: {readyInMinutes}</span>
        <span className="score">Score: {healthScore}</span>
      </div>
      <Favorite id={recipeId.toString()} />
    </div>
  );
});

export default Card;

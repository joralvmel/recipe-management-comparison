import type React from 'react';
import type { RecipeType } from '../types';
import { Link } from 'react-router-dom';
import Image from './Image';
import Favorite from './Favorite';

interface CardProps {
  recipe: RecipeType;
}

const Card: React.FC<CardProps> = ({ recipe }) => {
  const { id = '', image = '', title = '', readyInMinutes = 0, healthScore = 0 } = recipe;

  return (
    <div className="card">
      <Link to={`/recipe/${id}`}>
        <Image src={image} alt={title} />
        <div className="title">{title}</div>
      </Link>
      <div className="details">
        <span className="prep-time">Preparation time: {readyInMinutes}</span>
        <span className="score">Score: {healthScore}</span>
      </div>
      <Favorite id={id.toString()} />
    </div>
  );
};

export default Card;

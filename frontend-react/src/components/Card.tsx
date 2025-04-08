import type React from 'react';
import { Link } from 'react-router-dom';
import Image from './Image';
import Favorite from './Favorite';

export interface CardProps {
  id: string;
  image: string;
  title: string;
  readyInMinutes: number;
  healthScore: number;
}

const Card: React.FC<CardProps> = ({ id, image, title, readyInMinutes, healthScore }) => {
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
      <Favorite id={id} />
    </div>
  );
};

export default Card;

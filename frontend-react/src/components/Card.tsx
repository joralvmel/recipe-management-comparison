import type React from 'react';
import { Link } from 'react-router-dom';
import Image from './Image';
import Favorite from './Favorite';

export interface CardProps {
  id: string;
  image: string;
  title: string;
}

const Card: React.FC<CardProps> = ({ id, image, title }) => {
  return (
    <div className="card">
      <Link to={`/recipe/${id}`}>
        <Image src={image} alt={title} />
        <div className="title">{title}</div>
      </Link>
      <Favorite id={id} />
    </div>
  );
};

export default Card;

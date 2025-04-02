import type React from 'react';
import { Link } from 'react-router-dom';
import Image from './Image';
import Favorite from './Favorite';

export interface CardProps {
  id: string;
  imgSrc: string;
  title: string;
}

const Card: React.FC<CardProps> = ({ id, imgSrc, title }) => {
  return (
    <div className="card">
      <Link to={`/recipe/${id}`}>
        <Image src={imgSrc} alt={title} />
        <div className="title">{title}</div>
      </Link>
      <Favorite id={id} />
    </div>
  );
};

export default Card;

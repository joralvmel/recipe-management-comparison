import type React from 'react';
import { Link } from 'react-router-dom';
import Input from './Input';
import Image from './Image';

export interface CardProps {
  id: string;
  imgSrc: string;
  title: string;
  isFavorite: boolean;
}

const Card: React.FC<CardProps> = ({ id, imgSrc, title, isFavorite }) => {
  const handleFavoriteClick = () => {
    const checkbox = document.getElementById(id) as HTMLInputElement;
    if (checkbox) {
      checkbox.checked = !checkbox.checked;
    }
  };

  return (
    <div className="card">
      <Link to={`/recipe/${id}`}>
        <Image src={imgSrc} alt={title} />
        <div className="title">{title}</div>
      </Link>
      <div className="input-favorite">
        <Input inputType="checkbox" id={id} className="favorite-checkbox" required={false} defaultChecked={isFavorite} />
        <span
          className="favorite-label"
          onClick={handleFavoriteClick}
          onKeyUp={(e) => e.key === 'Enter' && handleFavoriteClick()}
        />
      </div>
    </div>
  );
};

export default Card;

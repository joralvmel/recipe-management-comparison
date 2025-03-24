import type React from 'react';
import Input from './Input';
import Image from './Image.tsx';

export interface CardProps {
  imgSrc: string;
  title: string;
  prepTime: string;
  score: string;
  favoriteId: string;
  isFavorite: boolean;
}

const Card: React.FC<CardProps> = ({ imgSrc, title, prepTime, score, favoriteId, isFavorite }) => {
  const handleFavoriteClick = () => {
    const checkbox = document.getElementById(favoriteId) as HTMLInputElement;
    if (checkbox) {
      checkbox.checked = !checkbox.checked;
    }
  };

  return (
    <div className="card">
      <Image src={imgSrc} alt={title} />
      <div className="title">{title}</div>
      <div className="details">
        <span className="prep-time">Preparation time: {prepTime}</span>
        <span className="score">Score: {score}</span>
      </div>
      <div className="input-favorite">
        <Input inputType="checkbox" id={favoriteId} className="favorite-checkbox" required={false} defaultChecked={isFavorite} />
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

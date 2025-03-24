import type React from 'react';
import Card from './Card';
import '@styles/components/_cards.scss';

interface CardData {
  imgSrc: string;
  title: string;
  prepTime: string;
  score: string;
  favoriteId: string;
  isFavorite: boolean;
}

interface CardsProps {
  cards: CardData[];
}

const Cards: React.FC<CardsProps> = ({ cards }) => {
  return (
    <div className="grid">
      {cards.map((card) => (
        <Card
          key={card.favoriteId}
          imgSrc={card.imgSrc}
          title={card.title}
          prepTime={card.prepTime}
          score={card.score}
          favoriteId={card.favoriteId}
          isFavorite={card.isFavorite}
        />
      ))}
    </div>
  );
};

export default Cards;

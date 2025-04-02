import type React from 'react';
import Card from './Card';
import '@styles/components/_cards.scss';

interface CardData {
  id: string;
  imgSrc: string;
  title: string;
}

interface CardsProps {
  cards: CardData[];
}

const Cards: React.FC<CardsProps> = ({ cards }) => {
  return (
    <div className="grid">
      {cards.map((card) => (
        <Card
          key={card.id}
          id={card.id}
          imgSrc={card.imgSrc}
          title={card.title}
        />
      ))}
    </div>
  );
};

export default Cards;

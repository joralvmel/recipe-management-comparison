import type React from 'react';
import Card from './Card';
import '@styles/components/_cards.scss';

interface CardData {
  _id: { $oid: string };
  id: number;
  title: string;
  image: string;
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
          id={card.id.toString()}
          image={card.image}
          title={card.title}
        />
      ))}
    </div>
  );
};

export default Cards;

import type React from 'react';
import type { RecipeType } from '@src/types';
import Card from '@components//Card';
import useLazyLoad from '@hooks/useLazyLoad';
import '@styles/components/_cards.scss';

interface CardsProps {
  recipes: RecipeType[];
}

const CardItem: React.FC<{ recipe: RecipeType }> = ({ recipe }) => {
  const [isVisible, ref] = useLazyLoad<HTMLDivElement>({
    threshold: 0.1,
    rootMargin: '200px',
    triggerOnce: true,
  });

  return isVisible ? (
    <Card ref={ref} recipe={recipe} />
  ) : (
    <div ref={ref} style={{ height: '300px' }} />
  );
};

const Cards: React.FC<CardsProps> = ({ recipes }) => {
  const useLazyLoading = recipes.length > 10;

  if (!useLazyLoading) {
    return (
      <div className="grid">
        {recipes.map((recipe) => {
          const key = recipe.id || recipe.externalId || Math.random().toString();
          return <Card key={key} recipe={recipe} />;
        })}
      </div>
    );
  }

  return (
    <div className="grid">
      {recipes.map((recipe) => {
        const key = recipe.id || recipe.externalId || Math.random().toString();
        return <CardItem key={key} recipe={recipe} />;
      })}
    </div>
  );
};

export default Cards;

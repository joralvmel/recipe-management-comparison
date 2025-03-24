import type React from 'react';
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { recipeData } from '../data/recipeData';
import '@styles/pages/_recipe-detail.scss';

export interface Recipe {
  externalId: number;
  title: string;
  image: string;
  readyInMinutes: number;
  healthScore: number;
  servings: number;
  cuisines: string[];
  dishTypes: string[];
  diets: string[];
  analyzedInstructions: string[];
  extendedIngredients: {
    _id: string;
    amount: number;
    unitShort: string;
    nameClean: string;
    image: string;
  }[];
}

export interface Ingredient {
  _id: string;
  amount: number;
  unitShort: string;
  nameClean: string;
  image: string;
}

const RecipeDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const recipe = recipeData.find((recipe: Recipe) => recipe.externalId.toString() === id);
  const [isFavorite, setIsFavorite] = useState(true);
  const [servings, setServings] = useState(recipe ? recipe.servings : 1);

  if (!recipe) {
    return <div>Recipe not found</div>;
  }

  const handleFavoriteChange = () => {
    setIsFavorite(!isFavorite);
  };

  const handleServingsChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setServings(Number(event.target.value));
  };

  return (
    <div className="recipe-detail">
      <div className="recipe-header">
        <h1>{recipe.title}</h1>
        <div className="recipe-actions">
          <div className="input-favorite">
            <input
              type="checkbox"
              id="favorite"
              className="favorite-checkbox"
              checked={isFavorite}
              onChange={handleFavoriteChange}
            />
            <label htmlFor="favorite" className="favorite-label" />
          </div>
        </div>
      </div>
      <div className="recipe-main">
        <div className="recipe-image">
          <img src={recipe.image} alt={recipe.title} />
        </div>
      </div>
      <div className="recipe-section">
        <div className="ingredients-container">
          <div className="servings-filter">
            <label htmlFor="servings">Servings:</label>
            <div className="servings-selector">
              <button type="button" className="primary-button small-button decrement">-</button>
              <input
                className="input-number"
                type="number"
                id="servings"
                value={servings}
                min="1"
                max="6"
                onChange={handleServingsChange}
              />
              <button type="button" className="primary-button small-button increment">+</button>
            </div>
          </div>
          <div className="ingredients">
            <label htmlFor="ingredients">Ingredients</label>
            <ul className="ingredient-list">
              {recipe.extendedIngredients.map((ingredient: Ingredient) => (
                <li className="ingredient" key={ingredient._id}>
                  <div className="ingredient-quantities">
                    <span className="ingredient-quantity">{ingredient.amount}</span>
                    <span className="ingredient-unit">{ingredient.unitShort}</span>
                  </div>
                  <div className="ingredient-info">
                    <span className="ingredient-name">{ingredient.nameClean}</span>
                    <img className="ingredient-image" src={ingredient.image} alt={ingredient.nameClean} />
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="recipe-wrapper">
          <div className="recipe-info">
            <div className="stats">
              <div className="stat">
                <label htmlFor="preparation-time">Preparation Time</label>
                <span>{recipe.readyInMinutes} minutes</span>
              </div>
              <div className="stat">
                <label htmlFor="health-score">Health Score</label>
                <span>{recipe.healthScore}</span>
              </div>
            </div>
            <div className="info">
              <div className="info-item">
                <label htmlFor="cuisines">Cuisines:</label>
                <span>{recipe.cuisines.join(', ')}</span>
              </div>
              <div className="info-item">
                <label htmlFor="dish-types">Dish Types:</label>
                <span>{recipe.dishTypes.join(', ')}</span>
              </div>
              <div className="info-item">
                <label htmlFor="diets">Diets:</label>
                <span>{recipe.diets.join(', ')}</span>
              </div>
            </div>
          </div>
          <div className="recipe-instructions">
            <label htmlFor="instructions">Instructions</label>
            <ol className="instructions-steps">
              {recipe.analyzedInstructions.map((instruction: string) => (
                <li className="instruction-step" key={instruction}>{instruction}</li>
              ))}
            </ol>
          </div>
        </div>
      </div>
      <div className="review-section">
        <form className="review-form">
          <label htmlFor="review">Leave a Review</label>
          <div className="rating">
            <label htmlFor="rating">Rating:</label>
            <div className="input-star-rating" id="rating">
              <input type="radio" id="star5" name="rating" value="5" /><label htmlFor="star5" title="5 stars" />
              <input type="radio" id="star4" name="rating" value="4" /><label htmlFor="star4" title="4 stars" />
              <input type="radio" id="star3" name="rating" value="3" /><label htmlFor="star3" title="3 stars" />
              <input type="radio" id="star2" name="rating" value="2" /><label htmlFor="star2" title="2 stars" />
              <input type="radio" id="star1" name="rating" value="1" /><label htmlFor="star1" title="1 star" />
            </div>
          </div>
          <div className="comment">
            <label htmlFor="comment">Comment:</label>
            <textarea className="input-textarea" id="comment" name="comment" rows={4} placeholder="Write your review here..." />
          </div>
          <button type="submit" className="primary-button">Submit Review</button>
        </form>
        <div className="reviews-container">
          <div className="review">
            <div className="review-header">
              <div className="rating">
                <label htmlFor="review1">Jorge:</label>
                <div className="input-star-rating">
                  <input type="radio" id="star5-1" name="rating1" value="5" disabled checked /><label htmlFor="star5-1" title="5 stars" />
                  <input type="radio" id="star4-1" name="rating1" value="4" disabled /><label htmlFor="star4-1" title="4 stars" />
                  <input type="radio" id="star3-1" name="rating1" value="3" disabled /><label htmlFor="star3-1" title="3 stars" />
                  <input type="radio" id="star2-1" name="rating1" value="2" disabled /><label htmlFor="star2-1" title="2 stars" />
                  <input type="radio" id="star1-1" name="rating1" value="1" disabled /><label htmlFor="star1-1" title="1 star" />
                </div>
              </div>
              <div className="date-edit">
                <div className="review-date">2025-01-01</div>
                <button type="button" className="secondary-button small-button">Edit</button>
              </div>
            </div>
            <p className="review-comment">This is one of a kind pizza, everyone should try it out!</p>
          </div>
          <div className="review">
            <div className="review-header">
              <div className="rating">
                <label htmlFor="review2">Andres:</label>
                <div className="input-star-rating">
                  <input type="radio" id="star5-2" name="rating2" value="5" disabled /><label htmlFor="star5-2" title="5 stars" />
                  <input type="radio" id="star4-2" name="rating2" value="4" disabled checked /><label htmlFor="star4-2" title="4 stars" />
                  <input type="radio" id="star3-2" name="rating2" value="3" disabled /><label htmlFor="star3-2" title="3 stars" />
                  <input type="radio" id="star2-2" name="rating2" value="2" disabled /><label htmlFor="star2-2" title="2 stars" />
                  <input type="radio" id="star1-2" name="rating2" value="1" disabled /><label htmlFor="star1-2" title="1 star" />
                </div>
              </div>
              <div className="date-edit">
                <div className="review-date">2025-01-05</div>
                <button type="button" className="secondary-button small-button" style={{ display: 'none' }}>Edit</button>
              </div>
            </div>
            <p className="review-comment">One of my favorites.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecipeDetail;
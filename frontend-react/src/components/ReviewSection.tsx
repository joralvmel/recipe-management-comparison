import type React from 'react';

const ReviewSection: React.FC = () => {
  return (
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
  );
};

export default ReviewSection;

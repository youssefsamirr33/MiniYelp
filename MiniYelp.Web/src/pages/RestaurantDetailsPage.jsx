import { Link, useParams } from "react-router-dom";
import { RestaurantPageShell } from "../components/RestaurantPageShell";
import { StatusMessage } from "../components/StatusMessage";
import { createReview } from "../lib/restaurants";
import { useRestaurantData } from "../hooks/useRestaurantData";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";

export function RestaurantDetailsPage() {
  const { id } = useParams();
  const auth = useAuth();
  const { restaurant, reviews, setReviews, loading, error, setError } = useRestaurantData(id, {
    includeReviews: true
  });
  const [success, setSuccess] = useState("");
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "" });
  const averageRating = reviews.length
    ? (reviews.reduce((total, review) => total + Number(review.rating || 0), 0) / reviews.length).toFixed(1)
    : "0.0";

  async function handleReview(event) {
    event.preventDefault();
    setError("");
    setSuccess("");

    try {
      const createdReview = await createReview(
        {
          restaurantId: Number(id),
          rating: Number(reviewForm.rating),
          comment: reviewForm.comment
        },
        auth.token
      );

      setReviews((current) => [createdReview, ...current]);
      setReviewForm({ rating: 5, comment: "" });
      setSuccess("Review submitted successfully.");
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <RestaurantPageShell
      accent="editorial"
      error={error}
      loading={loading}
      restaurant={restaurant}
      success={success}
    >
      <section className="details-grid">
        <section className="wide-card">
          <div className="panel-heading">
            <h2>About this restaurant</h2>
            <p>Read the story, explore the branches, and decide where you want to dine.</p>
          </div>

          <div className="branch-list">
            {restaurant?.branches.map((branch) => (
              <article className="branch-card" key={branch.id}>
                <strong>{branch.branchName}</strong>
                <span>{branch.city}</span>
                <p>{branch.address}</p>
                <small>{branch.phoneNumber}</small>
                <small>{branch.openingHours}</small>
              </article>
            ))}
          </div>

          <div className="action-link-row section-actions">
            <Link className="primary-button inline-button" to={`/restaurants/${id}/reserve`}>
              Reserve a table
            </Link>
            <Link className="secondary-button inline-button" to={`/restaurants/${id}/menu`}>
              View menu
            </Link>
          </div>
        </section>

        <aside className="side-stack">
          <section className="wide-card">
            <div className="panel-heading">
              <h2>Guest reviews</h2>
              <p>Read the experience first, then share your own.</p>
            </div>

            <div className="review-summary-bar">
              <article>
                <span>Average rating</span>
                <strong>{averageRating} / 5</strong>
              </article>
              <article>
                <span>Verified reviews</span>
                <strong>{reviews.length}</strong>
              </article>
            </div>

            <form className="stack-form review-form" onSubmit={handleReview}>
              <div className="form-field">
                <span>Rating</span>
                <div className="rating-selector-row">
                  {[5, 4, 3, 2, 1].map((value) => (
                    <button
                      className={`slot-pill ${Number(reviewForm.rating) === value ? "active" : ""}`}
                      key={value}
                      type="button"
                      onClick={() => setReviewForm({ ...reviewForm, rating: value })}
                    >
                      {value} stars
                    </button>
                  ))}
                </div>
              </div>

              <label className="form-field">
                <span>Comment</span>
                <textarea
                  className="app-textarea"
                  value={reviewForm.comment}
                  onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                  placeholder="Tell others about your experience."
                />
              </label>

              <button className="secondary-button" type="submit">
                Publish review
              </button>
            </form>

            <div className="review-list">
              {reviews.length ? (
                reviews.map((review) => (
                  <article className="review-card" key={review.id}>
                    <div className="review-head">
                      <strong>{review.userName || "Guest User"}</strong>
                      <div className="review-chip-row">
                        <span className="status-pill status-open">Verified</span>
                        <span className="rating-pill">{review.rating}/5</span>
                      </div>
                    </div>
                    <p>{review.comment}</p>
                  </article>
                ))
              ) : (
                <div className="empty-state-panel">
                  <strong>No reviews yet</strong>
                  <p>Be the first guest to share a detailed experience for this restaurant.</p>
                </div>
              )}
            </div>
          </section>

          <section className="wide-card">
            <div className="panel-heading">
              <h2>Continue your journey</h2>
              <p>Move into reservation or ordering without leaving the restaurant flow.</p>
            </div>

            <div className="action-link-row">
              <Link className="primary-button inline-button" to="/my-reservations">
                View my reservations
              </Link>
              <Link className="secondary-button inline-button" to="/cart">
                Open cart
              </Link>
            </div>
          </section>
        </aside>
      </section>
    </RestaurantPageShell>
  );
}

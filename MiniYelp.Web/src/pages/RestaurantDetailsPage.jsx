import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { useAuth } from "../context/AuthContext";
import { getRestaurantById, getRestaurantMenu, getRestaurantReviews, createReview } from "../lib/restaurants";
import { useCart } from "../context/CartContext";
import "../home.css";
import "../restaurant.css";

const HeartIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
  </svg>
);

const StarIcon = ({ filled = true, onClick }) => (
  <svg 
    width="14" height="14" viewBox="0 0 24 24" 
    fill={filled ? "#FF8A00" : "none"} 
    stroke="#FF8A00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    onClick={onClick}
    style={{ cursor: onClick ? 'pointer' : 'default' }}
  >
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
  </svg>
);

export function RestaurantDetailsPage() {
  const { id } = useParams();
  const auth = useAuth();
  
  const [restaurant, setRestaurant] = useState(null);
  const [menu, setMenu] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [commentText, setCommentText] = useState("");
  const [rating, setRating] = useState(5);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState("");

  const cart = useCart();

  useEffect(() => {
    Promise.all([
      getRestaurantById(id),
      getRestaurantMenu(id).catch(() => []), // some might not have menus
      getRestaurantReviews(id).catch(() => [])
    ])
    .then(([restData, menuData, reviewsData]) => {
      setRestaurant(restData);
      setMenu(menuData);
      setReviews(reviewsData);
    })
    .catch(err => console.error(err))
    .finally(() => setLoading(false));
  }, [id]);

  const handlePostComment = async () => {
    if (!commentText.trim()) return;
    setIsSubmitting(true);
    try {
      const newReview = await createReview({
        restaurantId: Number(id),
        rating: rating,
        comment: commentText
      }, auth.token);
      setReviews([newReview, ...reviews]);
      setCommentText("");
      setRating(5);
    } catch (err) {
      console.error("Failed to post review", err);
      alert("Failed to post review. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddToCart = (item) => {
    if (!restaurant) return;

    cart.addItem({
      restaurantId: restaurant.id,
      restaurantName: restaurant.name,
      branchId: restaurant.branches?.[0]?.id,
      item: {
        id: item.id,
        name: item.name,
        description: item.description,
        price: item.price
      }
    });

    setSuccess(`${item.name} added to cart.`);
    setTimeout(() => setSuccess(""), 3000);
  };

  if (loading) return <div className="restaurant-page"><Navbar showSearch={false} /><p style={{textAlign:'center', marginTop:'4rem'}}>Loading...</p></div>;
  if (!restaurant) return <div className="restaurant-page"><Navbar showSearch={false} /><p style={{textAlign:'center', marginTop:'4rem'}}>Restaurant not found.</p></div>;

  const placeholders = [
    "https://images.unsplash.com/photo-1553909489-cd47ce56144e?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1576107232684-1279f390859f?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1619860860774-1e2e17343432?auto=format&fit=crop&w=400&q=80"
  ];

  const averageRating = reviews.length > 0 
    ? (reviews.reduce((acc, r) => acc + Number(r.rating || 0), 0) / reviews.length).toFixed(1)
    : "0.0";

  return (
    <div className="restaurant-page">
      <Navbar showSearch={false} />

      <section className="rest-hero" style={{ backgroundImage: `url('${restaurant?.imageUrl || 'https://images.unsplash.com/photo-1537047902294-62a40c20a6ae?auto=format&fit=crop&w=1400&q=80'}')` }}>
        <div className="rest-hero-content">
          <h1 style={{textShadow: '0 2px 4px rgba(0,0,0,0.5)'}}>{restaurant.name}</h1>
          <p style={{textShadow: '0 1px 2px rgba(0,0,0,0.5)'}}>{restaurant.description}</p>
          <button className="home-btn-primary">Learn More</button>
        </div>
      </section>

      <section className="rest-foods">
        <h2 className="rest-section-title">Explore Our Foods</h2>
        {success && <div style={{ color: 'green', textAlign: 'center', marginBottom: '1.5rem', fontWeight: '600' }}>{success}</div>}
        <div className="rest-grid">
          {menu.length > 0 ? menu.flatMap(section => section.items).filter(Boolean).map((item, index) => (
            <div className="rest-food-card" key={item.id}>
              <div className="rest-food-img-container">
                {!item.isAvailable && <span className="rest-food-badge sold-out">SOLD OUT</span>}
                <img 
                  src={item.imageUrl || placeholders[index % placeholders.length]} 
                  alt={item.name} 
                  className="rest-food-img" 
                  style={{ objectFit: 'cover', padding: 0 }} 
                />
              </div>
              <div className="rest-food-info">
                <div className="rest-food-header">
                  <h4 style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '140px' }}>{item.name}</h4>
                  <span style={{fontWeight:'bold', color:'#FF8A00'}}>{item.price?.toFixed(2)} EGP</span>
                </div>
                <p className="rest-food-desc" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', marginBottom: '1rem' }}>{item.description}</p>
                
                <button 
                  className="user-btn-primary" 
                  style={{ width: '100%', padding: '0.625rem', fontSize: '0.875rem' }}
                  disabled={!item.isAvailable}
                  onClick={() => handleAddToCart(item)}
                >
                  {item.isAvailable ? "Add to cart" : "Unavailable"}
                </button>
              </div>
            </div>
          )) : <p style={{gridColumn:'1/-1', textAlign:'center'}}>No menu items found.</p>}
        </div>
      </section>

      <section className="rest-achievements">
        <h2 className="rest-section-title">Our Achievements</h2>
        <div className="rest-stats-grid">
          <div className="rest-stat">
            <h3>+200</h3>
            <p>Customer Served</p>
          </div>
          <div className="rest-stat">
            <h3>50K</h3>
            <p>Donations</p>
          </div>
          <div className="rest-stat">
            <h3>370K</h3>
            <p>Deliveries</p>
          </div>
          <div className="rest-stat">
            <h3>100+</h3>
            <p>Recognition</p>
          </div>
        </div>
      </section>

      <section className="rest-comments-section">
        <h2 className="rest-section-title">Our Happy Customers Comments</h2>
        
        <div className="rest-rating-summary">
          <div className="rest-rating-score">
            <h2>{averageRating}</h2>
            <div className="rest-rating-stars">
              {[1,2,3,4,5].map(v => <StarIcon key={v} filled={v <= Math.round(averageRating)} />)}
            </div>
            <p>{reviews.length} Ratings</p>
          </div>
          <div className="rest-rating-bars">
            {[5, 4, 3, 2, 1].map(stars => {
              const count = reviews.filter(r => r.rating === stars).length;
              const pct = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
              return (
                <div className="rest-rating-bar-row" key={stars}>
                  <div className="rest-rating-bar-stars">
                    {Array(stars).fill(0).map((_, i) => <StarIcon key={i} />)}
                    {stars} Star Rating
                  </div>
                  <div className="rest-rating-bar-track">
                    <div className="rest-rating-bar-fill" style={{ width: `${pct}%` }}></div>
                  </div>
                  <div className="rest-rating-bar-pct">{Math.round(pct)}%</div>
                </div>
              );
            })}
          </div>
        </div>

        {auth.isAuthenticated && (
          <div className="rest-comment-input">
            <div className="rest-comment-input-top">
              <img src="https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&w=100&q=80" alt="Current User" className="rest-avatar" />
              <div className="rest-input-box" style={{ flexDirection: 'column', alignItems: 'flex-start', padding: '1rem', background: '#F7FAFC', borderRadius: '16px' }}>
                <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '0.5rem' }}>
                  {[1, 2, 3, 4, 5].map(v => (
                    <StarIcon 
                      key={v} 
                      filled={v <= rating} 
                      onClick={() => setRating(v)} 
                    />
                  ))}
                </div>
                <input 
                  type="text" 
                  placeholder="Add a comment..." 
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  style={{ width: '100%', border: 'none', background: 'transparent', outline: 'none' }}
                />
              </div>
              <button className="rest-post-btn" onClick={handlePostComment} disabled={isSubmitting}>
                {isSubmitting ? "..." : "Post"}
              </button>
            </div>
          </div>
        )}

        <div className="rest-feedback-header">
          <h3>Customer Feedback</h3>
        </div>

        <div className="rest-comments-list">
          {reviews.length > 0 ? reviews.map(comment => (
            <div className="rest-comment-item" key={comment.id}>
              <div className="rest-avatar" style={{background:'#E2E8F0', display:'flex', alignItems:'center', justifyContent:'center'}}>
                {comment.userName ? comment.userName.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="rest-comment-content">
                <div className="rest-comment-header">
                  <span className="rest-comment-name">{comment.userName || "Guest"}</span>
                </div>
                <div className="rest-comment-stars">
                  {[1,2,3,4,5].map(v => <StarIcon key={v} filled={v <= comment.rating} />)}
                </div>
                <p className="rest-comment-text">{comment.comment}</p>
              </div>
            </div>
          )) : <p>No reviews yet. Be the first to leave one!</p>}
        </div>
      </section>

      <Footer />
    </div>
  );
}

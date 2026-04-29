import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { useAuth } from "../context/AuthContext";
import { getCuisines, getRestaurants } from "../lib/restaurants";
import "../home.css";
import "../restaurants-list.css";

const priceOptions = [
  { value: "", label: "Any budget" },
  { value: "1", label: "Budget" },
  { value: "2", label: "Moderate" },
  { value: "3", label: "Expensive" },
  { value: "4", label: "Luxury" }
];

export function RestaurantsPage() {
  const auth = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [minRating, setMinRating] = useState("");
  const [sortBy, setSortBy] = useState("recommended");
  const [filters, setFilters] = useState({
    city: "",
    cuisineId: "",
    priceRange: ""
  });
  const [restaurants, setRestaurants] = useState([]);
  const [cuisines, setCuisines] = useState([]);
  const [loading, setLoading] = useState(true);

  async function loadRestaurants(nextFilters = {}) {
    setLoading(true);
    try {
      const response = await getRestaurants(nextFilters);
      setRestaurants(response);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    Promise.all([getRestaurants(), getCuisines()])
      .then(([restaurantsResponse, cuisinesResponse]) => {
        setRestaurants(restaurantsResponse);
        setCuisines(cuisinesResponse);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  async function handleSearch(event) {
    event.preventDefault();
    await loadRestaurants(filters);
  }

  if (!auth.isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }

  const visibleRestaurants = restaurants
    .filter((restaurant) => {
      if (!searchTerm.trim()) return true;
      const queryData = `${restaurant.name} ${restaurant.description} ${restaurant.cuisineName} ${restaurant.cities.join(" ")}`.toLowerCase();
      return queryData.includes(searchTerm.trim().toLowerCase());
    })
    .filter((restaurant) => {
      if (!minRating) return true;
      return Number(restaurant.averageRating || 0) >= Number(minRating);
    })
    .sort((left, right) => {
      if (sortBy === "rating") return Number(right.averageRating || 0) - Number(left.averageRating || 0);
      if (sortBy === "reviews") return Number(right.reviewsCount || 0) - Number(left.reviewsCount || 0);
      if (sortBy === "name") return left.name.localeCompare(right.name);
      return 0;
    });

  const placeholders = [
    "https://images.unsplash.com/photo-1553909489-cd47ce56144e?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1576107232684-1279f390859f?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1619860860774-1e2e17343432?auto=format&fit=crop&w=400&q=80"
  ];

  return (
    <div className="rest-list-page">
      <Navbar showSearch={false} />

      <div className="rest-list-container">
        {/* Sidebar */}
        <aside className="rest-list-sidebar">
          <h2>Filters</h2>
          <p>Refine your dining discovery.</p>
          
          <form onSubmit={handleSearch}>
            <div className="rest-filter-group">
              <label>City</label>
              <input
                className="rest-filter-input"
                type="text"
                value={filters.city}
                onChange={(e) => setFilters({ ...filters, city: e.target.value })}
                placeholder="e.g. Cairo"
              />
            </div>

            <div className="rest-filter-group">
              <label>Cuisine</label>
              <select
                className="rest-filter-select"
                value={filters.cuisineId}
                onChange={(e) => setFilters({ ...filters, cuisineId: e.target.value })}
              >
                <option value="">Any cuisine</option>
                {cuisines.map((cuisine) => (
                  <option key={cuisine.id} value={cuisine.id}>{cuisine.name}</option>
                ))}
              </select>
            </div>

            <div className="rest-filter-group">
              <label>Budget</label>
              <select
                className="rest-filter-select"
                value={filters.priceRange}
                onChange={(e) => setFilters({ ...filters, priceRange: e.target.value })}
              >
                {priceOptions.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>

            <div className="rest-filter-actions">
              <button type="submit" className="rest-filter-btn" disabled={loading}>
                {loading ? "Searching..." : "Apply Filters"}
              </button>
              <button 
                type="button" 
                className="rest-filter-reset"
                onClick={async () => {
                  setFilters({ city: "", cuisineId: "", priceRange: "" });
                  await loadRestaurants();
                }}
              >
                Reset
              </button>
            </div>
          </form>
        </aside>

        {/* Main Content */}
        <main className="rest-list-main">
          <div className="rest-list-header">
            <h1>Restaurants</h1>
            <p>{visibleRestaurants.length} places currently match your preferences.</p>
          </div>

          <div className="rest-toolbar">
            <div className="rest-quick-search">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#A0AEC0" strokeWidth="2">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <input
                type="text"
                placeholder="Quick search by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <select
              className="rest-toolbar-select"
              value={minRating}
              onChange={(e) => setMinRating(e.target.value)}
            >
              <option value="">Any rating</option>
              <option value="4.5">4.5+ Stars</option>
              <option value="4">4.0+ Stars</option>
              <option value="3.5">3.5+ Stars</option>
            </select>

            <select
              className="rest-toolbar-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="recommended">Recommended</option>
              <option value="rating">Top Rated</option>
              <option value="reviews">Most Reviewed</option>
              <option value="name">Name (A-Z)</option>
            </select>
          </div>

          {loading ? (
            <div className="rest-cards-grid">
              {[1, 2, 3, 4].map(n => (
                <div key={n} className="rest-card" style={{height: '400px', animation: 'pulse 1.5s infinite bg-gray-200'}}></div>
              ))}
            </div>
          ) : visibleRestaurants.length ? (
            <div className="rest-cards-grid">
              {visibleRestaurants.map((restaurant, idx) => (
                <div className="rest-card" key={restaurant.id}>
                  <div className="rest-card-img-wrap">
                    <span className="rest-card-badge">{restaurant.cuisineName || "New"}</span>
                    <span className="rest-card-rating">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="white" stroke="white" strokeWidth="2">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                      </svg>
                      {restaurant.averageRating || 0}
                    </span>
                    <img 
                      src={restaurant.imageUrl || placeholders[idx % placeholders.length]} 
                      alt={restaurant.name} 
                      className="rest-card-img" 
                    />
                  </div>
                  <div className="rest-card-content">
                    <h3 className="rest-card-title">{restaurant.name}</h3>
                    <p className="rest-card-desc">{restaurant.description || "Discover a world of flavors at this popular local dining spot."}</p>
                    <div className="rest-card-meta">
                      <span>{restaurant.reviewsCount} reviews</span>
                      <span>{restaurant.cities.join(", ") || "Multiple branches"}</span>
                    </div>
                    <div className="rest-card-actions">
                      <Link to={`/restaurants/${restaurant.id}/reserve`} className="rest-btn-secondary">Reserve</Link>
                      <Link to={`/restaurants/${restaurant.id}`} className="rest-btn-primary">View Details</Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{textAlign: 'center', padding: '4rem', background: 'white', borderRadius: '24px'}}>
              <h3 style={{fontFamily: 'Playfair Display', fontSize: '1.5rem', marginBottom: '1rem'}}>No restaurants found</h3>
              <p style={{color: '#718096'}}>Try adjusting your filters or search terms.</p>
            </div>
          )}
        </main>
      </div>

      <Footer />
    </div>
  );
}

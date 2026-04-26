import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { AppShell } from "../components/AppShell";
import { FormField } from "../components/FormField";
import { StatusMessage } from "../components/StatusMessage";
import { useAuth } from "../context/AuthContext";
import { getCuisines, getRestaurants } from "../lib/restaurants";

const priceOptions = [
  { value: "", label: "Any budget" },
  { value: "1", label: "Budget" },
  { value: "2", label: "Moderate" },
  { value: "3", label: "Expensive" },
  { value: "4", label: "Luxury" }
];

const quickFilterPresets = [
  { label: "Top rated", city: "", priceRange: "", cuisineId: "" },
  { label: "Cairo picks", city: "Cairo", priceRange: "", cuisineId: "" },
  { label: "Budget friendly", city: "", priceRange: "1", cuisineId: "" },
  { label: "Luxury nights", city: "", priceRange: "4", cuisineId: "" }
];

export function RestaurantsPage() {
  const auth = useAuth();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
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
  const [error, setError] = useState("");

  async function loadRestaurants(nextFilters = {}) {
    setLoading(true);
    setError("");

    try {
      const response = await getRestaurants(nextFilters);
      setRestaurants(response);
    } catch (err) {
      setError(err.message);
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
      .catch((err) => setError(err.message))
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
      if (!searchTerm.trim()) {
        return true;
      }

      const queryData =
        `${restaurant.name} ${restaurant.description} ${restaurant.cuisineName} ${restaurant.cities.join(" ")}`
          .toLowerCase();
      return queryData.includes(searchTerm.trim().toLowerCase());
    })
    .filter((restaurant) => {
      if (!minRating) {
        return true;
      }

      return Number(restaurant.averageRating || 0) >= Number(minRating);
    })
    .sort((left, right) => {
      if (sortBy === "rating") {
        return Number(right.averageRating || 0) - Number(left.averageRating || 0);
      }

      if (sortBy === "reviews") {
        return Number(right.reviewsCount || 0) - Number(left.reviewsCount || 0);
      }

      if (sortBy === "name") {
        return left.name.localeCompare(right.name);
      }

      return 0;
    });

  const activeFilterCount =
    Number(Boolean(filters.city)) +
    Number(Boolean(filters.cuisineId)) +
    Number(Boolean(filters.priceRange)) +
    Number(Boolean(searchTerm.trim())) +
    Number(Boolean(minRating));

  return (
    <AppShell
      title="Find a restaurant that fits the mood."
      subtitle="Browse by city, cuisine, and budget, then open any restaurant to read reviews and create a reservation."
      accent="warm"
    >
      <section className="restaurants-layout">
        <section className="filter-dropdown-card">
          <button
            aria-expanded={isFilterOpen}
            className="filter-dropdown-trigger"
            type="button"
            onClick={() => setIsFilterOpen((current) => !current)}
          >
            <div>
              <span className="hero-eyebrow">Restaurant filters</span>
              <strong>City, cuisine, and budget</strong>
            </div>
            <span className={`filter-chevron ${isFilterOpen ? "is-open" : ""}`}>v</span>
          </button>

          {isFilterOpen ? (
            <form className="filter-dropdown-panel stack-form" onSubmit={handleSearch}>
              <div className="panel-heading">
                <h2>Filters</h2>
                <p>Refine the restaurant discovery experience.</p>
              </div>

              <div className="filter-dropdown-grid">
                <FormField
                  label="City"
                  name="city"
                  value={filters.city}
                  onChange={(e) => setFilters({ ...filters, city: e.target.value })}
                  placeholder="Cairo"
                  required={false}
                />

                <label className="form-field">
                  <span>Cuisine</span>
                  <select
                    className="app-select"
                    value={filters.cuisineId}
                    onChange={(e) => setFilters({ ...filters, cuisineId: e.target.value })}
                  >
                    <option value="">Any cuisine</option>
                    {cuisines.map((cuisine) => (
                      <option key={cuisine.id} value={cuisine.id}>
                        {cuisine.name}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="form-field">
                  <span>Budget</span>
                  <select
                    className="app-select"
                    value={filters.priceRange}
                    onChange={(e) => setFilters({ ...filters, priceRange: e.target.value })}
                  >
                    {priceOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="filter-dropdown-actions">
                <button className="primary-button" disabled={loading} type="submit">
                  {loading ? "Searching..." : "Apply filters"}
                </button>
                <button
                  className="secondary-button"
                  type="button"
                  onClick={async () => {
                    const emptyFilters = { city: "", cuisineId: "", priceRange: "" };
                    setFilters(emptyFilters);
                    setIsFilterOpen(false);
                    await loadRestaurants();
                  }}
                >
                  Reset filters
                </button>
              </div>
            </form>
          ) : null}
        </section>

        <section className="results-panel">
          <div className="results-header">
            <div className="panel-heading">
              <h2>Restaurants</h2>
              <p>{visibleRestaurants.length} places currently match your filters.</p>
            </div>
            <div className="results-chip-row">
              <button
                className="secondary-button filter-chip-button"
                type="button"
                onClick={() => setIsFilterOpen((current) => !current)}
              >
                Filters
              </button>
              <span className="result-chip">Live data</span>
              <span className="result-chip">Reviews attached</span>
              <span className="result-chip">Reservation ready</span>
              {activeFilterCount ? <span className="result-chip">{activeFilterCount} filters active</span> : null}
            </div>
          </div>

          <div className="listing-toolbar">
            <div className="preset-chip-row">
              {quickFilterPresets.map((preset) => (
                <button
                  className="result-chip preset-chip"
                  key={preset.label}
                  type="button"
                  onClick={async () => {
                    const nextFilters = {
                      city: preset.city,
                      cuisineId: preset.cuisineId,
                      priceRange: preset.priceRange
                    };
                    setFilters(nextFilters);
                    await loadRestaurants(nextFilters);
                  }}
                >
                  {preset.label}
                </button>
              ))}
            </div>

            <label className="form-field listing-inline-input">
              <span>Quick search</span>
              <input
                name="searchTerm"
                placeholder="Search by restaurant, cuisine, city..."
                type="text"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />
            </label>
            <label className="form-field listing-inline-input">
              <span>Minimum rating</span>
              <select
                className="app-select"
                value={minRating}
                onChange={(event) => setMinRating(event.target.value)}
              >
                <option value="">Any rating</option>
                <option value="4.5">4.5+</option>
                <option value="4">4.0+</option>
                <option value="3.5">3.5+</option>
              </select>
            </label>
            <label className="form-field listing-inline-input">
              <span>Sort</span>
              <select
                className="app-select"
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value)}
              >
                <option value="recommended">Recommended</option>
                <option value="rating">Top rated</option>
                <option value="reviews">Most reviewed</option>
                <option value="name">Name A-Z</option>
              </select>
            </label>
            <button
              className="secondary-button filter-chip-button"
              type="button"
              onClick={async () => {
                setSearchTerm("");
                setMinRating("");
                setSortBy("recommended");
                const emptyFilters = { city: "", cuisineId: "", priceRange: "" };
                setFilters(emptyFilters);
                await loadRestaurants();
              }}
            >
              Clear all
            </button>
          </div>

          <StatusMessage type="error">{error}</StatusMessage>

          {loading ? (
            <div className="restaurant-grid">
              {Array.from({ length: 4 }).map((_, index) => (
                <article className="restaurant-card skeleton-card" key={index} />
              ))}
            </div>
          ) : visibleRestaurants.length ? (
            <div className="restaurant-grid">
              {visibleRestaurants.map((restaurant) => (
                <article className="restaurant-card" key={restaurant.id}>
                  <div className="restaurant-card-cover" />
                  <div className="restaurant-card-top">
                    <span className="restaurant-tag">{restaurant.cuisineName}</span>
                    <span className="rating-pill">{restaurant.averageRating || 0} / 5</span>
                  </div>
                  <h3>{restaurant.name}</h3>
                  <p>{restaurant.description}</p>

                  <div className="restaurant-meta">
                    <span>{restaurant.reviewsCount} reviews</span>
                    <span>{restaurant.cities.join(", ") || "Multiple branches"}</span>
                  </div>

                  <div className="restaurant-signal-row">
                    <span className="signal-dot">Verified reviews</span>
                    <span className="signal-dot">Live booking</span>
                    <span className="signal-dot">Online ordering</span>
                  </div>

                  <div className="restaurant-card-footer">
                    <span className="budget-pill">Budget level {restaurant.priceRange}</span>
                    <div className="card-actions">
                      <Link className="secondary-button inline-button compact-button" to={`/restaurants/${restaurant.id}/reserve`}>
                        Reserve
                      </Link>
                      <Link className="secondary-button inline-button compact-button" to={`/restaurants/${restaurant.id}/menu`}>
                        Menu
                      </Link>
                      <Link className="primary-button inline-button compact-button" to={`/restaurants/${restaurant.id}`}>
                        View details
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="empty-state-panel">
              <strong>No restaurants found</strong>
              <p>Try changing search text, rating, or filters to widen the result set.</p>
            </div>
          )}
        </section>
      </section>
    </AppShell>
  );
}

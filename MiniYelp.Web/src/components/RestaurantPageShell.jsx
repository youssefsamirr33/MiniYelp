import { Link, NavLink, Navigate } from "react-router-dom";
import { AppShell } from "./AppShell";
import { StatusMessage } from "./StatusMessage";
import { useAuth } from "../context/AuthContext";

export function RestaurantPageShell({
  restaurant,
  loading,
  error,
  success,
  accent = "editorial",
  children
}) {
  const auth = useAuth();

  if (!auth.isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }

  return (
    <AppShell
      title={restaurant?.name || "Restaurant details"}
      subtitle={
        restaurant
          ? `${restaurant.cuisine.name} cuisine, ${restaurant.branches.length} branch(es), and a complete guest journey.`
          : "Loading restaurant details..."
      }
      accent={accent}
      actions={<Link className="secondary-button" to="/restaurants">Back to restaurants</Link>}
    >
      <StatusMessage type="error">{error}</StatusMessage>
      <StatusMessage type="success">{success}</StatusMessage>

      {loading || !restaurant ? (
        <section className="wide-card">
          <p>Loading restaurant details...</p>
        </section>
      ) : (
        <>
          <section className="wide-card restaurant-hero-card">
            <div className="restaurant-story-cover" />
            <div className="story-topline">
              <span className="restaurant-tag">{restaurant.cuisine.name}</span>
              <span className={`status-pill ${restaurant.isActive ? "status-open" : "status-muted"}`}>
                {restaurant.isActive ? "Open for reservations" : "Inactive"}
              </span>
            </div>

            <h2>{restaurant.name}</h2>
            <p>{restaurant.description}</p>

            <div className="dashboard-grid compact-grid">
              <article>
                <span>Average rating</span>
                <strong>{restaurant.averageRating || 0}</strong>
              </article>
              <article>
                <span>Reviews</span>
                <strong>{restaurant.reviewsCount}</strong>
              </article>
              <article>
                <span>Price range</span>
                <strong>{restaurant.priceRange}</strong>
              </article>
              <article>
                <span>Branches</span>
                <strong>{restaurant.branches.length}</strong>
              </article>
            </div>
          </section>

          <nav className="restaurant-subnav">
            <NavLink end to={`/restaurants/${restaurant.id}`}>
              Details
            </NavLink>
            <NavLink to={`/restaurants/${restaurant.id}/menu`}>Menu</NavLink>
            <NavLink to={`/restaurants/${restaurant.id}/reserve`}>Reserve</NavLink>
          </nav>

          {children}
        </>
      )}
    </AppShell>
  );
}

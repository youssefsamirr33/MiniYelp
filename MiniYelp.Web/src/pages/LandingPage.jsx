import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function LandingPage() {
  const auth = useAuth();

  return (
    <main className="landing-shell">
      <header className="landing-nav">
        <Link className="brand-link" to="/">
          mini Yelp
        </Link>

        <nav className="landing-links">
          <Link to="/restaurants">Restaurants</Link>
          <Link to="/my-reservations">Reservations</Link>
          <Link to="/my-orders">Orders</Link>
        </nav>

        <div className="landing-actions">
          {auth.isAuthenticated ? (
            <Link className="secondary-button" to="/restaurants">
              Explore now
            </Link>
          ) : (
            <>
              <Link className="text-link" to="/auth/login">
                Login
              </Link>
              <Link className="primary-button inline-button" to="/auth/register">
                Join mini Yelp
              </Link>
            </>
          )}
        </div>
      </header>

      <section className="landing-hero">
        <div className="landing-copy">
          <p className="hero-eyebrow">Restaurant Discovery, Booking, Reviews, and Ordering</p>
          <h1>One place to discover where to eat, what to order, and whether it is worth it.</h1>
          <p>
            mini Yelp helps guests browse real restaurants, read detailed reviews, reserve tables,
            and place food orders, while giving restaurant owners clear customer feedback to improve
            service quality.
          </p>

          <div className="landing-cta-row">
            <Link className="primary-button inline-button" to="/restaurants">
              Browse restaurants
            </Link>
            {!auth.isAuthenticated ? (
              <Link className="secondary-button inline-button" to="/auth/login">
                Sign in to book
              </Link>
            ) : null}
          </div>

          <div className="landing-search-card">
            <div className="landing-search-grid">
              <label className="search-pill">
                <span>Location</span>
                <strong>Cairo, Egypt</strong>
              </label>
              <label className="search-pill">
                <span>Cuisine</span>
                <strong>Italian, Grill, Sushi</strong>
              </label>
              <label className="search-pill">
                <span>Experience</span>
                <strong>Reserve or order online</strong>
              </label>
            </div>
            <Link className="primary-button inline-button" to="/restaurants">
              Start exploring
            </Link>
          </div>

          <div className="landing-proof-strip">
            <div>
              <strong>Real reviews</strong>
              <span>Read detailed customer feedback before you reserve.</span>
            </div>
            <div>
              <strong>Online ordering</strong>
              <span>Build a cart and place food orders without leaving the app.</span>
            </div>
            <div>
              <strong>Branch-aware booking</strong>
              <span>Choose the exact branch, date, and party size with less friction.</span>
            </div>
          </div>
        </div>

        <div className="landing-showcase">
          <div className="showcase-main-card">
            <span className="restaurant-tag">Live customer journey</span>
            <strong>Book tables, read reviews, order food.</strong>
            <p>
              Built around the real flow a customer wants before choosing a restaurant.
            </p>
          </div>
          <div className="landing-metric-row">
            <article>
              <strong>4.9/5</strong>
              <span>Guest satisfaction signal</span>
            </article>
            <article>
              <strong>Live</strong>
              <span>Reservation and menu flows</span>
            </article>
          </div>
          <div className="showcase-grid">
            <article>
              <span>Restaurants</span>
              <strong>Browse by cuisine, city, and budget.</strong>
            </article>
            <article>
              <span>Reservations</span>
              <strong>Choose a branch, date, time, and party size.</strong>
            </article>
            <article>
              <span>Reviews</span>
              <strong>See authentic guest feedback before booking.</strong>
            </article>
            <article>
              <span>Online ordering</span>
              <strong>Add menu items to cart and submit orders.</strong>
            </article>
          </div>
        </div>
      </section>

      <section className="landing-feature-grid">
        <article className="wide-card">
          <h2>For customers</h2>
          <p>
            Discover better restaurants faster with structured information, branch data,
            reservations, and reviews in one clean flow.
          </p>
        </article>
        <article className="wide-card">
          <h2>For restaurants</h2>
          <p>
            Capture what guests actually think, spot service issues, and improve the dining
            experience based on real feedback.
          </p>
        </article>
        <article className="wide-card">
          <h2>For the product</h2>
          <p>
            mini Yelp combines discovery, trust, and action. Users do not just browse, they
            complete the whole journey.
          </p>
        </article>
      </section>

      <section className="landing-feature-grid">
        <article className="wide-card">
          <h2>Popular categories</h2>
          <div className="results-chip-row">
            <span className="result-chip">Fast Food</span>
            <span className="result-chip">Italian</span>
            <span className="result-chip">Seafood</span>
            <span className="result-chip">Grill</span>
            <span className="result-chip">Desserts</span>
          </div>
        </article>
        <article className="wide-card">
          <h2>Featured restaurants</h2>
          <p>Rotating picks with high ratings and recent verified reviews.</p>
          <div className="results-chip-row">
            <span className="result-chip">4.8+ Rated</span>
            <span className="result-chip">Top booking spots</span>
            <span className="result-chip">Order in 35 min</span>
          </div>
        </article>
        <article className="wide-card">
          <h2>Why users trust mini Yelp</h2>
          <p>Verified visits, detailed feedback, and transparent restaurant data before deciding.</p>
        </article>
      </section>

      <section className="landing-journey-grid">
        <article className="wide-card journey-card">
          <span className="hero-eyebrow">Step 01</span>
          <h2>Search with confidence</h2>
          <p>Use cuisine, city, and budget cues to reduce noise and find better-fit restaurants faster.</p>
        </article>
        <article className="wide-card journey-card">
          <span className="hero-eyebrow">Step 02</span>
          <h2>Compare trust signals</h2>
          <p>See ratings, review count, branches, and menu highlights before you commit to a reservation.</p>
        </article>
        <article className="wide-card journey-card">
          <span className="hero-eyebrow">Step 03</span>
          <h2>Take action quickly</h2>
          <p>Reserve a table, order online, and come back later to leave helpful feedback.</p>
        </article>
      </section>

      <section className="landing-bottom-band">
        <div className="landing-bottom-copy">
          <p className="hero-eyebrow">Modern hospitality UX</p>
          <h2>A restaurant product should feel trustworthy, fast, and delicious.</h2>
          <p>
            Better hierarchy, better flow, and better content framing make users more likely to
            explore, reserve, and order with confidence.
          </p>
        </div>
      </section>
    </main>
  );
}

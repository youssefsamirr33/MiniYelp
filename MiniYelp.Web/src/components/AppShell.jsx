import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

function HomeIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d="M3 10.75 12 3l9 7.75" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
      <path d="M6.75 9.75V21h10.5V9.75" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <circle cx="11" cy="11" r="6.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <path d="m16 16 4.5 4.5" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <rect x="4" y="5" width="16" height="15" rx="2.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <path d="M8 3.5V7M16 3.5V7M4 9.5h16" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
    </svg>
  );
}

function ReceiptIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d="M7 3.5h10v17l-2.3-1.4L12 20.5l-2.7-1.4L7 20.5Z" fill="none" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.8" />
      <path d="M9.5 8h5M9.5 11.5h5M9.5 15h3.5" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
    </svg>
  );
}

function CartIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <circle cx="9" cy="19" r="1.6" fill="currentColor" />
      <circle cx="17" cy="19" r="1.6" fill="currentColor" />
      <path d="M4 5h2l1.7 8.2a1 1 0 0 0 1 .8h8.7a1 1 0 0 0 1-.8L20 8H7.2" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d="M10 4.5H7A2.5 2.5 0 0 0 4.5 7v10A2.5 2.5 0 0 0 7 19.5h3" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
      <path d="M13 8.5 17 12l-4 3.5M9 12h8" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
    </svg>
  );
}

export function AppShell({ title, subtitle, actions, children, accent = "default" }) {
  const auth = useAuth();
  const cart = useCart();

  return (
    <main className="app-shell">
      <header className="app-topbar">
        <Link className="brand-link" to="/">
          <span className="brand-mark">m</span>
          <span className="brand-copy">
            <strong>mini Yelp</strong>
            <small>Dining discovery</small>
          </span>
        </Link>

        <div className="app-nav-wrap">
          <nav className="app-nav">
            <NavLink to="/">
              <HomeIcon />
              <span>Home</span>
            </NavLink>
            <NavLink to="/restaurants">
              <SearchIcon />
              <span>Restaurants</span>
            </NavLink>
            <NavLink to="/my-reservations">
              <CalendarIcon />
              <span>Reservations</span>
            </NavLink>
            <NavLink to="/my-orders">
              <ReceiptIcon />
              <span>Orders</span>
            </NavLink>
            <NavLink className="cart-nav-link" to="/cart">
              <CartIcon />
              <span>Cart</span>
              <strong className="nav-count">{cart.itemCount}</strong>
            </NavLink>
          </nav>
        </div>

        <div className="app-userbar">
          <div className="user-summary">
            <span className="user-avatar">
              {(auth.user?.fullName || "Guest").slice(0, 1).toUpperCase()}
            </span>
            <div>
              <strong>{auth.user?.fullName || "Guest"}</strong>
              <small>{auth.user?.roles?.join(", ") || "Customer"}</small>
            </div>
          </div>
          <button
            aria-label="Log out"
            className="logout-button logout-icon-only"
            title="Log out"
            onClick={auth.logout}
            type="button"
          >
            <LogoutIcon />
          </button>
        </div>
      </header>

      {(title || subtitle || actions) ? (
        <section className="app-pagehead">
          <div className="app-pagehead-copy">
            {title ? <h1>{title}</h1> : null}
            {subtitle ? <p>{subtitle}</p> : null}
          </div>
          {actions ? <div className="app-pagehead-actions">{actions}</div> : null}
        </section>
      ) : null}

      {children}
    </main>
  );
}

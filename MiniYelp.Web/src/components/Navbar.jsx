import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const PinIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
    <circle cx="12" cy="10" r="3"></circle>
  </svg>
);

const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#A0AEC0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"></circle>
    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
  </svg>
);

const FilterIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="4" y1="21" x2="4" y2="14"></line>
    <line x1="4" y1="10" x2="4" y2="3"></line>
    <line x1="12" y1="21" x2="12" y2="12"></line>
    <line x1="12" y1="8" x2="12" y2="3"></line>
    <line x1="20" y1="21" x2="20" y2="16"></line>
    <line x1="20" y1="12" x2="20" y2="3"></line>
    <line x1="1" y1="14" x2="7" y2="14"></line>
    <line x1="9" y1="8" x2="15" y2="8"></line>
    <line x1="17" y1="16" x2="23" y2="16"></line>
  </svg>
);

const CartIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9" cy="21" r="1"></circle>
    <circle cx="20" cy="21" r="1"></circle>
    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
  </svg>
);

const LogoutIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
    <polyline points="16 17 21 12 16 7"></polyline>
    <line x1="21" y1="12" x2="9" y2="12"></line>
  </svg>
);

export function Navbar({ showSearch = true }) {
  const auth = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    auth.logout();
    navigate("/");
  };

  return (
    <nav className="home-nav-wrapper">
      <div className="home-nav-top">
        <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-start' }}>
          <Link className="home-brand" to="/">
            <div className="home-brand-logo">
              <PinIcon />
            </div>
            <div className="home-brand-text">Mini<span>Yelp</span></div>
          </Link>
        </div>

        <div className="home-links">
          <NavLink to="/" end>Home</NavLink>
          <NavLink to="/restaurants">Restaurant</NavLink>
          <NavLink to="/my-reservations">Reservation</NavLink>
          <NavLink to="/my-orders">Orders</NavLink>
        </div>

        <div className="home-actions" style={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>
          {auth.isAuthenticated ? (
            <>
              <Link to="/cart" className="home-icon-btn" title="Cart">
                <CartIcon />
              </Link>
              <button onClick={handleLogout} className="home-icon-btn" title="Logout">
                <LogoutIcon />
              </button>
            </>
          ) : (
            <Link to="/auth/login" className="home-btn-primary">Login</Link>
          )}
        </div>
      </div>
      
      {showSearch && (
        <div className="home-nav-bottom">
          <div className="home-search-bar">
            <SearchIcon />
            <input type="text" placeholder="Search..." />
            <button className="home-search-btn">
              <FilterIcon />
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}

import { Link } from "react-router-dom";

const PinIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
    <circle cx="12" cy="10" r="3"></circle>
  </svg>
);

export function Footer() {
  return (
    <footer className="home-footer">
      <div className="home-footer-grid">
        <div>
          <Link className="home-brand" to="/">
            <div className="home-brand-logo">
              <PinIcon />
            </div>
            <div className="home-brand-text">Mini<span>Yelp</span></div>
          </Link>
          <p className="home-footer-brand-desc">
            Mini Yelp is an online discovery system, helping users find exactly what they are looking for efficiently.
          </p>
          <div className="home-footer-socials">
            <a href="#">f</a>
            <a href="#">in</a>
            <a href="#">t</a>
            <a href="#">y</a>
          </div>
        </div>
        
        <div className="home-footer-links">
          <h4>Company</h4>
          <ul>
            <li><Link to="#">About us</Link></li>
          </ul>
        </div>

        <div className="home-footer-links">
          <h4>Developers</h4>
          <ul>
            <li><Link to="#">React Technologies</Link></li>
          </ul>
        </div>
      </div>

      <div className="home-footer-bottom">
        <h2>Welcome to Our<br/>Restaurant</h2>
      </div>

      <div className="home-chat-widget">
        <div className="home-chat-header">
          <div className="home-chat-header-avatar"></div>
          <div className="home-chat-header-info">
            <h4>Chat with Assistant</h4>
            <p>We typically reply in 5 mins</p>
          </div>
        </div>
        <div className="home-chat-body">
          <div className="home-chat-bubble" style={{ alignSelf: 'flex-start', background: '#F7FAFC' }}>
            Hello! 👋 Are you looking for a particular restaurant?
          </div>
          <div className="home-chat-chips">
            <span className="home-chat-chip">Italian</span>
            <span className="home-chat-chip">Seafood</span>
            <span className="home-chat-chip">Dessert</span>
          </div>
          <div className="home-chat-bubble" style={{ marginLeft: 'auto', background: '#FF8A00', color: 'white' }}>
            Just got a reservation!
          </div>
        </div>
        <div className="home-chat-input">
          <input type="text" placeholder="Type a message..." />
          <button>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </button>
        </div>
      </div>
    </footer>
  );
}

import { Link } from "react-router-dom";
import "../auth.css";

export function AuthLayout({ 
  title, 
  subtitle, 
  children, 
  imageSrc, 
  imageAlt = "Authentication Background",
  imagePosition = "right" // "left" or "right"
}) {
  return (
    <div className="auth-modern-page">
      <div className={`auth-modern-container ${imagePosition === 'left' ? 'image-left' : ''}`}>
        
        <div className="auth-modern-form-wrapper">
          <Link className="auth-modern-brand" to="/">
            <div className="auth-modern-brand-logo">
              {/* Simple map pin icon placeholder */}
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
            </div>
            <div className="auth-modern-brand-text">Mini<span>Yelp</span></div>
          </Link>

          <div className="auth-modern-header">
            <h1>{title}</h1>
            <p>{subtitle}</p>
          </div>

          <div className="auth-modern-form">
            {children}
          </div>
        </div>

        <div className="auth-modern-image-wrapper">
          <img src={imageSrc} alt={imageAlt} />
        </div>

      </div>
    </div>
  );
}

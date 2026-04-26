import { Link } from "react-router-dom";

export function AuthLayout({ eyebrow, title, subtitle, children, footer, highlights = [] }) {
  return (
    <div className="auth-shell auth-shell-modern">
      <section className="auth-side-panel">
        <div className="auth-side-content">
          <Link className="brand-link auth-brand-link" to="/">
            <span className="brand-mark">m</span>
            <span className="brand-copy">
              <strong>mini Yelp</strong>
              <small>Dining discovery</small>
            </span>
          </Link>

          <div className="auth-side-copy">
            <p className="hero-eyebrow">{eyebrow}</p>
            <h1>{title}</h1>
            <p>{subtitle}</p>
          </div>

          <div className="auth-side-list">
            {highlights.map((item) => (
              <article className="auth-side-item" key={item}>
                <span className="auth-side-bullet" />
                <p>{item}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="auth-panel auth-panel-full auth-panel-modern">
        <div className="auth-panel-inner auth-panel-modern-inner">
          <div className="auth-panel-header">
            <div className="auth-copy-block">
              <h1 className="auth-page-title">Welcome</h1>
              <p className="auth-page-subtitle">Simple, secure access to your account.</p>
            </div>
          </div>

          {children}
          {footer ? <div className="auth-footer">{footer}</div> : null}
        </div>
      </section>
    </div>
  );
}

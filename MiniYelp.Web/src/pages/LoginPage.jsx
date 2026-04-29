import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthLayout } from "../components/AuthLayout";
import { StatusMessage } from "../components/StatusMessage";
import { useAuth } from "../context/AuthContext";

// Icons for social buttons and password toggle
const EyeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
    <circle cx="12" cy="12" r="3"></circle>
  </svg>
);

const FacebookIcon = () => (
  <svg className="auth-modern-social-icon" viewBox="0 0 24 24" fill="#1877F2">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

const GoogleIcon = () => (
  <svg className="auth-modern-social-icon" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

export function LoginPage() {
  const auth = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    if (!form.email || !form.password) return;

    setLoading(true);
    setError("");

    try {
      await auth.login(form);
      navigate("/restaurants");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      title="Login"
      subtitle="Login to access your mini Yelp account"
      imageSrc="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80"
      imagePosition="right"
    >
      <form onSubmit={handleSubmit} className="auth-modern-form">
        {error && <StatusMessage type="error">{error}</StatusMessage>}

        <div className="auth-modern-field">
          <label className="auth-modern-label">Email</label>
          <input
            type="email"
            required
            className="auth-modern-input"
            placeholder="john.doe@gmail.com"
            value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })}
          />
        </div>

        <div className="auth-modern-field">
          <label className="auth-modern-label">Password</label>
          <div className="auth-modern-input-wrapper">
            <input
              type={showPassword ? "text" : "password"}
              required
              className="auth-modern-input"
              placeholder="••••••••••••••••"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
            />
            <button
              type="button"
              className="auth-modern-password-toggle"
              onClick={() => setShowPassword(!showPassword)}
            >
              <EyeIcon />
            </button>
          </div>
        </div>

        <div className="auth-modern-options">
          <label className="auth-modern-checkbox">
            <input type="checkbox" />
            <span>Remember me</span>
          </label>
          <Link to="/auth/forgot-password" className="auth-modern-link">
            Forgot Password
          </Link>
        </div>

        <button type="submit" disabled={loading} className="auth-modern-button">
          {loading ? "Logging in..." : "Login"}
        </button>

        <div className="auth-modern-footer">
          Don't have an account? <Link to="/auth/register" className="auth-modern-link">Sign up</Link>
        </div>

        <div className="auth-modern-divider">
          Or login with
        </div>

        <div className="auth-modern-social">
          <button type="button" className="auth-modern-social-btn">
            <FacebookIcon />
          </button>
          <button type="button" className="auth-modern-social-btn">
            <GoogleIcon />
          </button>
        </div>
      </form>
    </AuthLayout>
  );
}

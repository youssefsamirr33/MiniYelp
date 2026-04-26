import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthLayout } from "../components/AuthLayout";
import { FormField } from "../components/FormField";
import { StatusMessage } from "../components/StatusMessage";
import { useAuth } from "../context/AuthContext";

export function LoginPage() {
  const auth = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [fieldErrors, setFieldErrors] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  function validateForm() {
    const nextErrors = { email: "", password: "" };

    if (!form.email.trim()) {
      nextErrors.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      nextErrors.email = "Enter a valid email address.";
    }

    if (!form.password) {
      nextErrors.password = "Password is required.";
    } else if (form.password.length < 6) {
      nextErrors.password = "Password must be at least 6 characters.";
    }

    setFieldErrors(nextErrors);
    return !nextErrors.email && !nextErrors.password;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!validateForm()) {
      return;
    }

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
      eyebrow="Welcome back"
      title="Sign in to your account."
      subtitle="Check your bookings, orders, and reviews in one place."
      highlights={[
        "Book tables in a few clicks",
        "Track orders and reservation status",
        "Read and write trusted reviews"
      ]}
      footer={
        <>
          Don&apos;t have an account? <Link to="/auth/register">Create one</Link>
        </>
      }
    >
      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="panel-heading">
          <h2>Login</h2>
          <p>Enter your email and password.</p>
        </div>

        <StatusMessage type="error">{error}</StatusMessage>

        <FormField
          label="Email"
          name="email"
          type="email"
          value={form.email}
          onChange={(e) => {
            setForm({ ...form, email: e.target.value });
            if (fieldErrors.email) {
              setFieldErrors((current) => ({ ...current, email: "" }));
            }
          }}
          placeholder="customer@miniyelp.local"
          error={fieldErrors.email}
        />

        <FormField
          label="Password"
          name="password"
          type={showPassword ? "text" : "password"}
          value={form.password}
          onChange={(e) => {
            setForm({ ...form, password: e.target.value });
            if (fieldErrors.password) {
              setFieldErrors((current) => ({ ...current, password: "" }));
            }
          }}
          placeholder="Enter your password"
          error={fieldErrors.password}
        />

        <div className="auth-inline-row">
          <label className="auth-checkbox-row">
            <input type="checkbox" />
            <span>Remember me</span>
          </label>
          <button
            className="auth-inline-link"
            type="button"
            onClick={() => setShowPassword((current) => !current)}
          >
            {showPassword ? "Hide password" : "Show password"}
          </button>
        </div>

        <button className="primary-button" disabled={loading} type="submit">
          {loading ? "Signing in..." : "Sign in"}
        </button>

        <div className="auth-help-row">
          <Link className="text-link" to="/auth/forgot-password">
            Forgot your password?
          </Link>
          <span>Secure sign-in with encrypted credentials.</span>
        </div>

        <section className="auth-trust-block">
          <strong>After login you can:</strong>
          <p>Manage reservations, track orders, and write reviews.</p>
          <div className="auth-inline-badges">
            <span>Reservations</span>
            <span>Orders</span>
            <span>Reviews</span>
          </div>
        </section>
      </form>
    </AuthLayout>
  );
}

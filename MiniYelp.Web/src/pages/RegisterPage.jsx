import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthLayout } from "../components/AuthLayout";
import { FormField } from "../components/FormField";
import { StatusMessage } from "../components/StatusMessage";
import { useAuth } from "../context/AuthContext";

export function RegisterPage() {
  const auth = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [fieldErrors, setFieldErrors] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const passwordScore = [
    form.password.length >= 8,
    /[A-Z]/.test(form.password),
    /[0-9]/.test(form.password),
    /[^A-Za-z0-9]/.test(form.password)
  ].filter(Boolean).length;

  const passwordStrengthLabel =
    passwordScore <= 1 ? "Weak" : passwordScore <= 3 ? "Medium" : "Strong";

  function validateForm() {
    const nextErrors = {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: ""
    };

    if (!form.fullName.trim()) {
      nextErrors.fullName = "Full name is required.";
    }

    if (!form.email.trim()) {
      nextErrors.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      nextErrors.email = "Enter a valid email address.";
    }

    if (!form.password) {
      nextErrors.password = "Password is required.";
    } else if (form.password.length < 8) {
      nextErrors.password = "Use at least 8 characters.";
    }

    if (!form.confirmPassword) {
      nextErrors.confirmPassword = "Please confirm your password.";
    } else if (form.confirmPassword !== form.password) {
      nextErrors.confirmPassword = "Passwords do not match.";
    }

    setFieldErrors(nextErrors);
    return !Object.values(nextErrors).some(Boolean);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      await auth.register({
        fullName: form.fullName,
        email: form.email,
        password: form.password
      });
      navigate("/restaurants");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      eyebrow="Create account"
      title="Create your account."
      subtitle="Join mini Yelp to book tables, order food, and share reviews."
      highlights={[
        "Discover restaurants by cuisine and city",
        "Reserve a table with real-time availability",
        "Order food online and keep history"
      ]}
      footer={
        <>
          Already have an account? <Link to="/auth/login">Sign in</Link>
        </>
      }
    >
      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="panel-heading">
          <h2>Register</h2>
          <p>Fill in your details to get started.</p>
        </div>

        <StatusMessage type="error">{error}</StatusMessage>

        <FormField
          label="Full name"
          name="fullName"
          value={form.fullName}
          onChange={(e) => {
            setForm({ ...form, fullName: e.target.value });
            if (fieldErrors.fullName) {
              setFieldErrors((current) => ({ ...current, fullName: "" }));
            }
          }}
          placeholder="Yousef Samir"
          error={fieldErrors.fullName}
        />

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
          placeholder="name@example.com"
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
          placeholder="At least 6 characters"
          error={fieldErrors.password}
        />

        <div className="password-strength-row">
          <span>Password strength</span>
          <strong className={`strength-${passwordStrengthLabel.toLowerCase()}`}>
            {passwordStrengthLabel}
          </strong>
        </div>
        <div className="password-strength-track" role="presentation">
          <span style={{ width: `${(passwordScore / 4) * 100}%` }} />
        </div>

        <FormField
          label="Confirm password"
          name="confirmPassword"
          type={showPassword ? "text" : "password"}
          value={form.confirmPassword}
          onChange={(e) => {
            setForm({ ...form, confirmPassword: e.target.value });
            if (fieldErrors.confirmPassword) {
              setFieldErrors((current) => ({ ...current, confirmPassword: "" }));
            }
          }}
          placeholder="Re-enter your password"
          error={fieldErrors.confirmPassword}
        />

        <div className="auth-inline-row">
          <label className="auth-checkbox-row">
            <input required type="checkbox" />
            <span>I agree to the terms and privacy policy.</span>
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
          {loading ? "Creating account..." : "Create account"}
        </button>

        <section className="auth-trust-block">
          <strong>With an account you can:</strong>
          <p>Book faster, reorder food, and keep your activity history.</p>
          <div className="auth-inline-badges">
            <span>Book</span>
            <span>Order</span>
            <span>Review</span>
          </div>
        </section>
      </form>
    </AuthLayout>
  );
}

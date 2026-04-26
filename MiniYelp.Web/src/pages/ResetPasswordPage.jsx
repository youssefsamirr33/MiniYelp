import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AuthLayout } from "../components/AuthLayout";
import { FormField } from "../components/FormField";
import { StatusMessage } from "../components/StatusMessage";
import { useAuth } from "../context/AuthContext";

export function ResetPasswordPage() {
  const auth = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({
    email: location.state?.email || "",
    resetToken: location.state?.resetToken || "",
    newPassword: ""
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await auth.resetPassword(form);
      setMessage(response.message);
      setTimeout(() => navigate("/auth/login"), 1200);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      eyebrow="Create new password"
      title="Finish your recovery flow securely."
      subtitle="Paste the reset token from the previous step, then choose a fresh password."
      footer={
        <>
          Need a new token? <Link to="/auth/forgot-password">Generate again</Link>
        </>
      }
    >
      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="panel-heading">
          <h2>Reset password</h2>
          <p>Complete the reset using email, token, and your new password.</p>
        </div>

        <StatusMessage type="error">{error}</StatusMessage>
        <StatusMessage type="success">{message}</StatusMessage>

        <FormField
          label="Email"
          name="email"
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          placeholder="customer@miniyelp.local"
        />

        <FormField
          label="Reset token"
          name="resetToken"
          value={form.resetToken}
          onChange={(e) => setForm({ ...form, resetToken: e.target.value })}
          placeholder="Paste the reset token"
        />

        <FormField
          label="New password"
          name="newPassword"
          type="password"
          value={form.newPassword}
          onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
          placeholder="NewPassword123"
        />

        <button className="primary-button" disabled={loading} type="submit">
          {loading ? "Resetting..." : "Reset password"}
        </button>
      </form>
    </AuthLayout>
  );
}

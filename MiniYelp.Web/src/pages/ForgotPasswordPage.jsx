import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthLayout } from "../components/AuthLayout";
import { FormField } from "../components/FormField";
import { StatusMessage } from "../components/StatusMessage";
import { useAuth } from "../context/AuthContext";

export function ForgotPasswordPage() {
  const auth = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");
    setToken("");

    try {
      const response = await auth.forgotPassword({ email });
      setMessage(response.message);
      setToken(response.resetToken || "");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      eyebrow="Recover access"
      title="Reset your password without leaving the app."
      subtitle="For local development, the reset token is shown directly so we can complete the flow end-to-end."
      footer={
        <>
          Remembered it? <Link to="/auth/login">Back to login</Link>
        </>
      }
    >
      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="panel-heading">
          <h2>Forgot password</h2>
          <p>Enter your email to generate a reset token.</p>
        </div>

        <StatusMessage type="error">{error}</StatusMessage>
        <StatusMessage type="success">{message}</StatusMessage>

        <FormField
          label="Email"
          name="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="customer@miniyelp.local"
        />

        <button className="primary-button" disabled={loading} type="submit">
          {loading ? "Generating..." : "Generate reset token"}
        </button>

        {token ? (
          <div className="token-card">
            <span>Reset token</span>
            <code>{token}</code>
            <button
              className="secondary-button"
              type="button"
              onClick={() =>
                navigate("/auth/reset-password", { state: { email, resetToken: token } })
              }
            >
              Continue to reset
            </button>
          </div>
        ) : null}
      </form>
    </AuthLayout>
  );
}

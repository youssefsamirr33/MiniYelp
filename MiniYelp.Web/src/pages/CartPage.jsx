import { useMemo, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { AppShell } from "../components/AppShell";
import { FormField } from "../components/FormField";
import { StatusMessage } from "../components/StatusMessage";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { createOrder } from "../lib/restaurants";

export function CartPage() {
  const auth = useAuth();
  const cart = useCart();
  const navigate = useNavigate();
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const checkoutDisabled = useMemo(
    () => !cart.cart.items.length || !cart.cart.restaurantId || !cart.cart.branchId,
    [cart.cart]
  );

  if (!auth.isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }

  async function handleCheckout(event) {
    event.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      await createOrder(
        {
          restaurantId: cart.cart.restaurantId,
          restaurantBranchId: Number(cart.cart.branchId),
          deliveryAddress,
          notes,
          items: cart.cart.items.map((item) => ({
            menuItemId: item.id,
            quantity: item.quantity
          }))
        },
        auth.token
      );

      cart.clearCart();
      setSuccess("Order placed successfully.");
      setTimeout(() => navigate("/my-orders"), 900);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppShell
      title="Review your cart and place the order."
      subtitle="Your online ordering flow is now connected to the backend orders API."
      accent="warm"
      actions={<Link className="secondary-button" to="/restaurants">Continue browsing</Link>}
    >
      <section className="details-grid">
        <section className="wide-card">
          <div className="panel-heading">
            <h2>Cart items</h2>
            <p>{cart.itemCount} item(s) ready for checkout.</p>
          </div>

          <div className="reservation-list">
            {cart.cart.items.length ? (
              cart.cart.items.map((item) => (
                <article className="reservation-card cart-item-card" key={item.id}>
                  <div className="cart-item-head">
                    <strong>{item.name}</strong>
                    <span className="rating-pill">{item.quantity} item(s)</span>
                  </div>
                  <span>{item.quantity} x {item.price.toFixed(2)} EGP</span>
                  <p>{item.description}</p>
                  <div className="quantity-row">
                    <button
                      className="secondary-button"
                      type="button"
                      onClick={() => cart.updateQuantity(item.id, item.quantity - 1)}
                    >
                      -
                    </button>
                    <strong>{item.quantity}</strong>
                    <button
                      className="secondary-button"
                      type="button"
                      onClick={() => cart.updateQuantity(item.id, item.quantity + 1)}
                    >
                      +
                    </button>
                  </div>
                </article>
              ))
            ) : (
              <div className="empty-state-panel">
                <strong>Your cart is empty</strong>
                <p>Add items from a restaurant menu first to start the ordering flow.</p>
              </div>
            )}
          </div>
        </section>

        <section className="wide-card">
          <div className="panel-heading">
            <h2>Checkout</h2>
            <p>{cart.cart.restaurantName || "No restaurant selected yet"}</p>
          </div>

          <StatusMessage type="error">{error}</StatusMessage>
          <StatusMessage type="success">{success}</StatusMessage>

          <form className="stack-form" onSubmit={handleCheckout}>
            <FormField
              label="Delivery address"
              name="deliveryAddress"
              value={deliveryAddress}
              onChange={(e) => setDeliveryAddress(e.target.value)}
              placeholder="Apartment, street, area, city"
            />

            <label className="form-field">
              <span>Order notes</span>
              <textarea
                className="app-textarea"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Leave instructions for your order"
              />
            </label>

            <div className="checkout-summary">
              <div className="summary-row">
                <span>Subtotal</span>
                <strong>{cart.subtotal.toFixed(2)} EGP</strong>
              </div>
              <div className="summary-row">
                <span>Branch selected</span>
                <strong>{cart.cart.branchId || "Not selected"}</strong>
              </div>
              <div className="summary-row">
                <span>Restaurant</span>
                <strong>{cart.cart.restaurantName || "Waiting for menu selection"}</strong>
              </div>
            </div>

            <button className="primary-button" disabled={loading || checkoutDisabled} type="submit">
              {loading ? "Placing order..." : "Place order"}
            </button>
          </form>
        </section>
      </section>
    </AppShell>
  );
}

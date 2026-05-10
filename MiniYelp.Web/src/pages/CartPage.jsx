import { useMemo, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { createOrder } from "../lib/restaurants";
import { useRestaurantData } from "../hooks/useRestaurantData";
import { useEffect } from "react";
import "../user-pages.css";

export function CartPage() {
  const auth = useAuth();
  const cart = useCart();
  const navigate = useNavigate();
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const { restaurant, loading: loadingRest } = useRestaurantData(cart.cart.restaurantId);

  const checkoutDisabled = useMemo(
    () => !cart.cart.items.length || !cart.cart.restaurantId || !cart.cart.branchId,
    [cart.cart]
  );

  // Auto-select first branch if none selected and data is available
  useEffect(() => {
    if (restaurant?.branches?.length && !cart.cart.branchId) {
      cart.setBranch(restaurant.branches[0].id);
    }
  }, [restaurant, cart.cart.branchId, cart]);

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
    <div className="user-page">
      <Navbar showSearch={false} />

      <main className="user-container">
        <div className="user-page-header">
          <h1>Review your Cart</h1>
          <p>Ready for checkout? Review your items below.</p>
        </div>

        {error && <div style={{ color: 'red', textAlign: 'center', marginBottom: '1rem' }}>{error}</div>}
        {success && <div style={{ color: 'green', textAlign: 'center', marginBottom: '1rem' }}>{success}</div>}

        <div className="user-grid">
          <div className="user-card">
            <h2 className="user-card-title">Cart Items</h2>
            
            {cart.cart.items.length ? (
              cart.cart.items.map((item) => (
                <div className="user-list-item" key={item.id}>
                  <div className="user-item-header">
                    <h3>{item.name}</h3>
                    <span style={{ fontWeight: '600', color: '#FF8A00' }}>{(item.price * item.quantity).toFixed(2)} EGP</span>
                  </div>
                  <p className="user-item-desc">{item.description || "Freshly prepared for you."}</p>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.875rem', color: '#718096' }}>{item.price.toFixed(2)} EGP each</span>
                    <div className="user-qty-controls">
                      <button className="user-qty-btn" type="button" onClick={() => cart.updateQuantity(item.id, item.quantity - 1)}>-</button>
                      <strong style={{ width: '20px', textAlign: 'center' }}>{item.quantity}</strong>
                      <button className="user-qty-btn" type="button" onClick={() => cart.updateQuantity(item.id, item.quantity + 1)}>+</button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="user-empty-state">
                <h3>Your cart is empty</h3>
                <p>Add items from a restaurant menu first to start the ordering flow.</p>
                <Link className="user-btn-secondary" to="/restaurants" style={{textDecoration: 'none', display: 'inline-block'}}>
                  Browse Restaurants
                </Link>
              </div>
            )}
          </div>

          <div className="user-card" style={{ height: 'fit-content' }}>
            <h2 className="user-card-title">Checkout</h2>
            <p style={{fontSize: '0.875rem', color: '#718096', marginBottom: '2rem'}}>
              {cart.cart.restaurantName ? `Ordering from: ${cart.cart.restaurantName}` : "No restaurant selected yet"}
            </p>

            <form onSubmit={handleCheckout}>
              <label className="user-form-label">Delivery Address</label>
              <input
                type="text"
                className="user-input"
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                placeholder="Apartment, street, area, city"
                required
              />

              <label className="user-form-label">Order Notes</label>
              <textarea
                className="user-textarea"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Leave instructions for your order"
              />

              <div style={{ margin: '2rem 0' }}>
                <div className="user-summary-row" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <span>Select Branch</span>
                  {restaurant?.branches?.length ? (
                    <select 
                      className="user-input" 
                      style={{ marginBottom: 0 }}
                      value={cart.cart.branchId || ""} 
                      onChange={(e) => cart.setBranch(Number(e.target.value))}
                      required
                    >
                      <option value="" disabled>Choose a branch</option>
                      {restaurant.branches.map(b => (
                        <option key={b.id} value={b.id}>{b.branchName} - {b.city}</option>
                      ))}
                    </select>
                  ) : (
                    <strong>{loadingRest ? "Loading branches..." : "No branches found"}</strong>
                  )}
                </div>
                <div className="user-summary-row total">
                  <span>Subtotal</span>
                  <strong>{cart.subtotal.toFixed(2)} EGP</strong>
                </div>
              </div>

              <button className="user-btn-primary" disabled={loading || checkoutDisabled} type="submit">
                {loading ? "Placing order..." : "Place Order"}
              </button>
            </form>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

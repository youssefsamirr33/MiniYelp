import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { AppShell } from "../components/AppShell";
import { StatusMessage } from "../components/StatusMessage";
import { useAuth } from "../context/AuthContext";
import { getMyOrders } from "../lib/restaurants";

export function MyOrdersPage() {
  const auth = useAuth();
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    getMyOrders(auth.token)
      .then(setOrders)
      .catch((err) => setError(err.message));
  }, []);

  if (!auth.isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }

  return (
    <AppShell
      title="Your online food orders in one place."
      subtitle="Review recent orders, delivery status, and ordered items."
      accent="warm"
      actions={<Link className="secondary-button" to="/cart">Open cart</Link>}
    >
      <section className="wide-card">
        <div className="panel-heading">
          <h2>My orders</h2>
          <p>{orders.length} order(s) found.</p>
        </div>

        <StatusMessage type="error">{error}</StatusMessage>

        <div className="reservation-list">
          {orders.length ? (
            orders.map((order) => (
              <article className="reservation-card" key={order.id}>
                <div className="cart-item-head">
                  <strong>{order.restaurantName}</strong>
                  <span className={`status-pill status-${order.status?.toLowerCase() || "muted"}`}>
                    {order.status}
                  </span>
                </div>
                <span>{order.branchName}</span>
                <p>{order.deliveryAddress}</p>
                <small>Total: {order.totalAmount.toFixed(2)} EGP</small>
                <div className="order-items-inline">
                  {order.items.map((item) => (
                    <span className="budget-pill" key={`${order.id}-${item.menuItemId}`}>
                      {item.quantity} x {item.menuItemName}
                    </span>
                  ))}
                </div>
              </article>
            ))
          ) : (
            <div className="empty-state-panel">
              <strong>No orders yet</strong>
              <p>Add menu items to your cart and complete checkout to see orders here.</p>
            </div>
          )}
        </div>
      </section>
    </AppShell>
  );
}

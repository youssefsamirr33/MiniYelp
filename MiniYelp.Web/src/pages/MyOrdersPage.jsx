import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { useAuth } from "../context/AuthContext";
import { getMyOrders } from "../lib/restaurants";
import "../user-pages.css";

export function MyOrdersPage() {
  const auth = useAuth();
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    getMyOrders(auth.token)
      .then(setOrders)
      .catch((err) => setError(err.message));
  }, [auth.token]);

  if (!auth.isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }

  return (
    <div className="user-page">
      <Navbar showSearch={false} />

      <main className="user-container">
        <div className="user-page-header">
          <h1>Your Orders</h1>
          <p>Review recent food orders and delivery statuses.</p>
        </div>

        {error && <div style={{ color: 'red', textAlign: 'center', marginBottom: '1rem' }}>{error}</div>}

        <div className="user-card" style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #EDF2F7', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
            <h2 style={{ fontFamily: 'Playfair Display', fontSize: '1.5rem', margin: 0, color: '#1A202C' }}>Order History</h2>
            <span style={{ fontSize: '0.875rem', color: '#718096' }}>{orders.length} order(s) found</span>
          </div>
          
          {orders.length ? (
            orders.map((order) => (
              <div className="user-list-item" key={order.id}>
                <div className="user-item-header">
                  <h3>{order.restaurantName}</h3>
                  <span className={`user-badge ${order.status === 'Delivered' ? 'green' : 'orange'}`}>
                    {order.status}
                  </span>
                </div>
                <p className="user-item-desc" style={{ marginBottom: '0.5rem' }}>{order.branchName}</p>
                <p style={{ fontSize: '0.75rem', color: '#A0AEC0', marginBottom: '1.5rem' }}>Delivering to: {order.deliveryAddress}</p>
                
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.5rem' }}>
                  {order.items.map((item) => (
                    <span className="user-badge" style={{ background: '#F7FAFC' }} key={`${order.id}-${item.menuItemId}`}>
                      {item.quantity}x {item.menuItemName}
                    </span>
                  ))}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px dashed #E2E8F0', paddingTop: '1rem' }}>
                  <span style={{ fontSize: '0.875rem', color: '#718096' }}>Total Amount</span>
                  <strong style={{ fontSize: '1.125rem', color: '#FF8A00' }}>{order.totalAmount.toFixed(2)} EGP</strong>
                </div>
              </div>
            ))
          ) : (
            <div className="user-empty-state">
              <h3>No orders yet</h3>
              <p>Add menu items to your cart and complete checkout to see orders here.</p>
              <Link className="user-btn-primary" to="/restaurants" style={{textDecoration: 'none', display: 'inline-block', width: 'auto'}}>
                Start Ordering
              </Link>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

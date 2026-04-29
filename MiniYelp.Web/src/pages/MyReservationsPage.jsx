import { useEffect, useMemo, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { useAuth } from "../context/AuthContext";
import { getMyReservations } from "../lib/restaurants";
import "../user-pages.css";

export function MyReservationsPage() {
  const auth = useAuth();
  const [reservations, setReservations] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    getMyReservations(auth.token)
      .then(setReservations)
      .catch((err) => setError(err.message));
  }, [auth.token]);

  const reservationStats = useMemo(() => {
    const pending = reservations.filter((r) => r.status === "Pending").length;
    const confirmed = reservations.filter((r) => r.status === "Confirmed").length;
    const completed = reservations.filter((r) => r.status === "Completed").length;

    return { total: reservations.length, pending, confirmed, completed };
  }, [reservations]);

  if (!auth.isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }

  return (
    <div className="user-page">
      <Navbar showSearch={false} />

      <main className="user-container">
        <div className="user-page-header">
          <h1>Track your Reservations</h1>
          <p>Every table booking you create appears here with live status.</p>
        </div>

        {error && <div style={{ color: 'red', textAlign: 'center', marginBottom: '1rem' }}>{error}</div>}

        <div className="user-grid">
          <div>
            <div className="user-stat-grid">
              <div className="user-stat-box">
                <span>Total</span>
                <strong>{reservationStats.total}</strong>
              </div>
              <div className="user-stat-box">
                <span>Pending</span>
                <strong>{reservationStats.pending}</strong>
              </div>
              <div className="user-stat-box">
                <span>Confirmed</span>
                <strong style={{color: '#38A169'}}>{reservationStats.confirmed}</strong>
              </div>
              <div className="user-stat-box">
                <span>Completed</span>
                <strong style={{color: '#718096'}}>{reservationStats.completed}</strong>
              </div>
            </div>

            <div className="user-card">
              <h2 className="user-card-title">Booking History</h2>
              
              {reservations.length ? (
                reservations.map((reservation) => (
                  <div className="user-list-item" key={reservation.id}>
                    <div className="user-item-header">
                      <h3>{reservation.restaurantName}</h3>
                      <span className={`user-badge ${reservation.status === 'Confirmed' ? 'green' : reservation.status === 'Pending' ? 'orange' : ''}`}>
                        {reservation.status}
                      </span>
                    </div>
                    <p className="user-item-desc">{reservation.branchName} • {reservation.city}</p>
                    
                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                      <span className="user-badge" style={{background: '#F7FAFC'}}>{reservation.reservationDate}</span>
                      <span className="user-badge" style={{background: '#F7FAFC'}}>{reservation.reservationTime}</span>
                      <span className="user-badge" style={{background: '#F7FAFC'}}>Party of {reservation.partySize}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="user-empty-state">
                  <h3>No reservations yet</h3>
                  <p>Start from a restaurant details page and reserve your first table.</p>
                  <Link className="user-btn-secondary" to="/restaurants" style={{textDecoration: 'none', display: 'inline-block'}}>
                    Browse Restaurants
                  </Link>
                </div>
              )}
            </div>
          </div>

          <div className="user-card" style={{ height: 'fit-content' }}>
            <h2 className="user-card-title">Plan Next Visit</h2>
            <p style={{fontSize: '0.875rem', color: '#718096', marginBottom: '2rem'}}>
              Use the restaurant pages to compare menus, reviews, and branch details before booking again.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '2rem' }}>
              <div>
                <strong style={{ fontSize: '0.875rem' }}>Browse restaurants</strong>
                <p style={{ fontSize: '0.75rem', color: '#718096', margin: '0.25rem 0 0 0' }}>Find new places by cuisine, city, and budget.</p>
              </div>
              <div>
                <strong style={{ fontSize: '0.875rem' }}>Check menu first</strong>
                <p style={{ fontSize: '0.75rem', color: '#718096', margin: '0.25rem 0 0 0' }}>Compare food options before deciding where to reserve.</p>
              </div>
            </div>

            <Link className="user-btn-primary" to="/restaurants" style={{textDecoration: 'none', display: 'block', textAlign: 'center'}}>
              Explore Restaurants
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

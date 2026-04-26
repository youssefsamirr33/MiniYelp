import { useEffect, useMemo, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { AppShell } from "../components/AppShell";
import { StatusMessage } from "../components/StatusMessage";
import { useAuth } from "../context/AuthContext";
import { getMyReservations } from "../lib/restaurants";

export function MyReservationsPage() {
  const auth = useAuth();
  const [reservations, setReservations] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    getMyReservations(auth.token)
      .then(setReservations)
      .catch((err) => setError(err.message));
  }, []);

  const reservationStats = useMemo(() => {
    const pending = reservations.filter((reservation) => reservation.status === "Pending").length;
    const confirmed = reservations.filter((reservation) => reservation.status === "Confirmed").length;
    const completed = reservations.filter((reservation) => reservation.status === "Completed").length;

    return {
      total: reservations.length,
      pending,
      confirmed,
      completed
    };
  }, [reservations]);

  if (!auth.isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }

  return (
    <AppShell
      title="Track your reservations."
      subtitle="Every table booking you create appears here with branch details, timing, and live status."
      accent="editorial"
      actions={<Link className="secondary-button" to="/restaurants">Book another table</Link>}
    >
      <section className="reservation-hub-grid">
        <section className="wide-card reservation-hub-main">
          <div className="panel-heading">
            <h2>My reservations</h2>
            <p>{reservationStats.total} reservation(s) in your booking history.</p>
          </div>

          <div className="reservation-overview-grid">
            <article>
              <span>Total bookings</span>
              <strong>{reservationStats.total}</strong>
            </article>
            <article>
              <span>Pending</span>
              <strong>{reservationStats.pending}</strong>
            </article>
            <article>
              <span>Confirmed</span>
              <strong>{reservationStats.confirmed}</strong>
            </article>
            <article>
              <span>Completed</span>
              <strong>{reservationStats.completed}</strong>
            </article>
          </div>

          <StatusMessage type="error">{error}</StatusMessage>

          <div className="reservation-timeline">
            {reservations.length ? (
              reservations.map((reservation) => (
                <article className="reservation-timeline-card" key={reservation.id}>
                  <div className="reservation-timeline-rail" />
                  <div className="reservation-timeline-content">
                    <div className="reservation-card-header">
                      <div>
                        <strong>{reservation.restaurantName}</strong>
                        <p>{reservation.branchName} - {reservation.city}</p>
                      </div>
                      <span className={`status-pill status-${reservation.status?.toLowerCase() || "muted"}`}>
                        {reservation.status}
                      </span>
                    </div>

                    <div className="reservation-chip-row">
                      <span className="budget-pill">{reservation.reservationDate}</span>
                      <span className="budget-pill">{reservation.reservationTime}</span>
                      <span className="budget-pill">Party of {reservation.partySize}</span>
                    </div>

                    <div className="reservation-meta-grid">
                      <article>
                        <span>Branch</span>
                        <strong>{reservation.branchName}</strong>
                      </article>
                      <article>
                        <span>City</span>
                        <strong>{reservation.city}</strong>
                      </article>
                      <article>
                        <span>Status</span>
                        <strong>{reservation.status}</strong>
                      </article>
                    </div>
                  </div>
                </article>
              ))
            ) : (
              <div className="empty-state-panel">
                <strong>No reservations yet</strong>
                <p>Start from a restaurant details page and reserve your first table.</p>
              </div>
            )}
          </div>
        </section>

        <aside className="side-stack">
          <section className="wide-card reservation-side-card">
            <div className="panel-heading">
              <h2>Plan your next visit</h2>
              <p>Use the restaurant pages to compare menus, reviews, and branch details before booking again.</p>
            </div>

            <div className="reservation-side-list">
              <article>
                <strong>Browse restaurants</strong>
                <p>Find new places by cuisine, city, and budget.</p>
              </article>
              <article>
                <strong>Check menu first</strong>
                <p>Compare food options before deciding where to reserve.</p>
              </article>
              <article>
                <strong>Keep your history</strong>
                <p>All reservation actions stay visible in one place.</p>
              </article>
            </div>

            <Link className="primary-button inline-button" to="/restaurants">
              Explore restaurants
            </Link>
          </section>
        </aside>
      </section>
    </AppShell>
  );
}

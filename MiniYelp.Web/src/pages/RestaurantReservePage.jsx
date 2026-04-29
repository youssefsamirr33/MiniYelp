import { useEffect, useMemo, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { createReservation } from "../lib/restaurants";
import { useRestaurantData } from "../hooks/useRestaurantData";
import { useAuth } from "../context/AuthContext";
import "../user-pages.css";

const suggestedSlots = ["18:30", "19:00", "19:30", "20:00", "20:30", "21:00"];
const partyOptions = [2, 4, 6, 8];

function getDefaultReservationDateTime() {
  const nextSlot = new Date();
  nextSlot.setDate(nextSlot.getDate() + 1);
  nextSlot.setHours(20, 0, 0, 0);

  const year = nextSlot.getFullYear();
  const month = String(nextSlot.getMonth() + 1).padStart(2, "0");
  const day = String(nextSlot.getDate()).padStart(2, "0");
  const hours = String(nextSlot.getHours()).padStart(2, "0");
  const minutes = String(nextSlot.getMinutes()).padStart(2, "0");

  return {
    reservationDate: `${year}-${month}-${day}`,
    reservationTime: `${hours}:${minutes}`
  };
}

function getTodayDate() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function RestaurantReservePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const auth = useAuth();
  const defaultReservationDateTime = getDefaultReservationDateTime();
  const minimumReservationDate = getTodayDate();
  const { restaurant, loading, error: fetchError } = useRestaurantData(id);
  
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [reservationForm, setReservationForm] = useState({
    restaurantBranchId: "",
    reservationDate: defaultReservationDateTime.reservationDate,
    reservationTime: defaultReservationDateTime.reservationTime,
    partySize: 2,
    notes: ""
  });

  useEffect(() => {
    if (restaurant?.branches?.length && !reservationForm.restaurantBranchId) {
      setReservationForm((current) => ({
        ...current,
        restaurantBranchId: restaurant.branches[0].id.toString()
      }));
    }
  }, [restaurant, reservationForm.restaurantBranchId]);

  const selectedBranch = useMemo(
    () => restaurant?.branches.find(b => b.id.toString() === reservationForm.restaurantBranchId) || null,
    [restaurant, reservationForm.restaurantBranchId]
  );

  async function handleReservation(event) {
    event.preventDefault();
    setError("");
    setSuccess("");
    setIsSubmitting(true);

    try {
      if (!reservationForm.restaurantBranchId || !reservationForm.reservationDate || !reservationForm.reservationTime) {
        throw new Error("Please select branch, date, and time before creating a reservation.");
      }

      const requestedDateTime = new Date(`${reservationForm.reservationDate}T${reservationForm.reservationTime}:00`);
      if (Number.isNaN(requestedDateTime.getTime()) || requestedDateTime <= new Date()) {
        throw new Error("Please choose a reservation date and time in the future.");
      }

      const payload = {
        ...reservationForm,
        restaurantBranchId: Number(reservationForm.restaurantBranchId),
        partySize: Number(reservationForm.partySize)
      };

      await createReservation(payload, auth.token);
      setSuccess("Reservation created successfully. Redirecting...");
      setTimeout(() => navigate('/my-reservations'), 1500);
      
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  const slotPillStyle = (isActive) => ({
    background: isActive ? '#FF8A00' : '#F7FAFC',
    color: isActive ? 'white' : '#4A5568',
    border: `1px solid ${isActive ? '#FF8A00' : '#E2E8F0'}`,
    borderRadius: '12px',
    padding: '0.75rem 1rem',
    fontWeight: '600',
    cursor: 'pointer',
    textAlign: 'center',
    transition: 'all 0.2s',
    fontSize: '0.875rem'
  });

  const branchCardStyle = (isActive) => ({
    background: isActive ? '#FFF3E0' : 'white',
    border: `2px solid ${isActive ? '#FF8A00' : '#E2E8F0'}`,
    borderRadius: '16px',
    padding: '1.5rem',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'all 0.2s'
  });

  if (!auth.isAuthenticated) return <Navigate to="/auth/login" replace />;

  return (
    <div className="user-page">
      <Navbar showSearch={false} />

      <main className="user-container">
        <div className="user-page-header">
          <h1>Reserve a Table</h1>
          <p>Choose your branch, set the perfect time, and confirm with confidence.</p>
        </div>

        {fetchError && <div style={{ color: 'red', textAlign: 'center', marginBottom: '1rem' }}>{fetchError}</div>}
        {error && <div style={{ color: 'red', textAlign: 'center', marginBottom: '1rem', background: '#FED7D7', padding: '1rem', borderRadius: '12px' }}>{error}</div>}
        {success && <div style={{ color: 'green', textAlign: 'center', marginBottom: '1rem', background: '#C6F6D5', padding: '1rem', borderRadius: '12px' }}>{success}</div>}
        
        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem' }}>Loading restaurant data...</div>
        ) : (
          <div className="user-grid">
            <form onSubmit={handleReservation}>
              <div className="user-card">
                <h2 className="user-card-title">1. Select Branch</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
                  {restaurant?.branches.map((branch) => {
                    const isActive = reservationForm.restaurantBranchId === branch.id.toString();
                    return (
                      <button
                        key={branch.id}
                        type="button"
                        style={branchCardStyle(isActive)}
                        onClick={() => setReservationForm(c => ({ ...c, restaurantBranchId: branch.id.toString() }))}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                          <strong style={{ fontSize: '1.125rem', color: '#1A202C' }}>{branch.branchName}</strong>
                          <span className="user-badge" style={{ margin: 0 }}>{branch.city}</span>
                        </div>
                        <p style={{ fontSize: '0.875rem', color: '#718096', margin: '0 0 0.5rem 0' }}>{branch.address}</p>
                        <small style={{ color: '#A0AEC0' }}>{branch.openingHours}</small>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="user-card">
                <h2 className="user-card-title">2. Date & Time</h2>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
                  <div>
                    <label className="user-form-label">Date</label>
                    <input
                      className="user-input"
                      type="date"
                      min={minimumReservationDate}
                      value={reservationForm.reservationDate}
                      onChange={(e) => setReservationForm(c => ({ ...c, reservationDate: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <label className="user-form-label">Time</label>
                    <input
                      className="user-input"
                      type="time"
                      value={reservationForm.reservationTime}
                      onChange={(e) => setReservationForm(c => ({ ...c, reservationTime: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <label className="user-form-label">Guests</label>
                    <input
                      className="user-input"
                      type="number"
                      min="1"
                      max="50"
                      value={reservationForm.partySize}
                      onChange={(e) => setReservationForm(c => ({ ...c, partySize: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label className="user-form-label">Suggested evening slots</label>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {suggestedSlots.map(slot => (
                      <button
                        key={slot}
                        type="button"
                        style={slotPillStyle(reservationForm.reservationTime === slot)}
                        onClick={() => setReservationForm(c => ({ ...c, reservationTime: slot }))}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="user-form-label">Popular party sizes</label>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {partyOptions.map(size => (
                      <button
                        key={size}
                        type="button"
                        style={slotPillStyle(Number(reservationForm.partySize) === size)}
                        onClick={() => setReservationForm(c => ({ ...c, partySize: size }))}
                      >
                        {size} guests
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="user-card">
                <h2 className="user-card-title">3. Special Requests</h2>
                <textarea
                  className="user-textarea"
                  value={reservationForm.notes}
                  onChange={(e) => setReservationForm(c => ({ ...c, notes: e.target.value }))}
                  placeholder="Window seat, birthday setup, quiet corner..."
                />
              </div>

              <button className="user-btn-primary" type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Confirming..." : "Confirm Reservation"}
              </button>
            </form>

            <div className="user-card" style={{ height: 'fit-content' }}>
              <h2 className="user-card-title">Booking Summary</h2>
              
              <div style={{ background: '#F7FAFC', padding: '1.5rem', borderRadius: '16px', marginBottom: '2rem' }}>
                <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#718096' }}>Selected Experience</span>
                <h3 style={{ fontFamily: 'Playfair Display', fontSize: '1.5rem', color: '#1A202C', margin: '0.5rem 0' }}>
                  {restaurant?.name || "Loading..."}
                </h3>
                <p style={{ fontSize: '0.875rem', color: '#718096', margin: 0 }}>
                  {selectedBranch?.branchName || "Choose a branch"}
                </p>
              </div>

              <div className="user-summary-row">
                <span>Branch</span>
                <strong>{selectedBranch?.branchName || "Select a branch"}</strong>
              </div>
              <div className="user-summary-row">
                <span>Date</span>
                <strong>{reservationForm.reservationDate || "Not selected"}</strong>
              </div>
              <div className="user-summary-row">
                <span>Time</span>
                <strong>{reservationForm.reservationTime || "Not selected"}</strong>
              </div>
              <div className="user-summary-row total" style={{ borderTop: 'none', paddingTop: 0 }}>
                <span>Guests</span>
                <strong>{reservationForm.partySize} people</strong>
              </div>

              <Link className="user-btn-secondary" to={`/restaurants/${id}`} style={{ textDecoration: 'none', display: 'block', textAlign: 'center', marginTop: '2rem' }}>
                Back to Details
              </Link>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

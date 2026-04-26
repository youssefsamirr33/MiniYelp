import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { FormField } from "../components/FormField";
import { RestaurantPageShell } from "../components/RestaurantPageShell";
import { createReservation } from "../lib/restaurants";
import { useRestaurantData } from "../hooks/useRestaurantData";
import { useAuth } from "../context/AuthContext";

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
  const auth = useAuth();
  const defaultReservationDateTime = getDefaultReservationDateTime();
  const minimumReservationDate = getTodayDate();
  const { restaurant, loading, error, setError } = useRestaurantData(id);
  const [success, setSuccess] = useState("");
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
    () =>
      restaurant?.branches.find(
        (branch) => branch.id.toString() === reservationForm.restaurantBranchId
      ) || null,
    [restaurant, reservationForm.restaurantBranchId]
  );

  async function handleReservation(event) {
    event.preventDefault();
    setError("");
    setSuccess("");

    try {
      if (
        !reservationForm.restaurantBranchId ||
        !reservationForm.reservationDate ||
        !reservationForm.reservationTime
      ) {
        throw new Error("Please select branch, date, and time before creating a reservation.");
      }

      const requestedDateTime = new Date(
        `${reservationForm.reservationDate}T${reservationForm.reservationTime}:00`
      );

      if (Number.isNaN(requestedDateTime.getTime()) || requestedDateTime <= new Date()) {
        throw new Error("Please choose a reservation date and time in the future.");
      }

      const payload = {
        ...reservationForm,
        restaurantBranchId: Number(reservationForm.restaurantBranchId),
        partySize: Number(reservationForm.partySize)
      };

      await createReservation(payload, auth.token);
      const nextDefault = getDefaultReservationDateTime();
      setReservationForm((current) => ({
        ...current,
        reservationDate: nextDefault.reservationDate,
        reservationTime: nextDefault.reservationTime,
        partySize: 2,
        notes: ""
      }));
      setSuccess("Reservation created successfully.");
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <RestaurantPageShell
      accent="editorial"
      error={error}
      loading={loading}
      restaurant={restaurant}
      success={success}
    >
      <section className="reservation-page-grid">
        <section className="wide-card reservation-experience-card">
          <div className="panel-heading">
            <h2>Reserve a table</h2>
            <p>Choose your branch, set the perfect time, and confirm with confidence.</p>
          </div>

          <div className="reservation-stage-row">
            <article>
              <span>01</span>
              <strong>Pick a branch</strong>
              <p>Select the location that fits your plan.</p>
            </article>
            <article>
              <span>02</span>
              <strong>Choose time</strong>
              <p>Use suggested slots or enter your own time.</p>
            </article>
            <article>
              <span>03</span>
              <strong>Confirm</strong>
              <p>Review the summary and lock in the booking.</p>
            </article>
          </div>

          <form className="stack-form reservation-form-modern" onSubmit={handleReservation}>
            <section className="reservation-section-card">
              <div className="reservation-section-head">
                <h3>Branch</h3>
                <p>Choose where you want to dine.</p>
              </div>

              <div className="branch-choice-grid">
                {restaurant?.branches.map((branch) => {
                  const isActive = reservationForm.restaurantBranchId === branch.id.toString();

                  return (
                    <button
                      className={`branch-choice-card ${isActive ? "active" : ""}`}
                      key={branch.id}
                      type="button"
                      onClick={() =>
                        setReservationForm((current) => ({
                          ...current,
                          restaurantBranchId: branch.id.toString()
                        }))
                      }
                    >
                      <div className="branch-choice-head">
                        <strong>{branch.branchName}</strong>
                        <span className="budget-pill">{branch.city}</span>
                      </div>
                      <p>{branch.address}</p>
                      <small>{branch.openingHours}</small>
                    </button>
                  );
                })}
              </div>
            </section>

            <section className="reservation-section-card">
              <div className="reservation-section-head">
                <h3>Date and time</h3>
                <p>Use quick slots to reduce friction, or enter details manually.</p>
              </div>

              <div className="filter-dropdown-grid">
                <FormField
                  label="Date"
                  min={minimumReservationDate}
                  name="reservationDate"
                  type="date"
                  value={reservationForm.reservationDate}
                  onChange={(e) =>
                    setReservationForm((current) => ({
                      ...current,
                      reservationDate: e.target.value
                    }))
                  }
                />

                <FormField
                  label="Time"
                  name="reservationTime"
                  type="time"
                  value={reservationForm.reservationTime}
                  onChange={(e) =>
                    setReservationForm((current) => ({
                      ...current,
                      reservationTime: e.target.value
                    }))
                  }
                />

                <FormField
                  label="Guests"
                  max="50"
                  min="1"
                  name="partySize"
                  type="number"
                  value={reservationForm.partySize}
                  onChange={(e) =>
                    setReservationForm((current) => ({
                      ...current,
                      partySize: e.target.value
                    }))
                  }
                />
              </div>

              <div className="slot-picker">
                <span className="slot-picker-label">Suggested evening slots</span>
                <div className="slot-grid">
                  {suggestedSlots.map((slot) => (
                    <button
                      className={`slot-pill ${
                        reservationForm.reservationTime === slot ? "active" : ""
                      }`}
                      key={slot}
                      type="button"
                      onClick={() =>
                        setReservationForm((current) => ({
                          ...current,
                          reservationTime: slot
                        }))
                      }
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>

              <div className="slot-picker">
                <span className="slot-picker-label">Popular party sizes</span>
                <div className="slot-grid">
                  {partyOptions.map((size) => (
                    <button
                      className={`slot-pill ${
                        Number(reservationForm.partySize) === size ? "active" : ""
                      }`}
                      key={size}
                      type="button"
                      onClick={() =>
                        setReservationForm((current) => ({
                          ...current,
                          partySize: size
                        }))
                      }
                    >
                      {size} guests
                    </button>
                  ))}
                </div>
              </div>
            </section>

            <section className="reservation-section-card">
              <div className="reservation-section-head">
                <h3>Special notes</h3>
                <p>Optional details such as seating preference or celebration notes.</p>
              </div>

              <label className="form-field">
                <span>Notes</span>
                <textarea
                  className="app-textarea"
                  value={reservationForm.notes}
                  onChange={(e) =>
                    setReservationForm((current) => ({ ...current, notes: e.target.value }))
                  }
                  placeholder="Window seat, birthday setup, quiet corner..."
                />
              </label>
            </section>

            <div className="reservation-action-bar">
              <button className="primary-button" type="submit">
                Confirm reservation
              </button>
              <Link className="secondary-button inline-button" to={`/restaurants/${id}`}>
                Back to details
              </Link>
            </div>
          </form>
        </section>

        <aside className="side-stack">
          <section className="wide-card reservation-summary-card reservation-summary-modern">
            <div className="panel-heading">
              <h2>Booking summary</h2>
              <p>A calm confirmation area before you lock in the reservation.</p>
            </div>

            <div className="reservation-highlight-card">
              <span className="hero-eyebrow">Selected experience</span>
              <strong>{restaurant?.name || "Loading..."}</strong>
              <p>{selectedBranch?.branchName || "Choose a branch to preview the final booking."}</p>
            </div>

            <div className="summary-row">
              <span>Branch</span>
              <strong>{selectedBranch?.branchName || "Select a branch"}</strong>
            </div>
            <div className="summary-row">
              <span>Date</span>
              <strong>{reservationForm.reservationDate || "Not selected"}</strong>
            </div>
            <div className="summary-row">
              <span>Time</span>
              <strong>{reservationForm.reservationTime || "Not selected"}</strong>
            </div>
            <div className="summary-row">
              <span>Guests</span>
              <strong>{reservationForm.partySize} guests</strong>
            </div>
            <div className="summary-row">
              <span>Atmosphere</span>
              <strong>Verified booking flow</strong>
            </div>
          </section>
        </aside>
      </section>
    </RestaurantPageShell>
  );
}

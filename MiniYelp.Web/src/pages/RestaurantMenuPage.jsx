import { useParams } from "react-router-dom";
import { useState } from "react";
import { RestaurantPageShell } from "../components/RestaurantPageShell";
import { useCart } from "../context/CartContext";
import { useRestaurantData } from "../hooks/useRestaurantData";

export function RestaurantMenuPage() {
  const { id } = useParams();
  const cart = useCart();
  const { restaurant, menuSections, loading, error, setError } = useRestaurantData(id, {
    includeMenu: true
  });
  const [success, setSuccess] = useState("");

  function handleAddToCart(item) {
    if (!restaurant) {
      return;
    }

    cart.addItem({
      restaurantId: restaurant.id,
      restaurantName: restaurant.name,
      branchId: restaurant.branches[0]?.id,
      item: {
        id: item.id,
        name: item.name,
        description: item.description,
        price: item.price
      }
    });

    setError("");
    setSuccess(`${item.name} added to cart.`);
  }

  return (
    <RestaurantPageShell
      accent="warm"
      error={error}
      loading={loading}
      restaurant={restaurant}
      success={success}
    >
      <section className="wide-card">
        <div className="panel-heading">
          <h2>Menu</h2>
          <p>Browse dishes, compare prices, and add items to your cart for online ordering.</p>
        </div>

        <div className="menu-section-list">
          {menuSections.length ? (
            menuSections.map((section) => (
              <section className="menu-section-card" key={section.id}>
                <div className="menu-section-head">
                  <div>
                    <h3>{section.name}</h3>
                    <p>{section.description}</p>
                  </div>
                </div>

                <div className="menu-item-grid">
                  {section.items.map((item) => (
                    <article className="menu-item-card" key={item.id}>
                      {item.imageUrl ? (
                        <img alt={item.name} className="menu-item-image" src={item.imageUrl} />
                      ) : null}
                      <div className="menu-item-body">
                        <strong>{item.name}</strong>
                        <p>{item.description}</p>
                        <div className="menu-item-footer">
                          <span>{Number(item.price).toFixed(2)} EGP</span>
                          <button
                            className="primary-button compact-button"
                            disabled={!item.isAvailable}
                            type="button"
                            onClick={() => handleAddToCart(item)}
                          >
                            {item.isAvailable ? "Add to cart" : "Unavailable"}
                          </button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            ))
          ) : (
            <div className="empty-state-panel">
              <strong>No menu items available</strong>
              <p>This restaurant has not published online ordering items yet.</p>
            </div>
          )}
        </div>
      </section>
    </RestaurantPageShell>
  );
}

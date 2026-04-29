import { useParams, Link } from "react-router-dom";
import { useState } from "react";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { useCart } from "../context/CartContext";
import { useRestaurantData } from "../hooks/useRestaurantData";
import "../user-pages.css";

export function RestaurantMenuPage() {
  const { id } = useParams();
  const cart = useCart();
  const { restaurant, menuSections, loading, error } = useRestaurantData(id, {
    includeMenu: true
  });
  const [success, setSuccess] = useState("");

  function handleAddToCart(item) {
    if (!restaurant) return;

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

    setSuccess(`${item.name} added to cart.`);
    setTimeout(() => setSuccess(""), 3000);
  }

  const placeholders = [
    "https://images.unsplash.com/photo-1553909489-cd47ce56144e?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1576107232684-1279f390859f?auto=format&fit=crop&w=400&q=80"
  ];

  return (
    <div className="user-page">
      <Navbar showSearch={false} />

      <main className="user-container">
        <div className="user-page-header">
          <h1>{restaurant ? `${restaurant.name} Menu` : "Menu"}</h1>
          <p>Browse dishes, compare prices, and add items to your cart for online ordering.</p>
        </div>

        {error && <div style={{ color: 'red', textAlign: 'center', marginBottom: '1rem' }}>{error}</div>}
        {success && <div style={{ color: 'green', textAlign: 'center', marginBottom: '1rem' }}>{success}</div>}
        {loading && <div style={{ textAlign: 'center', padding: '2rem' }}>Loading menu...</div>}

        {!loading && menuSections.length ? (
          menuSections.map((section, sIdx) => (
            <div className="user-card" key={section.id} style={{ marginBottom: '3rem' }}>
              <div style={{ borderBottom: '1px solid #EDF2F7', paddingBottom: '1.5rem', marginBottom: '2rem' }}>
                <h2 style={{ fontFamily: 'Playfair Display', fontSize: '2rem', color: '#1A202C', margin: '0 0 0.5rem 0' }}>
                  {section.name}
                </h2>
                <p style={{ color: '#718096', margin: 0 }}>{section.description}</p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
                {section.items.map((item, iIdx) => (
                  <div key={item.id} style={{ background: '#FDF9F1', borderRadius: '16px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                    <img 
                      src={item.imageUrl || placeholders[(sIdx + iIdx) % placeholders.length]} 
                      alt={item.name} 
                      style={{ width: '100%', height: '200px', objectFit: 'cover' }} 
                    />
                    <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                      <h3 style={{ fontFamily: 'Playfair Display', fontSize: '1.25rem', margin: '0 0 0.5rem 0', color: '#1A202C' }}>
                        {item.name}
                      </h3>
                      <p style={{ color: '#718096', fontSize: '0.875rem', marginBottom: '1.5rem', flex: 1 }}>
                        {item.description || "A delicious addition to any meal."}
                      </p>
                      
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <strong style={{ fontSize: '1.125rem', color: '#FF8A00' }}>{Number(item.price).toFixed(2)} EGP</strong>
                        <button
                          className="user-btn-primary"
                          style={{ width: 'auto', padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                          disabled={!item.isAvailable}
                          onClick={() => handleAddToCart(item)}
                        >
                          {item.isAvailable ? "Add to cart" : "Unavailable"}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        ) : !loading && (
          <div className="user-empty-state">
            <h3>No menu items available</h3>
            <p>This restaurant has not published online ordering items yet.</p>
            <Link className="user-btn-secondary" to={`/restaurants/${id}`} style={{textDecoration: 'none'}}>
              Back to Restaurant
            </Link>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

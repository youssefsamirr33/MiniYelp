import { createContext, useContext, useEffect, useMemo, useState } from "react";

const CartContext = createContext(null);
const STORAGE_KEY = "miniyelp.cart";

export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw
      ? JSON.parse(raw)
      : { restaurantId: null, restaurantName: "", branchId: null, items: [] };
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
  }, [cart]);

  const value = useMemo(
    () => ({
      cart,
      itemCount: cart.items.reduce((sum, item) => sum + item.quantity, 0),
      subtotal: cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0),
      addItem({ restaurantId, restaurantName, branchId, item }) {
        setCart((current) => {
          const sameRestaurant = current.restaurantId === null || current.restaurantId === restaurantId;
          const baseCart = sameRestaurant
            ? current
            : { restaurantId: null, restaurantName: "", branchId: null, items: [] };

          const existing = baseCart.items.find((x) => x.id === item.id);

          return {
            restaurantId,
            restaurantName,
            branchId: branchId ?? baseCart.branchId,
            items: existing
              ? baseCart.items.map((x) =>
                  x.id === item.id ? { ...x, quantity: x.quantity + 1 } : x
                )
              : [...baseCart.items, { ...item, quantity: 1 }]
          };
        });
      },
      setBranch(branchId) {
        setCart((current) => ({ ...current, branchId }));
      },
      updateQuantity(itemId, quantity) {
        setCart((current) => ({
          ...current,
          items:
            quantity <= 0
              ? current.items.filter((item) => item.id !== itemId)
              : current.items.map((item) =>
                  item.id === itemId ? { ...item, quantity } : item
                )
        }));
      },
      clearCart() {
        setCart({ restaurantId: null, restaurantName: "", branchId: null, items: [] });
      }
    }),
    [cart]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used inside CartProvider");
  }
  return context;
}

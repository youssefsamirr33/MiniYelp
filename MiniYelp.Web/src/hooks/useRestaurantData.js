import { useEffect, useState } from "react";
import {
  getRestaurantById,
  getRestaurantMenu,
  getRestaurantReviews
} from "../lib/restaurants";

export function useRestaurantData(id, { includeReviews = false, includeMenu = false } = {}) {
  const [restaurant, setRestaurant] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [menuSections, setMenuSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError("");

      try {
        const requests = [getRestaurantById(id)];

        if (includeReviews) {
          requests.push(getRestaurantReviews(id));
        }

        if (includeMenu) {
          requests.push(getRestaurantMenu(id));
        }

        const responses = await Promise.all(requests);
        const [restaurantResponse, maybeReviews, maybeMenu] = responses;

        setRestaurant(restaurantResponse);
        setReviews(includeReviews ? maybeReviews || [] : []);
        setMenuSections(includeMenu ? (includeReviews ? maybeMenu : maybeReviews) || [] : []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [id, includeReviews, includeMenu]);

  return {
    restaurant,
    reviews,
    setReviews,
    menuSections,
    loading,
    error,
    setError
  };
}

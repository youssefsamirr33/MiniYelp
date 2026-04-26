import { apiRequest } from "./api";

export function getRestaurants(filters = {}) {
  const query = new URLSearchParams();

  if (filters.city) {
    query.set("city", filters.city);
  }

  if (filters.cuisineId) {
    query.set("cuisineId", filters.cuisineId);
  }

  if (filters.priceRange) {
    query.set("priceRange", filters.priceRange);
  }

  const suffix = query.toString() ? `?${query.toString()}` : "";
  return apiRequest(`/api/restaurants${suffix}`);
}

export function getRestaurantById(id) {
  return apiRequest(`/api/restaurants/${id}`);
}

export function getCuisines() {
  return apiRequest("/api/restaurants/cuisines");
}

export function getRestaurantReviews(restaurantId) {
  return apiRequest(`/api/restaurants/${restaurantId}/reviews`);
}

export function getRestaurantMenu(restaurantId) {
  return apiRequest(`/api/restaurants/${restaurantId}/menu`);
}

export function createReview(payload, token) {
  return apiRequest("/api/reviews", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(payload)
  });
}

export function createReservation(payload, token) {
  return apiRequest("/api/reservations", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(payload)
  });
}

export function getMyReservations(token) {
  return apiRequest("/api/reservations/my", {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
}

export function createOrder(payload, token) {
  return apiRequest("/api/orders", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(payload)
  });
}

export function getMyOrders(token) {
  return apiRequest("/api/orders/my", {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
}

import { API_BASE_URL } from "../config";

async function parseResponse(response) {
  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    const message =
      data?.error ||
      Object.values(data?.errors || {}).flat().join(" ") ||
      "Request failed.";
    throw new Error(message);
  }

  return data;
}

export async function apiRequest(path, options = {}) {
  const { headers, ...restOptions } = options;

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...restOptions,
    headers: {
      "Content-Type": "application/json",
      ...(headers || {})
    }
  });

  return parseResponse(response);
}

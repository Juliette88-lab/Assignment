import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import { API_BASE_URL } from "./config";

// Get the saved authentication token.
async function getAccessToken() {
  let token = null;

  if (Platform.OS === "web") {
    token = globalThis.localStorage?.getItem("accessToken") ?? null;
  } else {
    token = await SecureStore.getItemAsync("accessToken");
  }

  if (!token) {
    throw new Error("Please log in before accessing your orders.");
  }

  return token;
}

// Prepare headers for authenticated requests.
async function getAuthHeaders(includeJson = false) {
  const token = await getAccessToken();

  return {
    Accept: "application/json",
    ...(includeJson ? { "Content-Type": "application/json" } : {}),
    Authorization: `Bearer ${token}`,
  };
}

// Read the server response safely.
async function readResponse(response) {
  const text = await response.text();
  let data = {};

  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    throw new Error("The server returned an invalid response.");
  }

  if (!response.ok) {
    throw new Error(data.message || "The request failed.");
  }

  return data;
}

// Create a new order for the logged-in user.
export async function createOrder(orderData) {
  const headers = await getAuthHeaders(true);

  const response = await fetch(`${API_BASE_URL}/api/orders`, {
    method: "POST",
    headers,
    body: JSON.stringify(orderData),
  });

  const data = await readResponse(response);
  return data.order;
}

// Get orders belonging to the logged-in user.
export async function getOrders() {
  const headers = await getAuthHeaders();

  const response = await fetch(`${API_BASE_URL}/api/orders`, {
    method: "GET",
    headers,
  });

  const data = await readResponse(response);
  return data.orders;
}

// Get one order by ID.
export async function getOrderById(id) {
  const headers = await getAuthHeaders();

  const response = await fetch(
    `${API_BASE_URL}/api/orders/${encodeURIComponent(id)}`,
    {
      method: "GET",
      headers,
    },
  );

  const data = await readResponse(response);
  return data.order;
}

// Delete one order by ID.
export async function deleteOrder(id) {
  const headers = await getAuthHeaders();

  const response = await fetch(
    `${API_BASE_URL}/api/orders/${encodeURIComponent(id)}`,
    {
      method: "DELETE",
      headers,
    },
  );

  return await readResponse(response);
}

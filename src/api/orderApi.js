import { API_BASE_URL } from "./config";

// Create a new order
export async function createOrder(orderData) {
  const response = await fetch(`${API_BASE_URL}/api/orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(orderData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to create order.");
  }

  return data.order;
}

// Get all orders
export async function getOrders() {
  const response = await fetch(`${API_BASE_URL}/api/orders`, {
    headers: {
      Accept: "application/json",
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to load orders.");
  }

  return data.orders;
}

// Get one order by ID
export async function getOrderById(id) {
  const response = await fetch(`${API_BASE_URL}/api/orders/${id}`, {
    headers: {
      Accept: "application/json",
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Order not found.");
  }

  return data.order;
}

// Delete one order by ID
export async function deleteOrder(id) {
  const response = await fetch(`${API_BASE_URL}/api/orders/${id}`, {
    method: "DELETE",
    headers: {
      Accept: "application/json",
    },
  });

  const text = await response.text();
  let data = {};

  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = {};
  }

  if (!response.ok) {
    throw new Error(data.message || "Failed to delete order.");
  }

  return data;
}

import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { getOrderById } from "../api/orderApi";

export default function OrderDetailsScreen({ route }) {
  const { orderId } = route.params || {};

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadOrder() {
      try {
        const result = await getOrderById(orderId);
        if (active) setOrder(result);
      } catch (e) {
        if (active) setError(e.message || "Could not load order.");
      } finally {
        if (active) setLoading(false);
      }
    }

    loadOrder();

    return () => {
      active = false;
    };
  }, [orderId]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text>Loading order...</Text>
      </View>
    );
  }

  if (error || !order) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>{error || "Order not found."}</Text>
      </View>
    );
  }

  const formatPrice = (value) => `${Number(value).toLocaleString()} RWF`;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Order Details</Text>
      <Text style={styles.orderNumber}>{order.orderNumber}</Text>

      <View style={styles.card}>
        <Text style={styles.heading}>Delivery Information</Text>
        <Text style={styles.text}>Name: {order.fullName}</Text>
        <Text style={styles.text}>Phone: {order.phone}</Text>
        <Text style={styles.text}>Address: {order.address}</Text>
        <Text style={styles.text}>Status: {order.status}</Text>
        <Text style={styles.text}>
          Date: {new Date(order.createdAt).toLocaleString()}
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.heading}>Products</Text>

        {order.items.map((item) => (
          <View key={String(item.id)} style={styles.item}>
            <View style={{ flex: 1 }}>
              <Text style={styles.productName}>{item.name}</Text>
              <Text style={styles.text}>Quantity: {item.quantity}</Text>
            </View>
            <Text style={styles.price}>{formatPrice(item.subtotal)}</Text>
          </View>
        ))}

        <View style={styles.divider} />

        <View style={styles.totalRow}>
          <Text style={styles.heading}>Total</Text>
          <Text style={styles.total}>{formatPrice(order.total)}</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 18,
    backgroundColor: "#F8FAFC",
    flexGrow: 1,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 27,
    fontWeight: "bold",
    color: "#172554",
  },
  orderNumber: {
    fontSize: 16,
    color: "#8A5A35",
    fontWeight: "bold",
    marginTop: 8,
    marginBottom: 16,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  heading: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#172554",
    marginBottom: 10,
  },
  text: {
    color: "#475569",
    marginTop: 6,
    lineHeight: 20,
  },
  item: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
    paddingVertical: 12,
  },
  productName: {
    fontWeight: "600",
    color: "#1E293B",
  },
  price: {
    fontWeight: "bold",
    color: "#8A5A35",
  },
  divider: {
    height: 1,
    backgroundColor: "#E2E8F0",
    marginVertical: 12,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  total: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#15803D",
  },
  error: {
    color: "#B42318",
  },
});

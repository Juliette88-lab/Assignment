import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View
} from "react-native";

import { deleteOrder, getOrders } from "../api/orderApi";

export default function OrdersScreen({ navigation }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [message, setMessage] = useState("");
  const [messageTitle, setMessageTitle] = useState("");
  const [messageVisible, setMessageVisible] = useState(false);

  const loadOrders = useCallback(async (refresh = false) => {
    if (refresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const result = await getOrders();
      setOrders(Array.isArray(result) ? result : []);
      setError("");
    } catch (e) {
      console.error("Load orders error:", e);
      setError(e.message || "Could not load orders.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadOrders();
    }, [loadOrders]),
  );

  const showMessage = (title, text) => {
    setMessageTitle(title);
    setMessage(text);
    setMessageVisible(true);
  };

  const closeMessage = () => {
    setMessageVisible(false);
  };

  const confirmDelete = (order) => {
    if (deleting) return;

    const orderId = order.id ?? order._id;

    if (orderId == null || orderId === "") {
      showMessage("Cannot Delete", "This order does not have a valid ID.");
      return;
    }

    setSelectedOrder(order);
  };

  const handleDelete = async () => {
    if (!selectedOrder || deleting) return;

    const order = selectedOrder;
    const orderId = order.id ?? order._id;

    setDeleting(true);

    try {
      await deleteOrder(orderId);

      setOrders((previousOrders) =>
        previousOrders.filter(
          (item) => String(item.id ?? item._id) !== String(orderId),
        ),
      );

      setSelectedOrder(null);

      showMessage("Order Deleted", "The order was deleted successfully.");
    } catch (e) {
      console.error("Delete order error:", e);

      setSelectedOrder(null);

      showMessage(
        "Delete Failed",
        e.message || "Could not delete the order. Please try again.",
      );
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#173B32" />
        <Text style={styles.loadingText}>Loading orders...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Orders</Text>

      {error ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>{error}</Text>

          <Pressable style={styles.retryButton} onPress={() => loadOrders()}>
            <Text style={styles.buttonText}>Try Again</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item, index) => String(item.id ?? item._id ?? index)}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => loadOrders(true)}
              colors={["#173B32"]}
            />
          }
          contentContainerStyle={
            orders.length === 0 ? styles.emptyContainer : undefined
          }
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              You have not placed any orders yet.
            </Text>
          }
          renderItem={({ item }) => {
            const orderId = item.id ?? item._id;
            const isThisDeleting =
              deleting &&
              selectedOrder != null &&
              String(selectedOrder.id ?? selectedOrder._id) === String(orderId);

            return (
              <View style={styles.card}>
                <Pressable
                  onPress={() => {
                    if (orderId == null) {
                      showMessage(
                        "Error",
                        "This order does not have a valid ID.",
                      );
                      return;
                    }

                    navigation.navigate("OrderDetails", {
                      orderId,
                    });
                  }}
                >
                  <Text style={styles.orderNumber}>
                    {item.orderNumber || `Order #${orderId ?? ""}`}
                  </Text>

                  <Text style={styles.info}>
                    {item.createdAt
                      ? new Date(item.createdAt).toLocaleString()
                      : "Date unavailable"}
                  </Text>

                  <Text style={styles.info}>
                    {Array.isArray(item.items) ? item.items.length : 0} product
                    type(s)
                  </Text>

                  <Text style={styles.total}>
                    {Number(item.total || 0).toLocaleString()} RWF
                  </Text>

                  <Text style={styles.status}>
                    Status: {item.status || "Pending"}
                  </Text>

                  <Text style={styles.detailsLink}>View Details →</Text>
                </Pressable>

                <Pressable
                  style={[
                    styles.deleteButton,
                    deleting && styles.disabledButton,
                  ]}
                  onPress={() => confirmDelete(item)}
                  disabled={deleting}
                >
                  {isThisDeleting ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={styles.deleteButtonText}>Delete Order</Text>
                  )}
                </Pressable>
              </View>
            );
          }}
        />
      )}

      {/* Confirmation popup */}
      <Modal
        visible={selectedOrder !== null}
        transparent
        animationType="fade"
        onRequestClose={() => {
          if (!deleting) setSelectedOrder(null);
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.warningIcon}>
              <Text style={styles.warningIconText}>!</Text>
            </View>

            <Text style={styles.modalTitle}>Delete Order?</Text>

            <Text style={styles.modalMessage}>
              Are you sure you want to delete{" "}
              {selectedOrder?.orderNumber ||
                (selectedOrder
                  ? `Order #${selectedOrder.id ?? selectedOrder._id}`
                  : "this order")}
              ? This action cannot be undone.
            </Text>

            <View style={styles.modalActions}>
              <Pressable
                style={styles.cancelButton}
                disabled={deleting}
                onPress={() => setSelectedOrder(null)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </Pressable>

              <Pressable
                style={[
                  styles.confirmDeleteButton,
                  deleting && styles.disabledButton,
                ]}
                disabled={deleting}
                onPress={handleDelete}
              >
                {deleting ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.confirmDeleteText}>Delete</Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Success or error popup */}
      <Modal
        visible={messageVisible}
        transparent
        animationType="fade"
        onRequestClose={closeMessage}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View
              style={[
                styles.resultIcon,
                messageTitle === "Order Deleted"
                  ? styles.successIcon
                  : styles.errorIcon,
              ]}
            >
              <Text style={styles.resultIconText}>
                {messageTitle === "Order Deleted" ? "✓" : "!"}
              </Text>
            </View>

            <Text style={styles.modalTitle}>{messageTitle}</Text>

            <Text style={styles.modalMessage}>{message}</Text>

            <Pressable style={styles.okButton} onPress={closeMessage}>
              <Text style={styles.buttonText}>OK</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    padding: 16,
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
    color: "#173B32",
    marginBottom: 16,
  },
  card: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 14,
    marginBottom: 13,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  orderNumber: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#173B32",
  },
  info: {
    color: "#64748B",
    marginTop: 7,
    fontSize: 13,
  },
  total: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 10,
    color: "#8A5A35",
  },
  status: {
    marginTop: 7,
    color: "#15803D",
    fontWeight: "600",
  },
  detailsLink: {
    marginTop: 12,
    color: "#173B32",
    fontWeight: "bold",
  },
  deleteButton: {
    backgroundColor: "#B91C1C",
    padding: 13,
    borderRadius: 9,
    marginTop: 15,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 46,
  },
  deleteButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 15,
  },
  disabledButton: {
    opacity: 0.6,
  },
  loadingText: {
    marginTop: 10,
    color: "#64748B",
  },
  emptyContainer: {
    flexGrow: 1,
  },
  emptyText: {
    textAlign: "center",
    color: "#64748B",
    marginTop: 40,
  },
  errorText: {
    color: "#B42318",
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: "#173B32",
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.55)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalCard: {
    width: "100%",
    maxWidth: 380,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    elevation: 8,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
  },
  warningIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#FEE2E2",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
  },
  warningIconText: {
    color: "#B91C1C",
    fontSize: 32,
    fontWeight: "bold",
  },
  modalTitle: {
    color: "#173B32",
    fontSize: 21,
    fontWeight: "bold",
    textAlign: "center",
  },
  modalMessage: {
    color: "#64748B",
    fontSize: 14,
    lineHeight: 22,
    textAlign: "center",
    marginTop: 12,
    marginBottom: 22,
  },
  modalActions: {
    flexDirection: "row",
    width: "100%",
    gap: 10,
  },
  cancelButton: {
    flex: 1,
    minHeight: 46,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 8,
  },
  cancelButtonText: {
    color: "#334155",
    fontWeight: "bold",
  },
  confirmDeleteButton: {
    flex: 1,
    minHeight: 46,
    borderRadius: 10,
    backgroundColor: "#B91C1C",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 8,
  },
  confirmDeleteText: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  resultIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
  },
  successIcon: {
    backgroundColor: "#DCFCE7",
  },
  errorIcon: {
    backgroundColor: "#FEE2E2",
  },
  resultIconText: {
    fontSize: 29,
    fontWeight: "bold",
    color: "#173B32",
  },
  okButton: {
    width: "100%",
    minHeight: 46,
    backgroundColor: "#173B32",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
});

import { useState } from "react";
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { createOrder } from "../api/orderApi";
import { useCart } from "../context/CartContext";

export default function CheckoutScreen({ navigation }) {
  const { cartItems, total, clearCart } = useCart();

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);

  // State for the custom popup
  const [popupVisible, setPopupVisible] = useState(false);
  const [popupTitle, setPopupTitle] = useState("");
  const [popupMessage, setPopupMessage] = useState("");
  const [popupType, setPopupType] = useState("error");
  const [successOrder, setSuccessOrder] = useState(null);

  const formatPrice = (price) => `${Number(price || 0).toLocaleString()} RWF`;

  const showPopup = (title, message, type = "error") => {
    setPopupTitle(title);
    setPopupMessage(message);
    setPopupType(type);
    setPopupVisible(true);
  };

  const closePopup = () => {
    setPopupVisible(false);
  };

  const handlePopupAction = (action) => {
    setPopupVisible(false);

    if (action === "orders") {
      navigation.navigate("Orders");
    } else if (action === "products") {
      navigation.navigate("Products");
    }
  };

  const placeOrder = async () => {
    if (loading) return;

    // Check whether the cart is empty
    if (!cartItems || cartItems.length === 0) {
      showPopup(
        "Your Cart Is Empty",
        "Please add at least one product to your cart before placing an order.",
      );
      return;
    }

    // Check required fields
    const missingFields = [];

    if (!fullName.trim()) missingFields.push("Full Name");
    if (!phone.trim()) missingFields.push("Phone Number");
    if (!address.trim()) missingFields.push("Delivery Address");

    if (missingFields.length > 0) {
      showPopup(
        "Order Not Placed",
        `Please complete the following required field(s):\n\n${missingFields
          .map((field) => `• ${field}`)
          .join("\n")}`,
      );
      return;
    }

    // Basic phone number validation
    const phoneDigits = phone.replace(/\D/g, "");

    if (phoneDigits.length < 9 || phoneDigits.length > 15) {
      showPopup(
        "Invalid Phone Number",
        "Please enter a valid phone number with 9 to 15 digits.",
      );
      return;
    }

    setLoading(true);

    try {
      const order = await createOrder({
        fullName: fullName.trim(),
        phone: phone.trim(),
        address: address.trim(),
        items: cartItems.map((item) => ({
          id: item.id,
          quantity: item.quantity,
        })),
      });

      // Clear cart only after the server confirms success
      clearCart();
      setSuccessOrder(order);

      showPopup(
        "Order Placed Successfully!",
        `Your order has been submitted successfully.\n\nOrder Number: ${
          order?.orderNumber || order?.id || order?._id || "Confirmed"
        }\nTotal: ${formatPrice(order?.total ?? total)}`,
        "success",
      );
    } catch (error) {
      showPopup(
        "Order Failed",
        error?.message ||
          "Your order could not be submitted. Please check your connection and try again.",
        "error",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Checkout</Text>
        <Text style={styles.subtitle}>Enter your delivery information</Text>

        <Text style={styles.label}>Full Name *</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your full name"
          value={fullName}
          onChangeText={setFullName}
          autoCapitalize="words"
          editable={!loading}
        />

        <Text style={styles.label}>Phone Number *</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your phone number"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
          editable={!loading}
        />

        <Text style={styles.label}>Delivery Address *</Text>
        <TextInput
          style={[styles.input, styles.addressInput]}
          placeholder="Enter your delivery address"
          value={address}
          onChangeText={setAddress}
          multiline
          editable={!loading}
        />

        <Text style={styles.requiredNote}>* All fields are required.</Text>

        <View style={styles.summary}>
          <Text style={styles.summaryTitle}>Order Summary</Text>

          {cartItems.map((item) => (
            <View key={String(item.id)} style={styles.orderItem}>
              <Text style={styles.productName}>
                {item.name} x {item.quantity}
              </Text>
              <Text style={styles.price}>
                {formatPrice(Number(item.price) * item.quantity)}
              </Text>
            </View>
          ))}

          {cartItems.length === 0 && (
            <Text style={styles.emptyCartText}>No products in your cart.</Text>
          )}

          <View style={styles.divider} />

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalPrice}>{formatPrice(total)}</Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.orderButton, loading && styles.disabledButton]}
          onPress={placeOrder}
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <View style={styles.loadingRow}>
              <ActivityIndicator color="#FFFFFF" />
              <Text style={styles.orderButtonText}>{"  "}Placing Order...</Text>
            </View>
          ) : (
            <Text style={styles.orderButtonText}>Place Order</Text>
          )}
        </TouchableOpacity>

        <Text style={styles.footer}>D&G STORE · QUALITY AND STYLE</Text>
      </ScrollView>

      {/* Custom popup for errors and successful orders */}
      <Modal
        visible={popupVisible}
        transparent
        animationType="fade"
        onRequestClose={closePopup}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View
              style={[
                styles.iconCircle,
                popupType === "success"
                  ? styles.successCircle
                  : styles.errorCircle,
              ]}
            >
              <Text style={styles.popupIcon}>
                {popupType === "success" ? "✓" : "!"}
              </Text>
            </View>

            <Text style={styles.popupTitle}>{popupTitle}</Text>

            <Text style={styles.popupMessage}>{popupMessage}</Text>

            {popupType === "success" ? (
              <View style={styles.popupActions}>
                <TouchableOpacity
                  style={styles.primaryPopupButton}
                  onPress={() => handlePopupAction("orders")}
                >
                  <Text style={styles.primaryPopupText}>View My Orders</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.secondaryPopupButton}
                  onPress={() => handlePopupAction("products")}
                >
                  <Text style={styles.secondaryPopupText}>
                    Continue Shopping
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.primaryPopupButton}
                onPress={closePopup}
              >
                <Text style={styles.primaryPopupText}>OK, Got It</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  container: {
    padding: 20,
    flexGrow: 1,
    paddingBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#172554",
  },
  subtitle: {
    fontSize: 15,
    color: "#64748B",
    marginTop: 6,
    marginBottom: 20,
  },
  label: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 7,
    marginTop: 12,
    color: "#1E293B",
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 10,
    padding: 13,
    fontSize: 15,
    color: "#1E293B",
  },
  addressInput: {
    minHeight: 85,
    textAlignVertical: "top",
  },
  requiredNote: {
    color: "#64748B",
    fontSize: 12,
    marginTop: 8,
  },
  summary: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 12,
    marginTop: 25,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  summaryTitle: {
    fontSize: 19,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#172554",
  },
  orderItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
    gap: 10,
  },
  productName: {
    flex: 1,
    fontSize: 14,
    color: "#334155",
  },
  price: {
    fontSize: 14,
    fontWeight: "600",
    color: "#334155",
  },
  emptyCartText: {
    color: "#B42318",
    fontSize: 14,
  },
  divider: {
    height: 1,
    backgroundColor: "#E2E8F0",
    marginVertical: 12,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#172554",
  },
  totalPrice: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#15803D",
  },
  orderButton: {
    backgroundColor: "#172554",
    padding: 16,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 22,
    marginBottom: 20,
    minHeight: 54,
    justifyContent: "center",
  },
  disabledButton: {
    backgroundColor: "#94A3B8",
  },
  orderButtonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "bold",
  },
  loadingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  footer: {
    textAlign: "center",
    fontSize: 10,
    letterSpacing: 1.5,
    color: "#8B837B",
    marginTop: 4,
  },

  // Popup styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.60)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalCard: {
    width: "100%",
    maxWidth: 400,
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 25,
    alignItems: "center",
    elevation: 12,
    shadowColor: "#000000",
    shadowOpacity: 0.2,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
  },
  iconCircle: {
    width: 66,
    height: 66,
    borderRadius: 33,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  errorCircle: {
    backgroundColor: "#FEE2E2",
  },
  successCircle: {
    backgroundColor: "#DCFCE7",
  },
  popupIcon: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#172554",
  },
  popupTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#172554",
    textAlign: "center",
    marginBottom: 12,
  },
  popupMessage: {
    fontSize: 15,
    color: "#475569",
    lineHeight: 23,
    textAlign: "center",
    marginBottom: 22,
  },
  popupActions: {
    width: "100%",
    gap: 10,
  },
  primaryPopupButton: {
    width: "100%",
    backgroundColor: "#172554",
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 10,
    alignItems: "center",
  },
  primaryPopupText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  secondaryPopupButton: {
    width: "100%",
    backgroundColor: "#F1F5F9",
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 10,
    alignItems: "center",
  },
  secondaryPopupText: {
    color: "#172554",
    fontSize: 15,
    fontWeight: "700",
  },
});

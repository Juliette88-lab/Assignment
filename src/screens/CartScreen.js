import {
  Alert,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { useCart } from "../context/CartContext";

export default function CartScreen({ navigation }) {
  const { cartItems, updateQuantity, removeFromCart, total } = useCart();

  const formatPrice = (price) => `${Number(price).toLocaleString()} RWF`;

  function handleRemove(item) {
    Alert.alert("Remove product", `Remove ${item.name} from your cart?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: () => removeFromCart(item.id),
      },
    ]);
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Cart</Text>
        <Text style={styles.subtitle}>
          {cartItems.reduce((sum, item) => sum + item.quantity, 0)} item(s) in
          your cart
        </Text>
      </View>

      <FlatList
        data={cartItems}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={
          cartItems.length === 0 ? styles.emptyContainer : styles.list
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>🛍️</Text>
            <Text style={styles.emptyTitle}>Your cart is empty</Text>
            <Text style={styles.emptyText}>
              Explore our products and add your favourites.
            </Text>

            <TouchableOpacity
              style={styles.shopButton}
              onPress={() => navigation.navigate("Products")}
            >
              <Text style={styles.shopButtonText}>Continue Shopping</Text>
            </TouchableOpacity>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.item}>
            {item.image ? (
              <Image
                source={{ uri: item.image }}
                style={styles.productImage}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.imagePlaceholder}>
                <Text style={styles.placeholderText}>No image</Text>
              </View>
            )}

            <View style={styles.details}>
              <Text style={styles.category}>{item.category ?? "Product"}</Text>

              <Text style={styles.name}>{item.name}</Text>

              <Text style={styles.price}>{formatPrice(item.price)}</Text>

              <View style={styles.bottomRow}>
                <View style={styles.quantityControl}>
                  <TouchableOpacity
                    style={styles.quantityButton}
                    onPress={() => updateQuantity(item.id, item.quantity - 1)}
                  >
                    <Text style={styles.quantityButtonText}>−</Text>
                  </TouchableOpacity>

                  <Text style={styles.quantity}>{item.quantity}</Text>

                  <TouchableOpacity
                    style={styles.quantityButton}
                    onPress={() => updateQuantity(item.id, item.quantity + 1)}
                  >
                    <Text style={styles.quantityButtonText}>+</Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity onPress={() => handleRemove(item)}>
                  <Text style={styles.removeText}>Remove</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.lineTotal}>
                Subtotal: {formatPrice(Number(item.price) * item.quantity)}
              </Text>
            </View>
          </View>
        )}
      />

      {cartItems.length > 0 && (
        <View style={styles.summary}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>{formatPrice(total)}</Text>
          </View>

          <Text style={styles.deliveryNote}>
            Delivery fee will be calculated at checkout.
          </Text>

          <View style={styles.divider} />

          <View style={styles.summaryRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>{formatPrice(total)}</Text>
          </View>

          <TouchableOpacity
            style={styles.checkoutButton}
            onPress={() => navigation.navigate("Checkout")}
          >
            <Text style={styles.checkoutText}>Proceed to Checkout →</Text>
          </TouchableOpacity>

          <Text style={styles.secureNote}>D&G STORE · QUALITY AND STYLE</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F7F5",
  },

  header: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: "#EAE6E1",
  },

  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#25211E",
  },

  subtitle: {
    fontSize: 13,
    color: "#77716B",
    marginTop: 5,
  },

  list: {
    padding: 14,
    paddingBottom: 20,
  },

  emptyContainer: {
    flexGrow: 1,
    justifyContent: "center",
  },

  empty: {
    alignItems: "center",
    padding: 24,
  },

  emptyIcon: {
    fontSize: 48,
    marginBottom: 14,
  },

  emptyTitle: {
    fontSize: 21,
    fontWeight: "800",
    color: "#25211E",
  },

  emptyText: {
    marginTop: 8,
    color: "#77716B",
    textAlign: "center",
    lineHeight: 21,
  },

  shopButton: {
    backgroundColor: "#25211E",
    paddingVertical: 13,
    paddingHorizontal: 22,
    borderRadius: 9,
    marginTop: 20,
  },

  shopButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },

  item: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000000",
    shadowOpacity: 0.06,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },

  productImage: {
    width: 105,
    height: 125,
    borderRadius: 10,
    backgroundColor: "#EEEAE5",
  },

  imagePlaceholder: {
    width: 105,
    height: 125,
    borderRadius: 10,
    backgroundColor: "#EEEAE5",
    alignItems: "center",
    justifyContent: "center",
  },

  placeholderText: {
    color: "#77716B",
    fontSize: 11,
  },

  details: {
    flex: 1,
    marginLeft: 13,
    justifyContent: "center",
  },

  category: {
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 1,
    color: "#8A5A35",
    marginBottom: 5,
  },

  name: {
    fontSize: 16,
    fontWeight: "700",
    color: "#25211E",
  },

  price: {
    color: "#8A5A35",
    fontSize: 15,
    fontWeight: "800",
    marginTop: 7,
  },

  bottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    marginTop: 10,
    gap: 8,
  },

  quantityControl: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5DED6",
    borderRadius: 7,
    overflow: "hidden",
  },

  quantityButton: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F5F1EC",
  },

  quantityButtonText: {
    fontSize: 20,
    color: "#25211E",
    fontWeight: "600",
  },

  quantity: {
    minWidth: 30,
    textAlign: "center",
    color: "#25211E",
    fontWeight: "700",
  },

  removeText: {
    color: "#B42318",
    fontSize: 12,
    fontWeight: "600",
  },

  lineTotal: {
    marginTop: 9,
    fontSize: 12,
    color: "#77716B",
  },

  summary: {
    padding: 18,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#EAE6E1",
  },

  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginVertical: 5,
  },

  summaryLabel: {
    color: "#77716B",
    fontSize: 14,
  },

  summaryValue: {
    color: "#25211E",
    fontWeight: "600",
  },

  deliveryNote: {
    fontSize: 11,
    color: "#77716B",
    marginTop: 6,
  },

  divider: {
    height: 1,
    backgroundColor: "#EAE6E1",
    marginVertical: 12,
  },

  totalLabel: {
    fontSize: 18,
    fontWeight: "800",
    color: "#25211E",
  },

  totalValue: {
    fontSize: 20,
    fontWeight: "800",
    color: "#8A5A35",
  },

  checkoutButton: {
    marginTop: 16,
    backgroundColor: "#25211E",
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: "center",
  },

  checkoutText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },

  secureNote: {
    textAlign: "center",
    marginTop: 12,
    fontSize: 10,
    letterSpacing: 1.5,
    color: "#8B837B",
  },
});

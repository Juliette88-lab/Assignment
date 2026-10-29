import { Alert, Image, Pressable, StyleSheet, Text, View } from "react-native";

import { useCart } from "../context/CartContext";

export default function ProductCard({ product, onPress }) {
  const { addToCart } = useCart();

  function handleAddToCart() {
    addToCart(product);

    Alert.alert(
      "Added to Cart",
      `${product.name || product.title} has been added to your cart.`,
    );
  }

  return (
    <View style={styles.card}>
      {/* PRODUCT IMAGE */}
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.imageContainer,
          pressed && styles.pressed,
        ]}
      >
        {product.image ? (
          <Image
            source={{ uri: product.image }}
            style={styles.image}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Text style={styles.placeholderText}>D&G</Text>
          </View>
        )}

        <View style={styles.categoryBadge}>
          <Text style={styles.categoryText}>
            {product.category || "Fashion"}
          </Text>
        </View>
      </Pressable>

      {/* PRODUCT DETAILS */}
      <View style={styles.details}>
        <Pressable onPress={onPress}>
          <Text style={styles.productName} numberOfLines={1}>
            {product.name || product.title}
          </Text>

          <Text style={styles.description}>
            Quality products for your style
          </Text>
        </Pressable>

        {/* PRICE AND ADD BUTTON */}
        <View style={styles.bottomRow}>
          <Text style={styles.price}>
            {Number(product.price || 0).toLocaleString()} RWF
          </Text>

          <Pressable
            onPress={handleAddToCart}
            accessibilityRole="button"
            accessibilityLabel={`Add ${product.name || product.title} to cart`}
            style={({ pressed }) => [
              styles.addButton,
              pressed && styles.addButtonPressed,
            ]}
          >
            <Text style={styles.addButtonText}>+</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    margin: 7,
    maxWidth: 420,
    minWidth: 0,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#EEEEEE",
    elevation: 3,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 5,
  },

  pressed: {
    opacity: 0.88,
  },

  imageContainer: {
    height: 190,
    backgroundColor: "#F3F0EC",
    position: "relative",
  },

  image: {
    width: "100%",
    height: "100%",
  },

  imagePlaceholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E8E0D7",
  },

  placeholderText: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#29221D",
    letterSpacing: 4,
  },

  categoryBadge: {
    position: "absolute",
    top: 10,
    left: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
  },

  categoryText: {
    color: "#333333",
    fontSize: 11,
    fontWeight: "600",
  },

  details: {
    padding: 13,
  },

  productName: {
    fontSize: 17,
    fontWeight: "700",
    color: "#202020",
  },

  description: {
    marginTop: 5,
    fontSize: 12,
    color: "#777777",
  },

  bottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 14,
  },

  price: {
    fontSize: 15,
    fontWeight: "700",
    color: "#8A5A35",
    flexShrink: 1,
  },

  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#242424",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 6,
  },

  addButtonPressed: {
    backgroundColor: "#8A5A35",
    transform: [{ scale: 0.94 }],
  },

  addButtonText: {
    color: "#FFFFFF",
    fontSize: 24,
    lineHeight: 28,
  },
});

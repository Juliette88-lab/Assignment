import { useState } from "react";
import {
  Button,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { useCart } from "../context/CartContext";

export default function ProductDetailsScreen({ route, navigation }) {
  const { product } = route.params;
  const { addToCart } = useCart();

  const [showPopup, setShowPopup] = useState(false);

  const handleAdd = () => {
    addToCart(product);
    setShowPopup(true);
  };

  const handleContinueShopping = () => {
    setShowPopup(false);
  };

  const handleViewCart = () => {
    setShowPopup(false);
    navigation.navigate("Cart");
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {product.image ? (
        <Image source={{ uri: product.image }} style={styles.image} />
      ) : null}

      <Text style={styles.title}>{product.name}</Text>

      <Text style={styles.price}>
        {Number(product.price).toLocaleString()} RWF
      </Text>

      <Text style={styles.category}>
        Category: {product.category || "General"}
      </Text>

      <Text style={styles.description}>
        {product.description || "No description available."}
      </Text>

      {/* Add to Cart button */}
      <View style={styles.addButton}>
        <Button title="Add to Cart" color="#173B32" onPress={handleAdd} />
      </View>

      {/* View Cart button */}
      <View style={styles.button}>
        <Button
          title="View Cart"
          color="#555555"
          onPress={() => navigation.navigate("Cart")}
        />
      </View>

      {/* Success Popup */}
      <Modal
        transparent={true}
        visible={showPopup}
        animationType="fade"
        onRequestClose={() => setShowPopup(false)}
      >
        <View style={styles.overlay}>
          <View style={styles.popup}>
            <View style={styles.successCircle}>
              <Text style={styles.successIcon}>✓</Text>
            </View>

            <Text style={styles.popupTitle}>Added Successfully!</Text>

            <Text style={styles.popupMessage}>
              {product.name} has been added to your cart.
            </Text>

            <Pressable
              style={styles.continueButton}
              onPress={handleContinueShopping}
            >
              <Text style={styles.continueButtonText}>Continue Shopping</Text>
            </Pressable>

            <Pressable style={styles.cartButton} onPress={handleViewCart}>
              <Text style={styles.cartButtonText}>View Cart</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 40,
    backgroundColor: "#FFFFFF",
    flexGrow: 1,
  },

  image: {
    width: "100%",
    height: 260,
    resizeMode: "contain",
    marginBottom: 10,
  },

  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#173B32",
    marginVertical: 12,
  },

  price: {
    color: "#087443",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
  },

  category: {
    color: "#666666",
    fontSize: 15,
    marginVertical: 8,
  },

  description: {
    color: "#444444",
    fontSize: 16,
    lineHeight: 24,
    marginVertical: 16,
  },

  addButton: {
    marginTop: 10,
  },

  button: {
    marginTop: 12,
  },

  // Popup background
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.55)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },

  // Popup box
  popup: {
    width: "100%",
    maxWidth: 350,
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 25,
    alignItems: "center",
    elevation: 10,
  },

  // Green success circle
  successCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#173B32",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 18,
  },

  successIcon: {
    color: "#FFFFFF",
    fontSize: 34,
    fontWeight: "bold",
  },

  popupTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#173B32",
    textAlign: "center",
    marginBottom: 10,
  },

  popupMessage: {
    fontSize: 15,
    color: "#555555",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 22,
  },

  // Continue Shopping button
  continueButton: {
    width: "100%",
    backgroundColor: "#173B32",
    paddingVertical: 13,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 10,
  },

  continueButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "bold",
  },

  // View Cart button inside popup
  cartButton: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#173B32",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },

  cartButtonText: {
    color: "#173B32",
    fontSize: 15,
    fontWeight: "bold",
  },
});

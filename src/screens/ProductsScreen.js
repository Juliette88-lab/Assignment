import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Modal,
  Pressable,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { API_BASE_URL } from "../api/config";
import { useCart } from "../context/CartContext";

const CATEGORIES = [
  "Clothes",
  "Shoes",
  "Bags",
  "Cosmetics",
  "Jewellery",
  "Home equipment",
];

const formatPrice = (price) => `${Number(price || 0).toLocaleString()} RWF`;

const normalize = (value) =>
  String(value ?? "")
    .trim()
    .toLowerCase();

export default function ProductsScreen({ navigation, route }) {
  const { addToCart } = useCart();

  const selectedCategory = route?.params?.category ?? null;
  const initialSearch = route?.params?.searchQuery ?? "";

  const [products, setProducts] = useState([]);
  const [searchText, setSearchText] = useState(initialSearch);
  const [quantities, setQuantities] = useState({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  // Popup state
  const [showPopup, setShowPopup] = useState(false);
  const [popupTitle, setPopupTitle] = useState("Added Successfully!");
  const [popupMessage, setPopupMessage] = useState("");
  const [popupError, setPopupError] = useState(false);

  // Load products from API
  const loadProducts = useCallback(async (refresh = false) => {
    if (refresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError("");

    try {
      const response = await fetch(`${API_BASE_URL}/api/products`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load products.");
      }

      const list = Array.isArray(data) ? data : data.products;

      if (!Array.isArray(list)) {
        throw new Error("The server did not return a valid products list.");
      }

      setProducts(list);
    } catch (err) {
      setError(err.message || "Unable to connect to the server.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  useEffect(() => {
    setSearchText(initialSearch);
  }, [initialSearch]);

  // Filter products
  const filteredProducts = useMemo(() => {
    const query = normalize(searchText);

    return products.filter((product) => {
      const matchesCategory =
        !selectedCategory ||
        normalize(product.category) === normalize(selectedCategory);

      const matchesSearch =
        !query ||
        normalize(product.name).includes(query) ||
        normalize(product.description).includes(query) ||
        normalize(product.category).includes(query);

      return matchesCategory && matchesSearch;
    });
  }, [products, selectedCategory, searchText]);

  // Change quantity
  const changeQuantity = (productId, amount) => {
    if (productId == null) return;

    setQuantities((previous) => {
      const current = previous[productId] || 1;

      return {
        ...previous,
        [productId]: Math.max(1, Math.min(100, current + amount)),
      };
    });
  };

  // Show popup
  const openPopup = (title, message, isError = false) => {
    setPopupTitle(title);
    setPopupMessage(message);
    setPopupError(isError);
    setShowPopup(true);
  };

  // Add product to cart and show popup
  const handleAddToCart = (product) => {
    const productId = product.id ?? product._id;
    const quantity = quantities[productId] || 1;
    const price = Number(product.price);

    if (productId == null) {
      openPopup(
        "Unable to Add Product",
        "This product does not have a valid ID.",
        true,
      );
      return;
    }

    if (!Number.isFinite(price) || price < 0) {
      openPopup("Invalid Price", "This product has an invalid price.", true);
      return;
    }

    try {
      addToCart(product, quantity);

      openPopup(
        "Added Successfully!",
        `${product.name} × ${quantity} has been added to your cart.`,
      );
    } catch (err) {
      openPopup(
        "Something Went Wrong",
        err.message || "Could not add this product to your cart.",
        true,
      );
    }
  };

  // Product card
  const renderProduct = ({ item }) => {
    const productId = item.id ?? item._id;
    const quantity = quantities[productId] || 1;
    const imageUrl = item.image || item.imageUrl;

    return (
      <View style={styles.productCard}>
        {imageUrl ? (
          <Image
            source={{ uri: imageUrl }}
            style={styles.productImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Text style={styles.placeholderEmoji}>🛍️</Text>
            <Text style={styles.placeholderText}>No image</Text>
          </View>
        )}

        <View style={styles.productInfo}>
          <Text style={styles.productName} numberOfLines={2}>
            {item.name || "Unnamed Product"}
          </Text>

          <Text style={styles.productCategory}>{item.category || "Other"}</Text>

          <Text style={styles.productPrice}>{formatPrice(item.price)}</Text>

          <View style={styles.quantityRow}>
            <Pressable
              style={styles.quantityButton}
              onPress={() => changeQuantity(productId, -1)}
              accessibilityLabel="Decrease quantity"
            >
              <Text style={styles.quantityButtonText}>−</Text>
            </Pressable>

            <Text style={styles.quantityValue}>{quantity}</Text>

            <Pressable
              style={styles.quantityButton}
              onPress={() => changeQuantity(productId, 1)}
              accessibilityLabel="Increase quantity"
            >
              <Text style={styles.quantityButtonText}>+</Text>
            </Pressable>
          </View>

          <Text style={styles.subtotal}>
            Total: {formatPrice(Number(item.price) * quantity)}
          </Text>

          <Pressable
            style={styles.addButton}
            onPress={() => handleAddToCart(item)}
          >
            <Text style={styles.addButtonText}>+ Add to Cart</Text>
          </Pressable>

          <Pressable
            style={styles.detailsButton}
            onPress={() =>
              navigation.navigate("ProductDetails", {
                productId,
                product: item,
              })
            }
          >
            <Text style={styles.detailsButtonText}>View Details</Text>
          </Pressable>
        </View>
      </View>
    );
  };

  // Header, search and categories
  const listHeader = (
    <View>
      <View style={styles.header}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Text style={styles.backText}>‹ Back</Text>
        </Pressable>

        <Text style={styles.headerTitle} numberOfLines={1}>
          {selectedCategory || "All Products"}
        </Text>

        <View style={styles.headerSpacer} />
      </View>

      <TextInput
        style={styles.searchInput}
        value={searchText}
        onChangeText={setSearchText}
        placeholder="Search products..."
        placeholderTextColor="#777777"
        autoCapitalize="none"
        returnKeyType="search"
      />

      <View style={styles.categoryList}>
        <Pressable
          style={[styles.categoryChip, !selectedCategory && styles.activeChip]}
          onPress={() => navigation.setParams({ category: null })}
        >
          <Text
            style={[
              styles.categoryChipText,
              !selectedCategory && styles.activeChipText,
            ]}
          >
            All
          </Text>
        </Pressable>

        {CATEGORIES.map((category) => {
          const active = normalize(selectedCategory) === normalize(category);

          return (
            <Pressable
              key={category}
              style={[styles.categoryChip, active && styles.activeChip]}
              onPress={() => navigation.setParams({ category })}
            >
              <Text
                style={[
                  styles.categoryChipText,
                  active && styles.activeChipText,
                ]}
              >
                {category}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );

  // Loading, error and empty states
  const renderEmptyState = () => {
    if (loading) {
      return (
        <View style={styles.centerState}>
          <ActivityIndicator size="large" color="#173B32" />
          <Text style={styles.stateText}>Loading products...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.centerState}>
          <Text style={styles.errorTitle}>Could not load products</Text>
          <Text style={styles.stateText}>{error}</Text>

          <Pressable style={styles.retryButton} onPress={() => loadProducts()}>
            <Text style={styles.retryText}>Try Again</Text>
          </Pressable>
        </View>
      );
    }

    return (
      <View style={styles.centerState}>
        <Text style={styles.placeholderEmoji}>🔎</Text>
        <Text style={styles.errorTitle}>No Products Found</Text>
        <Text style={styles.stateText}>
          Try another category or search term.
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <FlatList
          key={selectedCategory || "all"}
          style={styles.list}
          data={filteredProducts}
          renderItem={renderProduct}
          keyExtractor={(item, index) => String(item.id ?? item._id ?? index)}
          numColumns={2}
          columnWrapperStyle={styles.productRow}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={listHeader}
          ListEmptyComponent={renderEmptyState}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => loadProducts(true)}
              colors={["#173B32"]}
            />
          }
        />

        {/* Add to Cart Popup */}
        <Modal
          transparent
          visible={showPopup}
          animationType="fade"
          onRequestClose={() => setShowPopup(false)}
        >
          <View style={styles.overlay}>
            <View style={styles.popup}>
              <View
                style={[styles.successCircle, popupError && styles.errorCircle]}
              >
                <Text style={styles.successIcon}>{popupError ? "!" : "✓"}</Text>
              </View>

              <Text style={styles.popupTitle}>{popupTitle}</Text>

              <Text style={styles.popupMessage}>{popupMessage}</Text>

              {!popupError && (
                <Pressable
                  style={styles.viewCartButton}
                  onPress={() => {
                    setShowPopup(false);
                    navigation.navigate("Cart");
                  }}
                >
                  <Text style={styles.viewCartButtonText}>View Cart</Text>
                </Pressable>
              )}

              <Pressable
                style={[
                  styles.continueButton,
                  popupError && styles.errorContinueButton,
                ]}
                onPress={() => setShowPopup(false)}
              >
                <Text
                  style={[
                    styles.continueButtonText,
                    popupError && styles.errorContinueButtonText,
                  ]}
                >
                  {popupError ? "Close" : "Continue Shopping"}
                </Text>
              </Pressable>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F5F7F5",
  },

  container: {
    flex: 1,
    minHeight: 0,
    paddingHorizontal: 14,
  },

  list: {
    flex: 1,
    minHeight: 0,
  },

  listContent: {
    paddingBottom: 40,
    flexGrow: 1,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    gap: 8,
  },

  backButton: {
    paddingVertical: 8,
    paddingRight: 8,
  },

  backText: {
    color: "#173B32",
    fontSize: 15,
    fontWeight: "800",
  },

  headerTitle: {
    flex: 1,
    textAlign: "center",
    color: "#173B32",
    fontSize: 19,
    fontWeight: "900",
  },

  headerSpacer: {
    width: 42,
  },

  searchInput: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#DDE3DE",
    borderRadius: 11,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 12,
    color: "#202923",
  },

  categoryList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 14,
  },

  categoryChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#E6EBE7",
  },

  activeChip: {
    backgroundColor: "#173B32",
  },

  categoryChipText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#26332C",
  },

  activeChipText: {
    color: "#FFFFFF",
  },

  productRow: {
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 12,
  },

  productCard: {
    flex: 1,
    minWidth: 0,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E3E8E4",
  },

  productImage: {
    width: "100%",
    height: 140,
    backgroundColor: "#ECEFEC",
  },

  imagePlaceholder: {
    height: 140,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E9EEEA",
  },

  placeholderEmoji: {
    fontSize: 35,
  },

  placeholderText: {
    fontSize: 11,
    color: "#707873",
    marginTop: 5,
  },

  productInfo: {
    padding: 10,
  },

  productName: {
    fontSize: 14,
    fontWeight: "800",
    color: "#202923",
    marginBottom: 5,
  },

  productCategory: {
    fontSize: 11,
    color: "#6B746E",
    marginBottom: 7,
  },

  productPrice: {
    fontSize: 14,
    fontWeight: "900",
    color: "#173B32",
  },

  quantityRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 15,
    marginTop: 12,
  },

  quantityButton: {
    width: 34,
    height: 34,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E7EEE9",
  },

  quantityButtonText: {
    color: "#173B32",
    fontSize: 22,
    fontWeight: "800",
  },

  quantityValue: {
    minWidth: 20,
    textAlign: "center",
    fontSize: 16,
    fontWeight: "800",
    color: "#202923",
  },

  subtotal: {
    fontSize: 12,
    color: "#42574B",
    fontWeight: "700",
    marginTop: 10,
    textAlign: "center",
  },

  addButton: {
    backgroundColor: "#173B32",
    paddingVertical: 11,
    borderRadius: 9,
    alignItems: "center",
    marginTop: 12,
  },

  addButtonText: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 12,
  },

  detailsButton: {
    alignItems: "center",
    paddingVertical: 10,
  },

  detailsButtonText: {
    color: "#346B54",
    fontSize: 12,
    fontWeight: "700",
  },

  centerState: {
    flex: 1,
    minHeight: 200,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },

  stateText: {
    marginTop: 9,
    fontSize: 13,
    lineHeight: 20,
    textAlign: "center",
    color: "#69736D",
  },

  errorTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#26332C",
    textAlign: "center",
    marginTop: 8,
  },

  retryButton: {
    marginTop: 15,
    paddingVertical: 11,
    paddingHorizontal: 22,
    backgroundColor: "#173B32",
    borderRadius: 10,
  },

  retryText: {
    color: "#FFFFFF",
    fontWeight: "800",
  },

  // Popup overlay
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

  successCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#173B32",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 18,
  },

  errorCircle: {
    backgroundColor: "#B3261E",
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

  viewCartButton: {
    width: "100%",
    backgroundColor: "#173B32",
    paddingVertical: 13,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 10,
  },

  viewCartButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "bold",
  },

  continueButton: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#173B32",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },

  continueButtonText: {
    color: "#173B32",
    fontSize: 14,
    fontWeight: "bold",
  },

  errorContinueButton: {
    backgroundColor: "#B3261E",
    borderColor: "#B3261E",
  },

  errorContinueButtonText: {
    color: "#FFFFFF",
  },
});

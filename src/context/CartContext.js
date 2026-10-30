import { createContext, useContext, useMemo, useState } from "react";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);

  // Add a product with the quantity selected by the user
  const addToCart = (product, quantity = 1) => {
    const productId = product.id ?? product._id;
    const selectedQuantity = Math.max(1, Math.min(100, Number(quantity) || 1));

    if (productId == null) {
      throw new Error("This product does not have a valid ID.");
    }

    setCartItems((currentItems) => {
      const existingItem = currentItems.find(
        (item) => String(item.id ?? item._id) === String(productId),
      );

      // If the product already exists, add the selected quantity
      if (existingItem) {
        return currentItems.map((item) =>
          String(item.id ?? item._id) === String(productId)
            ? {
                ...item,
                quantity: Number(item.quantity || 0) + selectedQuantity,
              }
            : item,
        );
      }

      // If it is a new product, save the selected quantity
      return [
        ...currentItems,
        {
          ...product,
          id: productId,
          quantity: selectedQuantity,
        },
      ];
    });
  };

  // Update the quantity of a product already in the cart
  const updateQuantity = (id, quantity) => {
    const selectedQuantity = Number(quantity);

    if (!Number.isFinite(selectedQuantity) || selectedQuantity <= 0) {
      removeFromCart(id);
      return;
    }

    setCartItems((currentItems) =>
      currentItems.map((item) =>
        String(item.id ?? item._id) === String(id)
          ? { ...item, quantity: selectedQuantity }
          : item,
      ),
    );
  };

  // Remove a product from the cart
  const removeFromCart = (id) => {
    setCartItems((currentItems) =>
      currentItems.filter((item) => String(item.id ?? item._id) !== String(id)),
    );
  };

  // Empty the cart
  const clearCart = () => {
    setCartItems([]);
  };

  // Calculate the total price of all products
  const total = useMemo(() => {
    return cartItems.reduce(
      (sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0),
      0,
    );
  }, [cartItems]);

  // Count the total number of individual items in the cart
  const itemCount = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
  }, [cartItems]);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        total,
        itemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

// Access cart functions from any screen
export function useCart() {
  const context = useContext(CartContext);

  if (context === null) {
    throw new Error("useCart must be used inside a CartProvider");
  }

  return context;
}

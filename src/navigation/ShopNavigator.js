import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Pressable, Text } from "react-native";

import CartScreen from "../screens/CartScreen";
import CheckoutScreen from "../screens/CheckoutScreen";
import EditProfileScreen from "../screens/EditProfileScreen";
import HomeScreen from "../screens/HomeScreen";
import OrderDetailsScreen from "../screens/OrderDetailsScreen";
import OrdersScreen from "../screens/OrdersScreen";
import ProductDetailsScreen from "../screens/ProductDetailsScreen";
import ProductsScreen from "../screens/ProductsScreen";
import ProfileScreen from "../screens/ProfileScreen";

const Stack = createNativeStackNavigator();

export default function ShopNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: "#173B32",
        },
        headerTintColor: "#FFFFFF",
        headerTitleStyle: {
          fontWeight: "bold",
        },
      }}
    >
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={({ navigation }) => ({
          title: "D&G E-Commerce",
          headerRight: () => (
            <Pressable
              onPress={() => navigation.navigate("Profile")}
              style={{ paddingVertical: 8, paddingLeft: 12 }}
            >
              <Text
                style={{
                  color: "#FFFFFF",
                  fontWeight: "bold",
                  fontSize: 15,
                }}
              >
                Profile
              </Text>
            </Pressable>
          ),
        })}
      />

      <Stack.Screen name="Products" component={ProductsScreen} />

      <Stack.Screen name="ProductDetails" component={ProductDetailsScreen} />

      <Stack.Screen name="Cart" component={CartScreen} />

      <Stack.Screen name="Checkout" component={CheckoutScreen} />

      <Stack.Screen name="Orders" component={OrdersScreen} />

      <Stack.Screen name="OrderDetails" component={OrderDetailsScreen} />

      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ title: "My Profile" }}
      />

      <Stack.Screen
        name="EditProfile"
        component={EditProfileScreen}
        options={{ title: "Edit Profile" }}
      />
    </Stack.Navigator>
  );
}

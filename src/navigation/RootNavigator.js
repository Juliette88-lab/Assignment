import { ActivityIndicator, StyleSheet, View } from "react-native";

import { useAuth } from "../auth/AuthContext";
import AuthNavigator from "./AuthNavigator";
import ShopNavigator from "./ShopNavigator";

export default function RootNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#173B32" />
      </View>
    );
  }

  return user ? <ShopNavigator /> : <AuthNavigator />;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F7F5",
  },
});

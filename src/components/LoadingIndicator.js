import { ActivityIndicator, Text, View } from "react-native";

export default function LoadingIndicator() {
  return (
    <View style={{ padding: 24, alignItems: "center" }}>
      <ActivityIndicator size="large" />
      <Text style={{ marginTop: 10 }}>Loading...</Text>
    </View>
  );
}

import { StyleSheet, TextInput } from "react-native";

export default function SearchBar({ value, onChangeText }) {
  return (
    <TextInput
      style={styles.input}
      placeholder="Search products..."
      value={value}
      onChangeText={onChangeText}
      autoCapitalize="none"
    />
  );
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 12,
    margin: 12,
    backgroundColor: "#fff",
  },
});

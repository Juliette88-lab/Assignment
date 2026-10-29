import { useState } from "react";
import {
  ActivityIndicator,
  Button,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { registerUser } from "../api/authApi";

export default function RegisterScreen({ navigation }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const [popupVisible, setPopupVisible] = useState(false);
  const [popupTitle, setPopupTitle] = useState("");
  const [popupMessage, setPopupMessage] = useState("");
  const [popupSuccess, setPopupSuccess] = useState(false);

  const showPopup = (title, message, success = false) => {
    setPopupTitle(title);
    setPopupMessage(message);
    setPopupSuccess(success);
    setPopupVisible(true);
  };

  const handleRegister = async () => {
    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanName || !cleanEmail || !password) {
      showPopup(
        "Missing Information",
        "Please enter your full name, email, and password.",
      );
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(cleanEmail)) {
      showPopup("Invalid Email", "Please enter a valid email address.");
      return;
    }

    if (password.length < 8) {
      showPopup(
        "Invalid Password",
        "Your password must contain at least 8 characters.",
      );
      return;
    }

    try {
      setLoading(true);

      const response = await registerUser(cleanName, cleanEmail, password);

      setName("");
      setEmail("");
      setPassword("");

      showPopup(
        "Registration Successful!",
        response.message || "Your account has been created successfully.",
        true,
      );
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Registration failed. Please try again.";

      showPopup("Registration Failed", message);
    } finally {
      setLoading(false);
    }
  };

  const closePopup = () => {
    setPopupVisible(false);

    if (popupSuccess) {
      navigation.navigate("Login");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>D&G - Create Account</Text>
      <Text style={styles.subtitle}>Create an account to start shopping.</Text>

      <Text style={styles.label}>Full Name</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your full name"
        value={name}
        onChangeText={setName}
        autoCapitalize="words"
        editable={!loading}
      />

      <Text style={styles.label}>Email Address</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        editable={!loading}
      />

      <Text style={styles.label}>Password</Text>
      <TextInput
        style={styles.input}
        placeholder="At least 8 characters"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        autoCapitalize="none"
        editable={!loading}
      />

      <View style={styles.button}>
        {loading ? (
          <View style={styles.loading}>
            <ActivityIndicator size="large" color="#1f2937" />
            <Text style={styles.loadingText}>Registering...</Text>
          </View>
        ) : (
          <Button title="Register" onPress={handleRegister} color="#1f2937" />
        )}
      </View>

      <Text style={styles.footer}>Already have an account?</Text>

      <Button
        title="Go to Login"
        onPress={() => navigation.navigate("Login")}
        disabled={loading}
      />

      <Modal
        visible={popupVisible}
        transparent
        animationType="fade"
        onRequestClose={closePopup}
      >
        <View style={styles.overlay}>
          <View style={styles.popup}>
            <View
              style={[
                styles.iconCircle,
                {
                  backgroundColor: popupSuccess ? "#dcfce7" : "#fee2e2",
                },
              ]}
            >
              <Text
                style={[
                  styles.icon,
                  { color: popupSuccess ? "#16a34a" : "#dc2626" },
                ]}
              >
                {popupSuccess ? "✓" : "!"}
              </Text>
            </View>

            <Text style={styles.popupTitle}>{popupTitle}</Text>
            <Text style={styles.popupMessage}>{popupMessage}</Text>

            <Pressable
              style={[
                styles.popupButton,
                {
                  backgroundColor: popupSuccess ? "#15803d" : "#1f2937",
                },
              ]}
              onPress={closePopup}
            >
              <Text style={styles.popupButtonText}>OK</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#f8fafc",
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
    color: "#111827",
  },
  subtitle: {
    textAlign: "center",
    color: "#6b7280",
    marginBottom: 25,
  },
  label: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 6,
    color: "#374151",
  },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    backgroundColor: "#ffffff",
    fontSize: 16,
  },
  button: {
    marginTop: 8,
    marginBottom: 20,
    minHeight: 45,
    justifyContent: "center",
  },
  loading: {
    alignItems: "center",
  },
  loadingText: {
    marginTop: 8,
    color: "#374151",
  },
  footer: {
    textAlign: "center",
    marginBottom: 10,
    color: "#4b5563",
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  popup: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 26,
    alignItems: "center",
    elevation: 10,
  },
  iconCircle: {
    width: 66,
    height: 66,
    borderRadius: 33,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  icon: {
    fontSize: 38,
    fontWeight: "bold",
  },
  popupTitle: {
    fontSize: 21,
    fontWeight: "bold",
    color: "#111827",
    textAlign: "center",
    marginBottom: 10,
  },
  popupMessage: {
    fontSize: 15,
    color: "#4b5563",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 24,
  },
  popupButton: {
    width: "100%",
    paddingVertical: 13,
    borderRadius: 10,
    alignItems: "center",
  },
  popupButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

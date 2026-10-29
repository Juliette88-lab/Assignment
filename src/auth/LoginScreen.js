import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { loginUser } from "../api/authApi";
import { useAuth } from "./AuthContext";

export default function LoginScreen({ navigation }) {
  const { login } = useAuth();

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

  const handleLogin = async () => {
    if (loading) return;

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !password) {
      showPopup("Missing Information", "Please enter your email and password.");
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(cleanEmail)) {
      showPopup("Invalid Email", "Please enter a valid email address.");
      return;
    }

    try {
      setLoading(true);

      // Send login information to the backend API.
      const data = await loginUser(cleanEmail, password);

      if (!data?.accessToken || !data?.user) {
        showPopup(
          "Login Error",
          "The server did not return the required login information.",
        );
        return;
      }

      // Save the user and token through AuthContext.
      await login(data.user, data.accessToken);

      // Show the success popup.
      showPopup(
        "Login Successful!",
        `Welcome, ${data.user.name || "User"}!`,
        true,
      );
    } catch (error) {
      const message =
        error.response?.data?.message ||
        (error.code === "ECONNABORTED"
          ? "The server took too long to respond. Please try again."
          : "Unable to log in. Check your internet connection and API server.");

      showPopup("Login Failed", message);
    } finally {
      setLoading(false);
    }
  };

  const closePopup = () => {
    setPopupVisible(false);

    // AuthContext should update the root navigation after login.
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.card}>
          <Text style={styles.title}>D&G E-Commerce</Text>

          <Text style={styles.subtitle}>Welcome back! Please log in.</Text>

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
            placeholder="Enter your password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            editable={!loading}
          />

          <Pressable
            style={[styles.loginButton, loading && styles.disabledButton]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>Login</Text>
            )}
          </Pressable>

          <Pressable
            onPress={() => navigation.navigate("ForgotPassword")}
            disabled={loading}
            style={styles.linkButton}
          >
            <Text style={styles.linkText}>Forgot Password?</Text>
          </Pressable>

          <View style={styles.registerRow}>
            <Text style={styles.normalText}>Don't have an account? </Text>

            <Pressable
              onPress={() => navigation.navigate("Register")}
              disabled={loading}
            >
              <Text style={styles.linkText}>Register</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>

      <Modal
        visible={popupVisible}
        transparent
        animationType="fade"
        onRequestClose={closePopup}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.popup}>
            <Text
              style={[
                styles.popupTitle,
                popupSuccess ? styles.successText : styles.errorText,
              ]}
            >
              {popupTitle}
            </Text>

            <Text style={styles.popupMessage}>{popupMessage}</Text>

            <Pressable
              style={[
                styles.okButton,
                popupSuccess ? styles.successButton : styles.errorButton,
              ]}
              onPress={closePopup}
            >
              <Text style={styles.buttonText}>OK</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F6FA",
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
  },
  card: {
    width: "100%",
    maxWidth: 440,
    alignSelf: "center",
    backgroundColor: "#FFFFFF",
    padding: 24,
    borderRadius: 16,
    elevation: 4,
  },
  title: {
    fontSize: 27,
    fontWeight: "bold",
    color: "#123B68",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: "#666666",
    textAlign: "center",
    marginBottom: 28,
  },
  label: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 8,
    color: "#333333",
  },
  input: {
    borderWidth: 1,
    borderColor: "#D0D7E2",
    borderRadius: 9,
    paddingHorizontal: 13,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 18,
    backgroundColor: "#FFFFFF",
    color: "#111827",
  },
  loginButton: {
    backgroundColor: "#123B68",
    padding: 14,
    borderRadius: 9,
    alignItems: "center",
    marginTop: 4,
    minHeight: 48,
    justifyContent: "center",
  },
  disabledButton: {
    opacity: 0.6,
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 16,
  },
  linkButton: {
    alignSelf: "flex-end",
    marginTop: 16,
  },
  linkText: {
    color: "#1769AA",
    fontWeight: "600",
  },
  registerRow: {
    flexDirection: "row",
    justifyContent: "center",
    flexWrap: "wrap",
    marginTop: 25,
  },
  normalText: {
    color: "#555555",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  popup: {
    width: "100%",
    maxWidth: 350,
    backgroundColor: "#FFFFFF",
    padding: 24,
    borderRadius: 15,
    alignItems: "center",
    elevation: 8,
  },
  popupTitle: {
    fontSize: 21,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 12,
  },
  successText: {
    color: "#16803C",
  },
  errorText: {
    color: "#C62828",
  },
  popupMessage: {
    fontSize: 16,
    lineHeight: 23,
    color: "#444444",
    textAlign: "center",
    marginBottom: 22,
  },
  okButton: {
    minWidth: 120,
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
    alignItems: "center",
  },
  successButton: {
    backgroundColor: "#16803C",
  },
  errorButton: {
    backgroundColor: "#C62828",
  },
});

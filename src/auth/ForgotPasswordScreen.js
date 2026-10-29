import { useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { requestPasswordReset } from "../api/authApi";

export default function ForgotPasswordScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const [popup, setPopup] = useState({
    visible: false,
    title: "",
    message: "",
    type: "error",
  });

  const [resetData, setResetData] = useState(null);

  const showPopup = (title, message, type = "error") => {
    setPopup({
      visible: true,
      title,
      message,
      type,
    });
  };

  const closePopup = () => {
    setPopup((previous) => ({
      ...previous,
      visible: false,
    }));

    // Navigate only after the user presses OK on success.
    if (popup.type === "success" && resetData) {
      navigation.navigate("ResetPassword", {
        email: resetData.email,
        token: resetData.token,
      });
      setResetData(null);
    }
  };

  const handleSendResetRequest = async () => {
    if (loading) return;

    const cleanEmail = email.trim().toLowerCase();

    // Check for an empty email.
    if (!cleanEmail) {
      showPopup("Email Required", "Please enter your email address.");
      return;
    }

    // Validate email format.
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(cleanEmail)) {
      showPopup("Invalid Email", "Please enter a valid email address.");
      return;
    }

    setLoading(true);

    try {
      const result = await requestPasswordReset(cleanEmail);

      if (!result?.demoToken) {
        showPopup(
          "Request Failed",
          "The server did not return a reset token. Please try again.",
        );
        return;
      }

      setResetData({
        email: result.email || cleanEmail,
        token: result.demoToken,
      });

      showPopup(
        "Success",
        "Your email was verified successfully. Press OK to continue resetting your password.",
        "success",
      );
    } catch (error) {
      const status = error.response?.status;
      const serverMessage = error.response?.data?.message;

      console.error(
        "Forgot password error:",
        error.response?.data || error.message,
      );

      if (status === 404) {
        showPopup(
          "Email Not Found",
          "No account was found with this email address. Please check your email or register for an account.",
        );
      } else if (status === 400) {
        showPopup(
          "Invalid Request",
          serverMessage || "Please check your email address and try again.",
        );
      } else {
        showPopup(
          "Request Failed",
          serverMessage ||
            "Unable to start password reset. Check your connection and try again.",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.brand}>D&G E-Commerce</Text>

      <Text style={styles.title}>Forgot Password?</Text>

      <Text style={styles.description}>
        Enter the email address associated with your account to continue
        resetting your password.
      </Text>

      <Text style={styles.label}>Email Address</Text>

      <TextInput
        style={styles.input}
        placeholder="Enter your email"
        placeholderTextColor="#888888"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        editable={!loading}
        accessibilityLabel="Email address"
        returnKeyType="send"
        onSubmitEditing={handleSendResetRequest}
      />

      <TouchableOpacity
        style={[styles.button, loading && styles.disabledButton]}
        onPress={handleSendResetRequest}
        disabled={loading}
        activeOpacity={0.8}
      >
        {loading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.buttonText}>Send Reset Request</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.navigate("Login")}
        disabled={loading}
        activeOpacity={0.8}
      >
        <Text style={styles.backText}>Back to Login</Text>
      </TouchableOpacity>

      {/* Custom popup message */}
      <Modal
        visible={popup.visible}
        transparent
        animationType="fade"
        onRequestClose={() => {
          setPopup((previous) => ({
            ...previous,
            visible: false,
          }));
        }}
      >
        <View style={styles.popupOverlay}>
          <View style={styles.popupBox}>
            <View
              style={[
                styles.popupIconCircle,
                popup.type === "success"
                  ? styles.successCircle
                  : styles.errorCircle,
              ]}
            >
              <Text
                style={[
                  styles.popupIcon,
                  popup.type === "success"
                    ? styles.successIcon
                    : styles.errorIcon,
                ]}
              >
                {popup.type === "success" ? "✓" : "!"}
              </Text>
            </View>

            <Text style={styles.popupTitle}>{popup.title}</Text>

            <Text style={styles.popupMessage}>{popup.message}</Text>

            <TouchableOpacity
              style={[
                styles.popupButton,
                popup.type === "success" && styles.successButton,
              ]}
              onPress={closePopup}
              activeOpacity={0.8}
            >
              <Text style={styles.popupButtonText}>OK</Text>
            </TouchableOpacity>
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
    backgroundColor: "#FFFFFF",
  },
  brand: {
    textAlign: "center",
    color: "#1D4ED8",
    fontSize: 17,
    fontWeight: "bold",
    marginBottom: 18,
  },
  title: {
    textAlign: "center",
    fontSize: 28,
    fontWeight: "bold",
    color: "#172554",
    marginBottom: 12,
  },
  description: {
    textAlign: "center",
    color: "#64748B",
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 28,
  },
  label: {
    color: "#334155",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    color: "#111827",
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#1D4ED8",
    borderRadius: 10,
    padding: 15,
    minHeight: 52,
    alignItems: "center",
    justifyContent: "center",
  },
  disabledButton: {
    opacity: 0.65,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  backButton: {
    alignItems: "center",
    marginTop: 20,
    padding: 10,
  },
  backText: {
    color: "#1D4ED8",
    fontSize: 15,
    fontWeight: "600",
  },

  // Popup styles
  popupOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.55)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  popupBox: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 26,
    alignItems: "center",
    elevation: 12,
    ...Platform.select({
      web: {
        boxShadow: "0px 8px 24px rgba(0, 0, 0, 0.18)",
      },
      default: {},
    }),
  },
  popupIconCircle: {
    width: 62,
    height: 62,
    borderRadius: 31,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  successCircle: {
    backgroundColor: "#DCFCE7",
  },
  errorCircle: {
    backgroundColor: "#FEE2E2",
  },
  popupIcon: {
    fontSize: 34,
    fontWeight: "bold",
  },
  successIcon: {
    color: "#15803D",
  },
  errorIcon: {
    color: "#B91C1C",
  },
  popupTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#172554",
    textAlign: "center",
    marginBottom: 10,
  },
  popupMessage: {
    fontSize: 15,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 23,
    marginBottom: 24,
  },
  popupButton: {
    width: "100%",
    backgroundColor: "#1D4ED8",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  successButton: {
    backgroundColor: "#15803D",
  },
  popupButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});

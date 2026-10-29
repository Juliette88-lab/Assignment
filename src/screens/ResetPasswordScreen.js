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

import { resetPassword } from "../api/authApi";

export default function ResetPasswordScreen({ navigation, route }) {
  const params = route?.params || {};

  const email = typeof params.email === "string" ? params.email : "";
  const token = typeof params.token === "string" ? params.token : "";

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const [popup, setPopup] = useState({
    visible: false,
    title: "",
    message: "",
    success: false,
    action: "",
  });

  const showPopup = (title, message, success = false, action = "") => {
    setPopup({
      visible: true,
      title,
      message,
      success,
      action,
    });
  };

  const closePopup = () => {
    const action = popup.action;

    setPopup((previous) => ({
      ...previous,
      visible: false,
    }));

    if (action === "login") {
      navigation.navigate("Login");
    } else if (action === "forgot") {
      navigation.navigate("ForgotPassword");
    }
  };

  const handleResetPassword = async () => {
    if (loading) return;

    if (!email || !token) {
      showPopup(
        "Invalid Reset Request",
        "Your password reset information is missing. Please request a new password reset.",
        false,
        "forgot",
      );
      return;
    }

    if (!newPassword.trim() || !confirmPassword) {
      showPopup(
        "Required Fields",
        "Please enter your new password and confirm your password.",
      );
      return;
    }

    if (newPassword.length < 8) {
      showPopup(
        "Password Too Short",
        "Your password must contain at least 8 characters.",
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      showPopup(
        "Passwords Do Not Match",
        "The New Password and Confirm Password fields must contain the same password.",
      );
      return;
    }

    setLoading(true);

    try {
      const result = await resetPassword(
        email,
        token,
        newPassword,
        confirmPassword,
      );

      setNewPassword("");
      setConfirmPassword("");

      showPopup(
        "Password Changed Successfully",
        result?.message ||
          "Your password has been changed successfully. You can now log in with your new password.",
        true,
        "login",
      );
    } catch (error) {
      console.error(
        "Reset password error:",
        error.response?.data || error.message,
      );

      const status = error.response?.status;
      const serverMessage = error.response?.data?.message;

      if (!error.response) {
        showPopup(
          "Connection Error",
          "Unable to connect to the server. Check your connection and make sure the backend server is running.",
        );
      } else if (status === 400) {
        showPopup(
          "Invalid or Expired Token",
          serverMessage ||
            "Your password reset token is invalid or has expired. Please request a new reset token.",
          false,
          "forgot",
        );
      } else if (status === 404) {
        showPopup(
          "Account Not Found",
          serverMessage ||
            "The account associated with this email could not be found. Please check your email address.",
        );
      } else if (status === 401 || status === 403) {
        showPopup(
          "Request Not Authorized",
          serverMessage ||
            "This password reset request is not authorized. Please request a new reset token.",
          false,
          "forgot",
        );
      } else if (status >= 500) {
        showPopup(
          "Server Error",
          serverMessage ||
            "The server encountered a problem while changing your password. Please try again later.",
        );
      } else {
        showPopup(
          "Password Change Failed",
          serverMessage ||
            "Something went wrong while changing your password. Please try again.",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.brand}>D&G E-Commerce</Text>

      <Text style={styles.title}>Reset Password</Text>

      <Text style={styles.description}>
        Create a new password for your account.
      </Text>

      <Text style={styles.label}>New Password</Text>

      <TextInput
        style={styles.input}
        placeholder="Enter new password"
        placeholderTextColor="#888888"
        value={newPassword}
        onChangeText={setNewPassword}
        secureTextEntry
        autoCapitalize="none"
        autoCorrect={false}
        editable={!loading}
        accessibilityLabel="New password"
        returnKeyType="next"
      />

      <Text style={styles.label}>Confirm Password</Text>

      <TextInput
        style={styles.input}
        placeholder="Confirm new password"
        placeholderTextColor="#888888"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
        autoCapitalize="none"
        autoCorrect={false}
        editable={!loading}
        accessibilityLabel="Confirm new password"
        returnKeyType="done"
        onSubmitEditing={handleResetPassword}
      />

      <Text style={styles.hint}>
        Use at least 8 characters. Both passwords must match.
      </Text>

      <TouchableOpacity
        style={[styles.button, loading && styles.disabledButton]}
        onPress={handleResetPassword}
        disabled={loading}
        activeOpacity={0.8}
      >
        {loading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.buttonText}>Change Password</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.navigate("ForgotPassword")}
        disabled={loading}
        activeOpacity={0.8}
      >
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>

      {/* Custom popup for success and errors */}
      <Modal
        visible={popup.visible}
        transparent
        animationType="fade"
        onRequestClose={closePopup}
      >
        <View style={styles.popupOverlay}>
          <View style={styles.popupBox}>
            <View
              style={[
                styles.popupIconCircle,
                popup.success ? styles.successCircle : styles.errorCircle,
              ]}
            >
              <Text
                style={[
                  styles.popupIcon,
                  popup.success ? styles.successIcon : styles.errorIcon,
                ]}
              >
                {popup.success ? "✓" : "!"}
              </Text>
            </View>

            <Text style={styles.popupTitle}>{popup.title}</Text>

            <Text style={styles.popupMessage}>{popup.message}</Text>

            <TouchableOpacity
              style={[
                styles.popupButton,
                popup.success && styles.successButton,
              ]}
              onPress={closePopup}
              activeOpacity={0.8}
            >
              <Text style={styles.popupButtonText}>
                {popup.action === "login"
                  ? "Go to Login"
                  : popup.action === "forgot"
                    ? "Request Again"
                    : "OK"}
              </Text>
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
    fontSize: 15,
    lineHeight: 22,
    color: "#64748B",
    marginBottom: 26,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#334155",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    color: "#111827",
    marginBottom: 18,
  },
  hint: {
    color: "#64748B",
    fontSize: 13,
    marginBottom: 22,
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
    marginTop: 18,
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

import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { getUserProfile } from "../api/authApi";
import { useAuth } from "../auth/AuthContext";

export default function ProfileScreen({ navigation }) {
  const { user, token, logout, updateUser } = useAuth();

  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [profileError, setProfileError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadProfile() {
      if (!token) {
        setLoadingProfile(false);
        return;
      }

      try {
        setProfileError("");

        const profile = await getUserProfile(token);

        if (active) {
          await updateUser(profile);
        }
      } catch (error) {
        if (active) {
          setProfileError(
            error.response?.data?.message ||
              "Could not refresh profile information.",
          );
        }
      } finally {
        if (active) {
          setLoadingProfile(false);
        }
      }
    }

    loadProfile();

    return () => {
      active = false;
    };
  }, [token]);

  const name = user?.name || user?.fullName || user?.username || "Customer";

  const email = user?.email || "Not provided";
  const phone = user?.phone || user?.phoneNumber || "";
  const residence = user?.residence || user?.address || "";

  async function handleLogout() {
    setLoggingOut(true);

    try {
      await logout();
      setShowLogoutModal(false);
    } finally {
      setLoggingOut(false);
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.profileHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {String(name).charAt(0).toUpperCase()}
          </Text>
        </View>

        <Text style={styles.name}>{name}</Text>
        <Text style={styles.email}>{email}</Text>

        <Pressable
          style={styles.editButton}
          onPress={() => navigation.navigate("EditProfile")}
        >
          <Text style={styles.editButtonText}>Edit Profile</Text>
        </Pressable>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Personal Information</Text>

        <InfoRow label="Full Name" value={name} />
        <InfoRow label="Email" value={email} />

        <InfoRow
          label="Telephone Number"
          value={phone}
          actionLabel={phone ? "Edit" : "Add Phone"}
          onAction={() => navigation.navigate("EditProfile")}
        />

        <InfoRow
          label="Residence"
          value={residence}
          actionLabel={residence ? "Edit" : "Add Residence"}
          onAction={() => navigation.navigate("EditProfile")}
        />

        {loadingProfile ? (
          <ActivityIndicator color="#173B32" style={styles.loader} />
        ) : null}

        {profileError ? <Text style={styles.error}>{profileError}</Text> : null}
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>My Account</Text>

        <Pressable
          style={styles.actionButton}
          onPress={() => navigation.navigate("Orders")}
        >
          <Text style={styles.actionText}>My Orders</Text>
          <Text style={styles.arrow}>›</Text>
        </Pressable>

        <Pressable
          style={styles.actionButton}
          onPress={() => navigation.navigate("Products")}
        >
          <Text style={styles.actionText}>Continue Shopping</Text>
          <Text style={styles.arrow}>›</Text>
        </Pressable>
      </View>

      <Pressable
        style={styles.logoutButton}
        onPress={() => setShowLogoutModal(true)}
      >
        <Text style={styles.logoutText}>Logout</Text>
      </Pressable>

      <Text style={styles.footer}>D&G E-Commerce</Text>

      <Modal
        visible={showLogoutModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowLogoutModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Logout</Text>

            <Text style={styles.modalMessage}>
              Are you sure you want to log out of your account?
            </Text>

            <View style={styles.modalActions}>
              <Pressable
                style={styles.cancelButton}
                disabled={loggingOut}
                onPress={() => setShowLogoutModal(false)}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </Pressable>

              <Pressable
                style={styles.confirmButton}
                disabled={loggingOut}
                onPress={handleLogout}
              >
                {loggingOut ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.confirmText}>Yes, Logout</Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

function InfoRow({ label, value, actionLabel, onAction }) {
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoText}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>{value || "Not added yet"}</Text>
      </View>

      <Pressable onPress={onAction} style={styles.smallAction}>
        <Text style={styles.smallActionText}>{actionLabel}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7F6",
  },
  content: {
    padding: 20,
    paddingBottom: 35,
  },
  profileHeader: {
    alignItems: "center",
    paddingVertical: 25,
    marginBottom: 18,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
  },
  avatar: {
    width: 85,
    height: 85,
    borderRadius: 43,
    backgroundColor: "#173B32",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  name: {
    fontSize: 23,
    fontWeight: "bold",
    color: "#173B32",
  },
  email: {
    fontSize: 14,
    color: "#777777",
    marginTop: 5,
  },
  editButton: {
    marginTop: 15,
    backgroundColor: "#173B32",
    paddingHorizontal: 22,
    paddingVertical: 10,
    borderRadius: 8,
  },
  editButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 18,
    marginBottom: 18,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#173B32",
    marginBottom: 15,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
  },
  infoText: {
    flex: 1,
  },
  label: {
    fontSize: 13,
    color: "#777777",
    marginBottom: 5,
  },
  value: {
    fontSize: 15,
    color: "#222222",
    fontWeight: "500",
  },
  smallAction: {
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderRadius: 7,
    backgroundColor: "#E7F0EC",
  },
  smallActionText: {
    color: "#173B32",
    fontSize: 13,
    fontWeight: "bold",
  },
  actionButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
  },
  actionText: {
    fontSize: 16,
    color: "#173B32",
    fontWeight: "600",
  },
  arrow: {
    fontSize: 25,
    color: "#173B32",
  },
  loader: {
    marginTop: 12,
  },
  error: {
    color: "#B42318",
    marginTop: 12,
  },
  logoutButton: {
    backgroundColor: "#B42318",
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  logoutText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  footer: {
    textAlign: "center",
    color: "#888888",
    marginTop: 22,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalCard: {
    backgroundColor: "#FFFFFF",
    width: "100%",
    maxWidth: 400,
    borderRadius: 16,
    padding: 22,
  },
  modalTitle: {
    fontSize: 21,
    fontWeight: "bold",
    color: "#173B32",
    marginBottom: 12,
  },
  modalMessage: {
    fontSize: 15,
    color: "#555555",
    lineHeight: 22,
    marginBottom: 22,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
  },
  cancelButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: "#EEEEEE",
  },
  cancelText: {
    color: "#333333",
    fontWeight: "600",
  },
  confirmButton: {
    minWidth: 110,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: "#B42318",
    alignItems: "center",
  },
  confirmText: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
});

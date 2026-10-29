import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
} from "react-native";

import { updateUserProfile } from "../api/authApi";
import { useAuth } from "../auth/AuthContext";

export default function EditProfileScreen({ navigation }) {
  const { user, token, updateUser } = useAuth();

  const [name, setName] = useState(user?.name || user?.fullName || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState(user?.phone || user?.phoneNumber || "");
  const [residence, setResidence] = useState(
    user?.residence || user?.address || "",
  );

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    navigation.setOptions({ title: "Edit Profile" });
  }, [navigation]);

  function showMessage(title, description) {
    if (Platform.OS === "web") {
      setMessage(`${title}: ${description}`);
    } else {
      Alert.alert(title, description);
    }
  }

  async function handleSave() {
    if (!name.trim() || !email.trim()) {
      showMessage("Missing information", "Name and email are required.");
      return;
    }

    if (!token) {
      showMessage("Session expired", "Please log in again.");
      return;
    }

    setSaving(true);
    setMessage("");

    try {
      const result = await updateUserProfile(
        {
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          residence: residence.trim(),
        },
        token,
      );

      if (!result.user) {
        throw new Error("The server did not return the updated profile.");
      }

      await updateUser(result.user);

      if (Platform.OS === "web") {
        navigation.goBack();
      } else {
        Alert.alert("Success", "Your profile has been updated.", [
          {
            text: "OK",
            onPress: () => navigation.goBack(),
          },
        ]);
      }
    } catch (error) {
      const errorText =
        error.response?.data?.message ||
        error.message ||
        "Could not update your profile.";

      showMessage("Update failed", errorText);
    } finally {
      setSaving(false);
    }
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.heading}>Edit Profile</Text>

      <Text style={styles.subtitle}>
        Add or update your personal information.
      </Text>

      {message ? <Text style={styles.error}>{message}</Text> : null}

      <Text style={styles.label}>Full Name *</Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder="Enter your full name"
        autoCapitalize="words"
      />

      <Text style={styles.label}>Email *</Text>
      <TextInput
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        placeholder="Enter your email"
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <Text style={styles.label}>Telephone Number</Text>
      <TextInput
        style={styles.input}
        value={phone}
        onChangeText={setPhone}
        placeholder="Add your phone number"
        keyboardType="phone-pad"
      />

      <Text style={styles.label}>Residence / Address</Text>
      <TextInput
        style={[styles.input, styles.addressInput]}
        value={residence}
        onChangeText={setResidence}
        placeholder="Enter your residence or delivery address"
        multiline
      />

      <Pressable
        style={[styles.saveButton, saving && styles.disabledButton]}
        onPress={handleSave}
        disabled={saving}
      >
        {saving ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.saveText}>Save Changes</Text>
        )}
      </Pressable>

      <Pressable
        style={styles.cancelButton}
        onPress={() => navigation.goBack()}
        disabled={saving}
      >
        <Text style={styles.cancelText}>Cancel</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7F6",
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  heading: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#173B32",
  },
  subtitle: {
    fontSize: 14,
    color: "#777777",
    marginTop: 7,
    marginBottom: 25,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333333",
    marginBottom: 8,
    marginTop: 14,
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D9E0DC",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 16,
    color: "#222222",
  },
  addressInput: {
    minHeight: 90,
    textAlignVertical: "top",
  },
  saveButton: {
    backgroundColor: "#173B32",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 28,
  },
  disabledButton: {
    opacity: 0.65,
  },
  saveText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 16,
  },
  cancelButton: {
    padding: 14,
    alignItems: "center",
    marginTop: 8,
  },
  cancelText: {
    color: "#173B32",
    fontWeight: "600",
  },
  error: {
    color: "#B42318",
    backgroundColor: "#FEE4E2",
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
});

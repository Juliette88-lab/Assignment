import { useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from "react-native";

import { useAuth } from "../auth/AuthContext";

const categories = [
  { name: "Clothes", emoji: "👕", rw: "Imyenda", fr: "Vêtements" },
  { name: "Shoes", emoji: "👟", rw: "Inkweto", fr: "Chaussures" },
  { name: "Bags", emoji: "👜", rw: "Imifuka", fr: "Sacs" },
  {
    name: "Cosmetics",
    emoji: "💄",
    rw: "Amavuta yo kwisiga",
    fr: "Cosmétiques",
  },
  { name: "Jewellery", emoji: "💍", rw: "Imitako", fr: "Bijoux" },
  {
    name: "Home equipment",
    emoji: "🏠",
    rw: "Ibikoresho byo mu rugo",
    fr: "Équipement maison",
  },
];

const content = {
  en: {
    welcome: "Welcome to D&G",
    subtitle: "Everything you need, in one place.",
    categories: "Shop by category",
    search: "Search products...",
    searchButton: "Search",
    allProducts: "Explore all products",
    account: "My Account",
    cart: "My Cart",
    orders: "View My Orders",
    logout: "Logout",
    logoutTitle: "Log out",
    logoutMessage: "Are you sure you want to log out?",
    cancel: "Cancel",
    yes: "Yes, Log out",
    footer: "Quality products for your everyday needs.",
    loggingOut: "Logging out...",
    logoutErrorTitle: "Logout Failed",
    logoutError: "Could not log out. Please try again.",
    logoutConnectionError:
      "A connection problem occurred. Please check your connection and try again.",
    ok: "OK",
  },
  rw: {
    welcome: "Murakaza neza kuri D&G",
    subtitle: "Ibintu ukeneye byose, ahantu hamwe.",
    categories: "Gura ukurikije ibyiciro",
    search: "Shakisha ibicuruzwa...",
    searchButton: "Shakisha",
    allProducts: "Reba ibicuruzwa byose",
    account: "Konti yanjye",
    cart: "Agaseke kanjye",
    orders: "Reba ibyo natumije",
    logout: "Sohoka",
    logoutTitle: "Kwemeza gusohoka",
    logoutMessage: "Urashaka koko gusohoka muri konti yawe?",
    cancel: "Oya, ngume muri konti",
    yes: "Yego, sohoka",
    footer: "Ibicuruzwa byiza ku byo ukeneye buri munsi.",
    loggingOut: "Turimo gusohoka...",
    logoutErrorTitle: "Gusohoka ntibyagenze neza",
    logoutError: "Ntibyashobotse gusohoka. Ongera ugerageze.",
    logoutConnectionError:
      "Habaye ikibazo cy'umuyoboro. Reba internet wongere ugerageze.",
    ok: "Sawa",
  },
  fr: {
    welcome: "Bienvenue chez D&G",
    subtitle: "Tout ce dont vous avez besoin, au même endroit.",
    categories: "Acheter par catégorie",
    search: "Rechercher des produits...",
    searchButton: "Rechercher",
    allProducts: "Voir tous les produits",
    account: "Mon compte",
    cart: "Mon panier",
    orders: "Voir mes commandes",
    logout: "Déconnexion",
    logoutTitle: "Confirmer la déconnexion",
    logoutMessage: "Voulez-vous vraiment vous déconnecter ?",
    cancel: "Annuler",
    yes: "Oui, déconnecter",
    footer: "Des produits de qualité pour vos besoins quotidiens.",
    loggingOut: "Déconnexion en cours...",
    logoutErrorTitle: "Échec de la déconnexion",
    logoutError: "Impossible de vous déconnecter. Veuillez réessayer.",
    logoutConnectionError:
      "Un problème de connexion est survenu. Vérifiez votre connexion et réessayez.",
    ok: "OK",
  },
};

export default function HomeScreen({ navigation }) {
  const { logout } = useAuth();
  const { width } = useWindowDimensions();

  const [language, setLanguage] = useState("en");
  const [searchText, setSearchText] = useState("");
  const [loggingOut, setLoggingOut] = useState(false);

  const [logoutPopup, setLogoutPopup] = useState({
    visible: false,
    type: "confirm",
  });

  const c = content[language] || content.en;
  const isWideScreen = width >= 700;
  const columns = width >= 1000 ? 3 : 2;

  const categoryLabel = (category) => {
    if (language === "rw") return category.rw;
    if (language === "fr") return category.fr;
    return category.name;
  };

  const openProducts = (category = null, searchQuery = "") => {
    navigation.navigate("Products", {
      category,
      searchQuery,
    });
  };

  // Open the custom logout confirmation popup.
  const handleLogout = () => {
    if (loggingOut) return;

    setLogoutPopup({
      visible: true,
      type: "confirm",
    });
  };

  const closeLogoutPopup = () => {
    if (loggingOut) return;

    setLogoutPopup((previous) => ({
      ...previous,
      visible: false,
    }));
  };

  // Log out only after the user confirms.
  const performLogout = async () => {
    if (loggingOut) return;

    setLoggingOut(true);
    setLogoutPopup((previous) => ({
      ...previous,
      visible: false,
    }));

    try {
      await logout();
      // AuthContext must clear the current user.
      // RootNavigator should then display the Login screen.
    } catch (error) {
      console.error("Logout failed:", error);

      const message = error?.response ? c.logoutError : c.logoutConnectionError;

      setLogoutPopup({
        visible: true,
        type: "error",
        message,
      });
    } finally {
      setLoggingOut(false);
    }
  };

  const menuItems = [
    {
      key: "cart",
      label: c.cart,
      icon: "🛒",
      onPress: () => navigation.navigate("Cart"),
    },
    {
      key: "orders",
      label: c.orders,
      icon: "📦",
      onPress: () => navigation.navigate("Orders"),
    },
    {
      key: "logout",
      label: loggingOut ? c.loggingOut : c.logout,
      icon: "🚪",
      onPress: handleLogout,
      logout: true,
    },
  ];

  const popupTitle =
    logoutPopup.type === "error" ? c.logoutErrorTitle : c.logoutTitle;

  const popupMessage =
    logoutPopup.type === "error"
      ? logoutPopup.message || c.logoutError
      : c.logoutMessage;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F5F7F5" />

      <ScrollView
        style={styles.container}
        contentContainerStyle={[
          styles.content,
          isWideScreen && styles.wideContent,
        ]}
        showsVerticalScrollIndicator
        keyboardShouldPersistTaps="handled"
        alwaysBounceVertical={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.logo}>D&G</Text>
            <Text style={styles.logoSubtitle}>E-COMMERCE</Text>
          </View>

          <View style={styles.languages}>
            {["en", "rw", "fr"].map((lang) => (
              <Pressable
                key={lang}
                onPress={() => setLanguage(lang)}
                style={[
                  styles.languageButton,
                  language === lang && styles.activeLanguage,
                ]}
                accessibilityRole="button"
                accessibilityLabel={`Change language to ${lang}`}
              >
                <Text
                  style={[
                    styles.languageText,
                    language === lang && styles.activeLanguageText,
                  ]}
                >
                  {lang.toUpperCase()}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Welcome banner */}
        <View style={styles.hero}>
          <Text style={styles.heroTag}>D&G ONLINE SHOP</Text>
          <Text style={styles.heroTitle}>{c.welcome}</Text>
          <Text style={styles.heroSubtitle}>{c.subtitle}</Text>

          <Pressable
            style={({ pressed }) => [
              styles.heroButton,
              pressed && styles.pressedCard,
            ]}
            onPress={() => openProducts()}
            accessibilityRole="button"
          >
            <Text style={styles.heroButtonText}>{c.allProducts} →</Text>
          </Pressable>
        </View>

        {/* Search */}
        <View style={styles.searchRow}>
          <TextInput
            style={styles.searchInput}
            value={searchText}
            onChangeText={setSearchText}
            placeholder={c.search}
            placeholderTextColor="#777777"
            autoCapitalize="none"
            returnKeyType="search"
            onSubmitEditing={() => openProducts(null, searchText.trim())}
            accessibilityLabel={c.search}
          />

          <Pressable
            style={({ pressed }) => [
              styles.searchButton,
              pressed && styles.pressedCard,
            ]}
            onPress={() => openProducts(null, searchText.trim())}
            accessibilityRole="button"
          >
            <Text style={styles.searchButtonText}>{c.searchButton}</Text>
          </Pressable>
        </View>

        {/* Categories */}
        <Text style={styles.sectionTitle}>{c.categories}</Text>

        <View style={styles.categoryGrid}>
          {categories.map((category) => (
            <Pressable
              key={category.name}
              style={({ pressed }) => [
                styles.categoryCard,
                { width: `${100 / columns - 2}%` },
                pressed && styles.pressedCard,
              ]}
              onPress={() => openProducts(category.name)}
              accessibilityRole="button"
              accessibilityLabel={categoryLabel(category)}
            >
              <Text style={styles.categoryEmoji}>{category.emoji}</Text>
              <Text style={styles.categoryName}>{categoryLabel(category)}</Text>
              <Text style={styles.categoryArrow}>→</Text>
            </Pressable>
          ))}
        </View>

        {/* Account menu */}
        <View style={styles.accountSection}>
          <Text style={styles.sectionTitle}>{c.account}</Text>

          {menuItems.map((item) => (
            <Pressable
              key={item.key}
              style={({ pressed }) => [
                styles.actionButton,
                item.logout && styles.logoutButton,
                pressed && styles.pressedCard,
              ]}
              onPress={item.onPress}
              disabled={item.logout && loggingOut}
              accessibilityRole="button"
              accessibilityLabel={item.label}
            >
              <Text style={styles.actionIcon}>{item.icon}</Text>

              <Text
                style={[styles.actionText, item.logout && styles.logoutText]}
              >
                {item.label}
              </Text>

              {item.logout && loggingOut ? (
                <ActivityIndicator color="#B42318" size="small" />
              ) : (
                <Text
                  style={[styles.actionArrow, item.logout && styles.logoutText]}
                >
                  →
                </Text>
              )}
            </Pressable>
          ))}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerTitle}>D&G E-COMMERCE</Text>
          <Text style={styles.footerText}>{c.footer}</Text>
          <Text style={styles.copyright}>© {new Date().getFullYear()} D&G</Text>
        </View>
      </ScrollView>

      {/* Custom Logout Popup */}
      <Modal
        visible={logoutPopup.visible}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={closeLogoutPopup}
      >
        <View style={styles.popupOverlay}>
          <View style={styles.popupCard}>
            <View
              style={[
                styles.popupIconCircle,
                logoutPopup.type === "error" && styles.popupErrorCircle,
              ]}
            >
              <Text
                style={[
                  styles.popupIcon,
                  logoutPopup.type === "error" && styles.popupErrorIcon,
                ]}
              >
                {logoutPopup.type === "error" ? "!" : "?"}
              </Text>
            </View>

            <Text style={styles.popupTitle}>{popupTitle}</Text>
            <Text style={styles.popupMessage}>{popupMessage}</Text>

            {logoutPopup.type === "confirm" ? (
              <View style={styles.popupActions}>
                <Pressable
                  style={({ pressed }) => [
                    styles.cancelButton,
                    pressed && styles.pressedCard,
                  ]}
                  onPress={closeLogoutPopup}
                  disabled={loggingOut}
                  accessibilityRole="button"
                >
                  <Text style={styles.cancelButtonText}>{c.cancel}</Text>
                </Pressable>

                <Pressable
                  style={({ pressed }) => [
                    styles.confirmButton,
                    pressed && styles.pressedCard,
                  ]}
                  onPress={performLogout}
                  disabled={loggingOut}
                  accessibilityRole="button"
                >
                  {loggingOut ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={styles.confirmButtonText}>{c.yes}</Text>
                  )}
                </Pressable>
              </View>
            ) : (
              <Pressable
                style={styles.okButton}
                onPress={closeLogoutPopup}
                accessibilityRole="button"
              >
                <Text style={styles.confirmButtonText}>{c.ok}</Text>
              </Pressable>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F5F7F5",
  },
  container: {
    flex: 1,
  },
  content: {
    width: "100%",
    maxWidth: 1100,
    alignSelf: "center",
    padding: 16,
    paddingBottom: 35,
  },
  wideContent: {
    paddingHorizontal: 28,
    paddingTop: 24,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 22,
    gap: 12,
  },
  logo: {
    fontSize: 30,
    fontWeight: "900",
    color: "#173B32",
    letterSpacing: 2,
  },
  logoSubtitle: {
    fontSize: 10,
    fontWeight: "700",
    color: "#6B746E",
    letterSpacing: 2,
  },
  languages: {
    flexDirection: "row",
    gap: 6,
  },
  languageButton: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: "#E4E9E5",
  },
  activeLanguage: {
    backgroundColor: "#173B32",
  },
  languageText: {
    color: "#26332C",
    fontWeight: "700",
    fontSize: 11,
  },
  activeLanguageText: {
    color: "#FFFFFF",
  },
  hero: {
    backgroundColor: "#173B32",
    borderRadius: 18,
    padding: 24,
    marginBottom: 22,
  },
  heroTag: {
    color: "#BDE4CE",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 2,
    marginBottom: 12,
  },
  heroTitle: {
    fontSize: 27,
    fontWeight: "800",
    color: "#FFFFFF",
    marginBottom: 10,
  },
  heroSubtitle: {
    fontSize: 14,
    lineHeight: 21,
    color: "#E4EEE9",
    marginBottom: 20,
  },
  heroButton: {
    alignSelf: "flex-start",
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 15,
  },
  heroButtonText: {
    color: "#173B32",
    fontWeight: "800",
  },
  searchRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 25,
  },
  searchInput: {
    flex: 1,
    minWidth: 0,
    backgroundColor: "#FFFFFF",
    borderColor: "#DDE3DE",
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 13,
    paddingVertical: 12,
    fontSize: 14,
    color: "#202923",
  },
  searchButton: {
    backgroundColor: "#173B32",
    borderRadius: 10,
    paddingHorizontal: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  searchButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#202923",
    marginBottom: 15,
  },
  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
    gap: 12,
  },
  categoryCard: {
    minHeight: 145,
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#E2E8E3",
    justifyContent: "center",
    alignItems: "center",
    padding: 12,
  },
  pressedCard: {
    opacity: 0.75,
  },
  categoryEmoji: {
    fontSize: 38,
    marginBottom: 12,
  },
  categoryName: {
    fontSize: 15,
    fontWeight: "800",
    color: "#173B32",
    textAlign: "center",
  },
  categoryArrow: {
    color: "#678176",
    marginTop: 8,
    fontSize: 18,
  },
  accountSection: {
    marginTop: 28,
    marginBottom: 10,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8E3",
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
  },
  actionIcon: {
    fontSize: 22,
    marginRight: 13,
  },
  actionText: {
    flex: 1,
    fontSize: 14,
    fontWeight: "700",
    color: "#173B32",
  },
  actionArrow: {
    fontSize: 20,
    color: "#173B32",
  },
  logoutButton: {
    borderColor: "#E7CACA",
    backgroundColor: "#FFF8F8",
  },
  logoutText: {
    color: "#B42318",
  },
  footer: {
    alignItems: "center",
    marginTop: 25,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: "#DDE3DE",
  },
  footerTitle: {
    color: "#173B32",
    fontWeight: "900",
    letterSpacing: 1.5,
    marginBottom: 7,
  },
  footerText: {
    color: "#6B746E",
    fontSize: 12,
    textAlign: "center",
  },
  copyright: {
    marginTop: 8,
    color: "#89918C",
    fontSize: 11,
  },

  /* Custom popup styles */
  popupOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.58)",
    justifyContent: "center",
    alignItems: "center",
    padding: 22,
  },
  popupCard: {
    width: "100%",
    maxWidth: 390,
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    paddingHorizontal: 23,
    paddingTop: 28,
    paddingBottom: 24,
    alignItems: "center",
    elevation: 15,
    ...Platform.select({
      web: {
        boxShadow: "0px 8px 25px rgba(0,0,0,0.22)",
      },
      default: {},
    }),
  },
  popupIconCircle: {
    width: 66,
    height: 66,
    borderRadius: 33,
    borderWidth: 2,
    borderColor: "#E5A23C",
    backgroundColor: "#FFF4DF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 17,
  },
  popupErrorCircle: {
    borderColor: "#B42318",
    backgroundColor: "#FDECEC",
  },
  popupIcon: {
    color: "#A45D00",
    fontSize: 36,
    fontWeight: "900",
  },
  popupErrorIcon: {
    color: "#B42318",
  },
  popupTitle: {
    color: "#173B32",
    fontSize: 22,
    fontWeight: "900",
    textAlign: "center",
    marginBottom: 12,
  },
  popupMessage: {
    color: "#626B65",
    fontSize: 15,
    lineHeight: 23,
    textAlign: "center",
    marginBottom: 25,
  },
  popupActions: {
    width: "100%",
    flexDirection: "row",
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    minHeight: 48,
    borderRadius: 11,
    backgroundColor: "#F0F2F1",
    borderWidth: 1,
    borderColor: "#DDE3DE",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 7,
  },
  cancelButtonText: {
    color: "#26332C",
    fontSize: 14,
    fontWeight: "800",
    textAlign: "center",
  },
  confirmButton: {
    flex: 1,
    minHeight: 48,
    borderRadius: 11,
    backgroundColor: "#B42318",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 7,
  },
  confirmButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
    textAlign: "center",
  },
  okButton: {
    width: "100%",
    minHeight: 48,
    borderRadius: 11,
    backgroundColor: "#173B32",
    justifyContent: "center",
    alignItems: "center",
  },
});

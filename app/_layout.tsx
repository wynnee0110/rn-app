import { ClerkProvider } from "@clerk/expo";
import { tokenCache } from "@clerk/expo/token-cache";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;

if (!publishableKey) {
  throw new Error("Add your Clerk Publishable Key to the .env file");
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    'san-regular': require("../assets/fonts/PlusJakartaSans-Regular.ttf"),
    'san-bold': require("../assets/fonts/PlusJakartaSans-Bold.ttf"),
    'san-semibold': require("../assets/fonts/PlusJakartaSans-SemiBold.ttf"),
    'san-medium': require("../assets/fonts/PlusJakartaSans-Medium.ttf"),
    'san-light': require("../assets/fonts/PlusJakartaSans-Light.ttf"),
    'san-extrabold': require("../assets/fonts/PlusJakartaSans-ExtraBold.ttf"),
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
      <Stack screenOptions={{ headerShown: false }} />
    </ClerkProvider>
  );
}

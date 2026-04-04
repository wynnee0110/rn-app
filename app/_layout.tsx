import { Stack } from "expo-router";
import { useFonts } from "expo-font";
import { useEffect } from "react";
import * as SplashScreen from "expo-splash-screen";
 
export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    'san-regular':require("../assets/fonts/PlusJakartaSans-Regular.ttf"),
    'san-bold':require("../assets/fonts/PlusJakartaSans-Bold.ttf"),
    'san-semibold':require("../assets/fonts/PlusJakartaSans-SemiBold.ttf"),
    'san-medium':require("../assets/fonts/PlusJakartaSans-Medium.ttf"),
    'san-light':require("../assets/fonts/PlusJakartaSans-Light.ttf"),
    'san-extrabold':require("../assets/fonts/PlusJakartaSans-ExtraBold.ttf"),
    
  }); 

useEffect(() => {
  if (fontsLoaded) {
    SplashScreen.hideAsync();
  }
}, [fontsLoaded])

if (!fontsLoaded) {
  return null;
}
  return <Stack screenOptions={{headerShown: false}} />;
}

import "@/global.css";
import { Link } from "expo-router";
import { Text, View } from "react-native";
import { SafeAreaView as RNSafeAreaView} from "react-native-safe-area-context";
import { styled } from "nativewind";
const SafeAreaView = styled(RNSafeAreaView);
export default function App() {
  return (  
      <SafeAreaView className="flex-1 bg-background p-5">
        <Text className="text-7xl font-extrabold text-primary">
        Home
      </Text>

      <Link href="/onboarding">
        <Text>Go to Onboarding</Text>
      </Link>
      <Link href="/(auth)/sign-in">
        <Text>Go to Sign In</Text>
      </Link>
      <Link href="/(auth)/sign-up">
        <Text>Go to Sign Up</Text>
      </Link>
    </SafeAreaView>


  );
}
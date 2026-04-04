import { Text, View } from 'react-native'
import { SafeAreaView as RNSafeAreaView} from "react-native-safe-area-context";
import { styled } from "nativewind";
const SafeAreaView = styled(RNSafeAreaView);

const Subscription = () => {
  return (
    <SafeAreaView className="flex-1 bg-background p-5">
      <Text>Subscription</Text>
    </SafeAreaView>
  )
}

export default Subscription

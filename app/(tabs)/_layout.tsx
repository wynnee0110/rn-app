import { tabs } from "@/constants/data";
import { colors, components } from "@/constants/theme";
import { useAuth } from "@clerk/expo";
import { clsx } from "clsx";
import { Redirect, Tabs } from "expo-router";
import { Image, ImageSourcePropType, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const TabBar = components.tabBar;

// 1. Define your props so TypeScript doesn't complain
interface TabIconProps {
    focused: boolean;
    icon: ImageSourcePropType;
}

// 2. CRITICAL FIX: Move TabIcon completely OUTSIDE of TabLayout
const TabIcon = ({ focused, icon }: TabIconProps) => {
    return (
        <View className="tabs-icon">
            <View className={clsx("tabs-pill", focused && "tabs-active")}>
                <Image
                    source={icon}
                    resizeMode="contain"
                    className="tabs-glyph"
                    // CRITICAL FIX: Lock the image dimensions so it doesn't stretch
                    // Feel free to change 24 to 20 or 28 until it looks perfect
                    style={{ width: 24, height: 24 }}
                />
            </View>
        </View>
    );
};

// 3. This is your main layout component
const TabLayout = () => {
    const insets = useSafeAreaInsets();
    const { isSignedIn, isLoaded } = useAuth();

    // Wait for Clerk to load before making any routing decisions
    if (!isLoaded) return null;

    // Redirect unauthenticated users to the sign-in screen
    if (!isSignedIn) {
        return <Redirect href="/(auth)/sign-in" />;
    }

    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarShowLabel: false,
                tabBarStyle: {
                    position: 'absolute',
                    bottom: Math.max(insets.bottom, TabBar.horizontalInset),
                    height: TabBar.height,
                    marginHorizontal: TabBar.horizontalInset,
                    backgroundColor: colors.primary,
                    borderRadius: TabBar.radius,
                    borderTopWidth: 0,
                    elevation: 0,
                },
                tabBarItemStyle: {
                    height: TabBar.iconFrame,
                    paddingVertical: TabBar.height / 2 - TabBar.iconFrame / 1.6,
                },
                tabBarIconStyle: {
                    width: TabBar.iconFrame,
                    height: TabBar.iconFrame,
                    alignItems: 'center',
                },
            }}
        >
            {tabs.map((tab) => (
                <Tabs.Screen
                    key={tab.name}
                    name={tab.name}
                    options={{
                        title: tab.title,
                        tabBarIcon: ({ focused }) => (
                            <TabIcon focused={focused} icon={tab.icon} />
                        )
                    }}
                />
            ))}
        </Tabs>
    );
};

export default TabLayout;
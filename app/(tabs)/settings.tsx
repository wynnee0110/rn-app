import images from "@/constants/images";
import { colors } from "@/constants/theme";
import { useClerk, useUser } from "@clerk/expo";
import { Image as ExpoImage } from "expo-image";
import dayjs from "dayjs";
import React from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  Text,
  View,
} from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import { styled } from "nativewind";

const SafeAreaView = styled(RNSafeAreaView);

function displayNameForUser(user: ReturnType<typeof useUser>["user"]) {
  if (!user) return "Account";
  if (user.username) return user.username;
  const name = [user.firstName, user.lastName].filter(Boolean).join(" ");
  if (name) return name;
  return user.primaryEmailAddress?.emailAddress ?? "Account";
}

const Settings = () => {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const [signingOut, setSigningOut] = React.useState(false);

  const email = user?.primaryEmailAddress?.emailAddress;
  const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(" ");
  const displayName = displayNameForUser(user);
  const showNameRow = Boolean(fullName && displayName !== fullName);

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await signOut();
    } finally {
      setSigningOut(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background p-5">
      <Text className="mb-6 text-2xl font-san-bold text-foreground">
        Settings
      </Text>

      <Text className="mb-3 text-xs font-san-medium uppercase tracking-wide text-muted-foreground">
        Profile
      </Text>

      {!isLoaded ? (
        <View className="mb-8 items-center py-8">
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : (
        <View className="mb-8 rounded-2xl border border-border bg-card p-5">
          <View className="flex-row items-center">
            {user?.imageUrl ? (
              <ExpoImage
                source={{ uri: user.imageUrl }}
                className="size-20 rounded-full"
                contentFit="cover"
              />
            ) : (
              <Image
                source={images.avatar}
                className="size-20 rounded-full"
              />
            )}
            <View className="ml-4 flex-1">
              <Text className="text-xl font-san-bold text-foreground">
                {displayName}
              </Text>
              {email ? (
                <Text
                  className="mt-1 font-san-regular text-muted-foreground"
                  numberOfLines={2}
                >
                  {email}
                </Text>
              ) : null}
              {user?.createdAt ? (
                <Text className="mt-2 font-san-regular text-xs text-muted-foreground">
                  Member since {dayjs(user.createdAt).format("MMMM YYYY")}
                </Text>
              ) : null}
            </View>
          </View>

          {user?.username ? (
            <View className="mt-5 border-t border-border pt-4">
              <Text className="text-xs font-san-medium uppercase tracking-wide text-muted-foreground">
                Username
              </Text>
              <Text className="mt-1 font-san-semibold text-foreground">
                @{user.username}
              </Text>
            </View>
          ) : null}

          {showNameRow ? (
            <View className="mt-5 border-t border-border pt-4">
              <Text className="text-xs font-san-medium uppercase tracking-wide text-muted-foreground">
                Name
              </Text>
              <Text className="mt-1 font-san-semibold text-foreground">
                {fullName}
              </Text>
            </View>
          ) : null}
        </View>
      )}

      <Pressable
        className="rounded-xl bg-destructive py-4"
        onPress={handleSignOut}
        disabled={signingOut || !isLoaded}
        style={({ pressed }) => ({ opacity: pressed || signingOut ? 0.85 : 1 })}
      >
        {signingOut ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text className="text-center font-san-semibold text-white">
            Log out
          </Text>
        )}
      </Pressable>
    </SafeAreaView>
  );
};

export default Settings;

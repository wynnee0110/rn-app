import images from "@/constants/images";
import "@/global.css";
import { useUser } from "@clerk/expo";
import { Image as ExpoImage } from "expo-image";
import { FlatList, Image, Text, View } from "react-native";

import ListHeading from "@/components/ListHeading";
import SubscriptionCard from "@/components/SubscriptionCard";
import UpcomingSubscriptionCard from "@/components/UpcomingSubscriptionCard";
import { HOME_BALANCE, HOME_SUBSCRIPTIONS, UPCOMING_SUBSCRIPTIONS } from "@/constants/data";
import { icons } from "@/constants/icons";
import { formatCurrency } from "@/lib/utils";
import dayjs from "dayjs";
import { styled } from "nativewind";
import { useMemo, useState } from "react";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

const SafeAreaView = styled(RNSafeAreaView);

function displayNameForUser(user: ReturnType<typeof useUser>["user"]) {
  if (!user) return "Account";
  if (user.username) return user.username;
  const name = [user.firstName, user.lastName].filter(Boolean).join(" ");
  if (name) return name;
  return user.primaryEmailAddress?.emailAddress ?? "Account";
}

export default function App() {
  const { user, isLoaded: userLoaded } = useUser();
  const [expandedSubscriptionId, setExpandedSubscriptionId] = useState<string | null>(null);

  const displayName = useMemo(() => displayNameForUser(user), [user]);

  return (
    <SafeAreaView className="flex-1 bg-background p-5">


        <FlatList ListHeaderComponent={() => (
          <>
                <View className="home-header">
        <View className="home-user">
          {user?.imageUrl ? (
            <ExpoImage
              source={{ uri: user.imageUrl }}
              className="home-avatar"
              contentFit="cover"
            />
          ) : (
            <Image source={images.avatar} className="home-avatar" />
          )}
          <Text className="home-user-name">
            {!userLoaded ? "…" : displayName}
          </Text>

        </View>
        <Image source={icons.add} className="home-add-icon" />
      </View>
      <View className="home-balance-card">
        <Text className="home-balance-label">
          Total Monthly Spending
        </Text>
        <View className="home-balance-row">
          <Text className="home-balance-amount">{formatCurrency(HOME_BALANCE.amount)}</Text>
          <Text className="home-balance-date">{dayjs(HOME_BALANCE.nextRenewalDate).format("MM/DD/YYYY")}</Text>

        </View>

      </View>
      <View className="mb-5">

        
        <ListHeading title="Upcoming" />
        <FlatList data={UPCOMING_SUBSCRIPTIONS}
          renderItem={({ item }) =>
            (<UpcomingSubscriptionCard {...item} />)}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          ListEmptyComponent={<Text className="home-empty">No upcoming renewals yet</Text>}


        />

      </View>
        <ListHeading title="All Subscriptions" />
          </>
        )}
        data={HOME_SUBSCRIPTIONS} 
        keyExtractor={(item)=>item.id}
        renderItem={({item})=>( <SubscriptionCard
          {...item}
          expanded={expandedSubscriptionId === item.id}
          onPress={() => setExpandedSubscriptionId(currentId =>
            currentId === item.id ? null : item.id)}
        />
        )}
        extraData={expandedSubscriptionId}
        ItemSeparatorComponent={()=>(<View className="h-4"></View>)}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={<Text className="home-empty-state">No subscriptions yet</Text>}
        contentContainerClassName="pb-20"

        />

    </SafeAreaView>


  );
}


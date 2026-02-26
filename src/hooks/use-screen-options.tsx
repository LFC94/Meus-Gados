import { CompositeNavigationProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { TouchableOpacity } from "react-native";

import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { RootStackParamList } from "@/types";

type ScreenOptionsNavigationProp = CompositeNavigationProp<
  StackNavigationProp<RootStackParamList>,
  StackNavigationProp<RootStackParamList>
>;

export default function useScreenOptions() {
  const colors = useColors();

  return ({ navigation }: { navigation: ScreenOptionsNavigationProp }) => ({
    headerShown: false,
    gestureEnabled: true,
    headerStyle: {
      backgroundColor: colors.background,
    },
    headerTintColor: colors.foreground,
    headerLeft: () => {
      return (
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="w-10 h-10 items-center justify-center"
          style={{ opacity: 1 }}
        >
          <IconSymbol name="chevron-left" size={24} color={colors.primary} />
        </TouchableOpacity>
      );
    },
  });
}

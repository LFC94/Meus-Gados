import { TouchableOpacity } from "react-native";

import { IconSymbol } from "@/components/icon-symbol";
import { useColors } from "@/hooks/use-colors";

export default function useScreenOptions() {
  const colors = useColors();

  return ({ navigation }: any) => ({
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
          <IconSymbol name="chevron.left" size={24} color={colors.primary} />
        </TouchableOpacity>
      );
    },
  });
}

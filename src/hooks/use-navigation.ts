import { NavigationProp, useNavigation as useNativeNavigation } from "@react-navigation/native";

import { RootStackParamList } from "@/types";

export default function useNavigation() {
  return useNativeNavigation<NavigationProp<RootStackParamList>>();
}

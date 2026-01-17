import { NavigationProp, useNavigation as useNativeNavigation } from "@react-navigation/native";

import { RootStackParamList } from "@/types";

export default function useNavigation() {
  const nav = useNativeNavigation<NavigationProp<RootStackParamList>>();

  const navigate = <RouteName extends keyof RootStackParamList>(
    screen: RouteName,
    ...args: undefined extends RootStackParamList[RouteName]
      ? [params?: RootStackParamList[RouteName]]
      : [params?: RootStackParamList[RouteName]]
  ) => {
    nav.navigate(screen as any, args[0] as any);
  };

  return {
    ...nav,
    navigate,
  };
}

import { ScreenHeader } from "@/components/screen-header";
import { useEffect } from "react";
import useNavigation from "./use-navigation";

export default function useScreenHeader(title: string, subtitle?: string, right?: any) {
  const navigation = useNavigation();

  useEffect(() => {
    navigation.setOptions({
      headerShown: true,
      headerTitle: () => ScreenHeader({ title, subtitle }),
      headerRight: right,
    });
  }, [navigation, title, subtitle, right]);
}

import { ActivityIndicator, Text } from "react-native";

import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks";

interface LoadingScreenProps {
  message?: string;
  size?: "small" | "large";
  fullScreen?: boolean;
}

export function LoadingScreen({ message, size = "large", fullScreen = true }: LoadingScreenProps) {
  const colors = useColors();

  const content = (
    <>
      <ActivityIndicator size={size} color={colors.primary} />
      {message && <Text className="mt-4 text-muted text-center">{message}</Text>}
    </>
  );

  if (fullScreen) {
    return <ScreenContainer className="items-center justify-center">{content}</ScreenContainer>;
  }

  return (
    <ScreenContainer className="items-center justify-center p-4" style={{ flex: 0 }}>
      {content}
    </ScreenContainer>
  );
}

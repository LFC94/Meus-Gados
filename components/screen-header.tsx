import { Text, View } from "react-native";

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
}

export function ScreenHeader({ title, subtitle }: ScreenHeaderProps) {
  return (
    <View>
      <Text style={{ fontSize: 20 }} className="font-bold text-foreground">
        {title}
      </Text>
      {subtitle && <Text className="text-muted mt-1">{subtitle}</Text>}
    </View>
  );
}

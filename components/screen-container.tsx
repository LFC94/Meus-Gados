import { View, type ViewProps } from "react-native";
import { type Edge } from "react-native-safe-area-context";

import { cn } from "@/lib/utils";

export interface ScreenContainerProps extends ViewProps {
  edges?: Edge[];
  className?: string;
  containerClassName?: string;
}

export function ScreenContainer({
  children,
  edges = ["top", "left", "right"],
  className,
  containerClassName,
  style,
  ...props
}: ScreenContainerProps) {
  return (
    <View className={cn("flex-1", "bg-background", containerClassName)} {...props} style={style}>
      <View className={cn("flex-1", className)}>{children}</View>
    </View>
  );
}

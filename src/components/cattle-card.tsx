import { useRouter } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";

import { IconSymbol } from "@/components/icon-symbol";
import { STATUS_CATTLE } from "@/constants/const";
import { useColors } from "@/hooks/use-colors";
import { formatAge } from "@/lib/helpers";
import { Cattle, CattleResult } from "@/types";

interface CattleCardProps {
  cattle: Cattle;
  showStatus?: boolean;
  status: CattleResult;
  onPress?: () => void;
}

export function CattleCard({ cattle, showStatus = true, status, onPress }: CattleCardProps) {
  const router = useRouter();
  const colors = useColors();

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      router.push(`/cattle/${cattle.id}` as any);
    }
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      className="bg-surface rounded-2xl p-4 border border-border flex-row items-center gap-4"
      style={{ opacity: 1 }}
      accessibilityLabel={`Animal ${cattle.number}${cattle.name ? `, ${cattle.name}` : ""}, ${STATUS_CATTLE[status].text}`}
      accessibilityRole="button"
    >
      {/* Status Bar */}
      <View
        className="w-1 h-20 rounded-full"
        style={{ backgroundColor: colors[STATUS_CATTLE[status].color] }}
        accessible={false}
      />

      {/* Content */}
      <View className="flex-1">
        <Text className="text-lg font-semibold text-foreground" numberOfLines={1}>
          {cattle.name || `Animal ${cattle.number}`}
        </Text>
        <Text className="text-sm text-muted mt-1">Nº {cattle.number}</Text>
        <Text className="text-sm text-muted mt-1">
          {cattle.breed} • {formatAge(cattle.birthDate)} • {cattle.weight} kg
        </Text>
      </View>

      {showStatus && (
        <View className="flex items-center">
          <IconSymbol name={STATUS_CATTLE[status].icon} color={colors[STATUS_CATTLE[status].color]} />
          <Text className="font-bold" numberOfLines={1} style={{ color: colors[STATUS_CATTLE[status].color] }}>
            {STATUS_CATTLE[status].text}
          </Text>
        </View>
      )}

      {/* Arrow */}
      <IconSymbol name="chevron-right" size={20} color={colors.muted} />
    </TouchableOpacity>
  );
}

interface CattleCardCompactProps {
  cattle: Cattle;
  onPress?: () => void;
}

export function CattleCardCompact({ cattle, onPress }: CattleCardCompactProps) {
  const router = useRouter();
  const colors = useColors();

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      router.push(`/cattle/${cattle.id}` as any);
    }
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      className="bg-surface rounded-xl p-3 border border-border flex-row items-center gap-3"
      style={{ opacity: 1 }}
      accessibilityLabel={`Animal ${cattle.number}${cattle.name ? `, ${cattle.name}` : ""}`}
      accessibilityRole="button"
    >
      <View className="w-8 h-8 rounded-full items-center justify-center bg-primary/20">
        <IconSymbol name="cow" color={colors.primary} />
      </View>
      <View className="flex-1">
        <Text className="text-sm font-semibold text-foreground" numberOfLines={1}>
          {cattle.name || `Animal ${cattle.number}`}
        </Text>
        <Text className="text-xs text-muted">Nº {cattle.number}</Text>
      </View>
      <IconSymbol name="chevron-right" size={16} color={colors.muted} />
    </TouchableOpacity>
  );
}

import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

import { IconSymbol } from "@/components/icon-symbol";
import { PERIOD_LABELS } from "@/constants/const";
import { useNavigation } from "@/hooks";
import { useColors } from "@/hooks/use-colors";
import { formatDate } from "@/lib/helpers";
import { Cattle, MilkProductionRecord } from "@/types";

interface ProductionCardProps {
  milkProduction: MilkProductionRecord & { cattle: Cattle };
  onPress?: () => void;
  handleDelete?: () => void;
}

export function ProductionCard({ milkProduction, onPress, handleDelete }: ProductionCardProps) {
  const navigation = useNavigation();
  const colors = useColors();

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      navigation.navigate("MilkProductionCad", { id: milkProduction.id });
    }
  };

  return (
    <View className="bg-surface rounded-2xl p-4 border border-border">
      <View className="flex-row items-start justify-between">
        <View className="flex-1">
          <Text className="text-base font-semibold text-foreground" numberOfLines={1}>
            {milkProduction.cattle.name || `Animal ${milkProduction.cattle.number}`}
          </Text>
        </View>
        {/* Action Buttons */}
        <View className="flex-row gap-2">
          <TouchableOpacity
            onPress={() => handlePress()}
            className="w-8 h-8 items-center justify-center"
            style={{ opacity: 1 }}
          >
            <IconSymbol name="pencil" size={18} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleDelete}
            className="w-8 h-8 items-center justify-center"
            style={{ opacity: 1 }}
          >
            <IconSymbol name="trash" size={18} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </View>
      <View className="flex-row items-start justify-between">
        <View className="flex-1">
          <Text className="text-sm text-muted mt-1">Nº {milkProduction.cattle.number}</Text>
          <View className="flex-row items-center gap-2 mt-2">
            <View className="px-2 py-1 rounded-md" style={{ backgroundColor: `${colors.primary}30` }}>
              <Text className="text-xs font-medium text-primary uppercase">{PERIOD_LABELS[milkProduction.period]}</Text>
            </View>
            <Text className="text-sm text-muted">{formatDate(milkProduction.date)}</Text>
          </View>
        </View>
        <View className="items-end">
          <Text className="text-2xl font-bold text-primary">{milkProduction.quantity.toFixed(1)}</Text>
          <Text className="text-xs text-muted">Litros</Text>
        </View>
      </View>
    </View>
  );
}

interface ProductionCardCompactProps {
  milkProduction: MilkProductionRecord;
  onPress?: () => void;
  handleDelete?: () => void;
}

export function ProductionCardCompact({ milkProduction, onPress, handleDelete }: ProductionCardCompactProps) {
  const navigation = useNavigation();
  const colors = useColors();

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      navigation.navigate("MilkProductionCad", { id: milkProduction.id });
    }
  };

  return (
    <View className="bg-surface rounded-2xl px-4 py-2 border border-border">
      <View className="flex-row items-start justify-between">
        <View className=" items-center gap-2">
          <Text className="text-sm text-muted">{formatDate(milkProduction.date)}</Text>
          <View className="px-2 py-1 rounded-md" style={{ backgroundColor: `${colors.primary}30` }}>
            <Text className="text-xs font-medium text-primary uppercase">{PERIOD_LABELS[milkProduction.period]}</Text>
          </View>
        </View>
        <View className="flex-1 items-center justify-center">
          <Text className="text-2xl font-bold text-primary">{milkProduction.quantity.toFixed(1)}</Text>
          <Text className="text-xs text-muted">Litros</Text>
        </View>
        <View className="flex-row gap-2">
          <TouchableOpacity
            onPress={() => handlePress()}
            className="w-8 h-8 items-center justify-center"
            style={{ opacity: 1 }}
          >
            <IconSymbol name="pencil" size={18} color={colors.primary} />
          </TouchableOpacity>
          {handleDelete && (
            <TouchableOpacity
              onPress={handleDelete}
              className="w-8 h-8 items-center justify-center"
              style={{ opacity: 1 }}
            >
              <IconSymbol name="trash" size={18} color="#EF4444" />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}

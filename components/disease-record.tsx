import { IconSymbol } from "@/components/icon-symbol";
import { DISEASE_RESULT_LABELS } from "@/constants/const";
import { useColors } from "@/hooks/use-colors";
import { formatDate } from "@/lib/helpers";
import { Disease, DiseaseResult } from "@/types";
import React, { useState } from "react";
import { Animated, Text, TouchableOpacity, View } from "react-native";

interface DiseaseRecordProps {
  disease: Disease;
  onEdit?: () => void;
  onDelete?: () => void;
  expanded?: boolean;
}

export function DiseaseRecord({ disease, onEdit, onDelete, expanded = false }: DiseaseRecordProps) {
  const colors = useColors();
  const [isExpanded, setIsExpanded] = useState(expanded);
  const [animation] = useState(new Animated.Value(0));

  const getResultColor = (result: DiseaseResult): string => {
    switch (result) {
      case "in_treatment":
        return "#F59E0B";
      case "cured":
        return "#22C55E";
      case "death":
        return "#EF4444";
      default:
        return colors.muted;
    }
  };

  const getResultBgColor = (result: DiseaseResult): string => {
    switch (result) {
      case "in_treatment":
        return "#F59E0B20";
      case "cured":
        return "#22C55E20";
      case "death":
        return "#EF444420";
      default:
        return colors.surface;
    }
  };

  const toggleExpanded = () => {
    Animated.timing(animation, {
      toValue: isExpanded ? 0 : 1,
      duration: 200,
      useNativeDriver: false,
    }).start();
    setIsExpanded(!isExpanded);
  };

  const heightInterpolation = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 100],
  });

  return (
    <View className="bg-surface rounded-2xl border border-border overflow-hidden">
      {/* Header - Always Visible */}
      <TouchableOpacity
        onPress={toggleExpanded}
        className="p-4 flex-row items-center justify-between"
        style={{ opacity: 1 }}
        accessibilityLabel={`Doença ${disease.type}, status: ${DISEASE_RESULT_LABELS[disease.result]}`}
        accessibilityRole="button"
      >
        <View className="flex-1 flex-row items-center gap-3">
          <View
            className="w-10 h-10 rounded-full items-center justify-center"
            style={{ backgroundColor: getResultBgColor(disease.result) }}
          >
            <Text className="text-lg">
              {disease.result === "in_treatment" ? "🏥" : disease.result === "cured" ? "✅" : "✝️"}
            </Text>
          </View>
          <View className="flex-1">
            <Text className="text-base font-semibold text-foreground">{disease.type}</Text>
            <View className="flex-row items-center gap-2 mt-1">
              <Text className="text-sm text-muted">{formatDate(disease.diagnosisDate)}</Text>
              <View className="px-2 py-0.5 rounded-full" style={{ backgroundColor: getResultBgColor(disease.result) }}>
                <Text className="text-xs font-medium" style={{ color: getResultColor(disease.result) }}>
                  {DISEASE_RESULT_LABELS[disease.result]}
                </Text>
              </View>
            </View>
          </View>
        </View>
        <IconSymbol name={isExpanded ? "chevron.up" : "chevron.down"} size={20} color={colors.muted} />
      </TouchableOpacity>

      {/* Expanded Content */}
      {isExpanded && (
        <Animated.View className="px-4 pb-4 gap-3" style={{ height: heightInterpolation }}>
          <View className="h-px bg-border" />
          <View>
            <Text className="text-sm font-medium text-muted mb-1">Sintomas</Text>
            <Text className="text-sm text-foreground">{disease.symptoms}</Text>
          </View>
          <View>
            <Text className="text-sm font-medium text-muted mb-1">Tratamento</Text>
            <Text className="text-sm text-foreground">{disease.treatment}</Text>
          </View>

          {/* Action Buttons */}
          {(onEdit || onDelete) && (
            <View className="flex-row gap-2 pt-2">
              {onEdit && (
                <TouchableOpacity
                  onPress={onEdit}
                  className="flex-1 bg-primary/20 rounded-lg py-2 items-center"
                  style={{ opacity: 1 }}
                >
                  <Text className="text-primary font-semibold text-sm">Editar</Text>
                </TouchableOpacity>
              )}
              {onDelete && (
                <TouchableOpacity
                  onPress={onDelete}
                  className="flex-1 bg-error/20 rounded-lg py-2 items-center"
                  style={{ opacity: 1 }}
                >
                  <Text className="text-error font-semibold text-sm">Excluir</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </Animated.View>
      )}
    </View>
  );
}

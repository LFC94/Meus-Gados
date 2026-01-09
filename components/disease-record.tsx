import { IconSymbol } from "@/components/icon-symbol";
import { DISEASE_RESULT_LABELS } from "@/constants/const";
import { useColors } from "@/hooks/use-colors";
import { formatDate } from "@/lib/helpers";
import { Disease } from "@/types";
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

  const toggleExpanded = () => {
    Animated.timing(animation, {
      toValue: isExpanded ? 0 : 1,
      duration: 200,
      useNativeDriver: false,
    }).start();
    setIsExpanded(!isExpanded);
  };

  return (
    <View className="bg-surface rounded-2xl border border-border overflow-hidden">
      {/* Header - Always Visible */}
      <TouchableOpacity
        onPress={toggleExpanded}
        className="p-4 flex-row items-center justify-between"
        style={{ opacity: 1 }}
        accessibilityLabel={`Doença ${disease.type}, status: ${DISEASE_RESULT_LABELS[disease.result].text}`}
        accessibilityRole="button"
      >
        <View className="flex-1 flex-row items-center gap-3">
          <View
            className="w-10 h-10 rounded-full items-center justify-center"
            style={{ backgroundColor: DISEASE_RESULT_LABELS[disease.result].bg }}
          >
            <Text className="text-lg">{DISEASE_RESULT_LABELS[disease.result].icon}</Text>
          </View>
          <View className="flex-1">
            <Text className="text-base font-semibold text-foreground">{disease.type}</Text>
            <View className="flex-row items-center gap-2 mt-1">
              <Text className="text-sm text-muted">{formatDate(disease.diagnosisDate)}</Text>
              <View
                className="px-2 py-0.5 rounded-full"
                style={{ backgroundColor: DISEASE_RESULT_LABELS[disease.result].bg }}
              >
                <Text className="text-xs font-medium" style={{ color: DISEASE_RESULT_LABELS[disease.result].color }}>
                  {DISEASE_RESULT_LABELS[disease.result].text}
                </Text>
              </View>
            </View>
          </View>
        </View>
        <IconSymbol name={isExpanded ? "chevron.up" : "chevron.down"} size={20} color={colors.muted} />
      </TouchableOpacity>

      {/* Expanded Content */}
      {isExpanded && (
        <Animated.View className="px-4 pb-4 gap-3">
          <View className="h-px bg-border" />
          <View className="flex-row justify-between items-start">
            <View>
              <View>
                <Text className="text-sm font-medium text-muted mb-1">Sintomas</Text>
                <Text className="text-sm text-foreground">{disease.symptoms}</Text>
              </View>
              <View>
                <Text className="text-sm font-medium text-muted mb-1">Tratamento</Text>
                <Text className="text-sm text-foreground">{disease.treatment}</Text>
              </View>
            </View>
            {(onEdit || onDelete) && (
              <View className="flex-row gap-2">
                {onEdit && (
                  <TouchableOpacity onPress={onEdit} style={{ opacity: 1 }} accessibilityLabel="Editar">
                    <IconSymbol name="pencil" size={18} color={colors.primary} />
                  </TouchableOpacity>
                )}
                {onDelete && (
                  <TouchableOpacity onPress={onDelete} style={{ opacity: 1 }} accessibilityLabel="Excluir">
                    <IconSymbol name="trash" size={18} color="#EF4444" />
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>
        </Animated.View>
      )}
    </View>
  );
}

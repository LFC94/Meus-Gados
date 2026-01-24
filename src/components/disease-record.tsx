import { Text, View } from "react-native";

import { DISEASE_RESULT_LABELS } from "@/constants/const";
import { useColors } from "@/hooks";
import { formatDate } from "@/lib/helpers";
import { Disease } from "@/types";

import { CardEdit } from "./card-edit";

interface DiseaseRecordProps {
  disease: Disease;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function DiseaseRecord({ disease, onEdit, onDelete }: DiseaseRecordProps) {
  const colors = useColors();
  const resultLabel = DISEASE_RESULT_LABELS[disease.result];
  const colorValue = colors[resultLabel.color];

  return (
    <CardEdit
      className="p-4 flex-row items-center justify-between"
      style={{ opacity: 1 }}
      accessibilityLabel={`Doença ${disease.type}, status: ${resultLabel.text}`}
      accessibilityRole="button"
      handleEdit={onEdit}
      handleDelete={onDelete}
      title={disease.type}
      icon={resultLabel.icon}
      label={
        <View className="px-2 py-0.5 rounded-full" style={{ backgroundColor: `${colorValue}20` }}>
          <Text className="text-xs font-medium" style={{ color: colorValue }}>
            {resultLabel.text}
          </Text>
        </View>
      }
    >
      <View className="gap-3">
        <View className="flex-row gap-2">
          <Text className="text-sm font-semibold text-foreground">Diagnóstico:</Text>
          <Text className="text-sm text-muted">{formatDate(disease.diagnosisDate)}</Text>
        </View>
        <View className="flex-row gap-2">
          <Text className="text-sm font-semibold text-foreground">Sintomas:</Text>
          <Text className="text-sm text-muted" numberOfLines={1}>
            {disease.symptoms}
          </Text>
        </View>
        <View className="flex-row gap-2">
          <Text className="text-sm font-semibold text-foreground">Tratamento:</Text>
          <Text className="text-sm text-muted" numberOfLines={1}>
            {disease.treatment}
          </Text>
        </View>
      </View>
    </CardEdit>
  );
}

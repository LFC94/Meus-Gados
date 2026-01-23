import { Text, View } from "react-native";

import { DISEASE_RESULT_LABELS } from "@/constants/const";
import { formatDate } from "@/lib/helpers";
import { Disease } from "@/types";

import { CardEdit } from "./card-edit";

interface DiseaseRecordProps {
  disease: Disease;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function DiseaseRecord({ disease, onEdit, onDelete }: DiseaseRecordProps) {
  return (
    <CardEdit
      className="p-4 flex-row items-center justify-between"
      style={{ opacity: 1 }}
      accessibilityLabel={`Doença ${disease.type}, status: ${DISEASE_RESULT_LABELS[disease.result].text}`}
      accessibilityRole="button"
      handleEdit={onEdit}
      handleDelete={onDelete}
      title={disease.type}
      icon={DISEASE_RESULT_LABELS[disease.result].icon}
      label={
        <View
          className="px-2 py-0.5 rounded-full"
          style={{ backgroundColor: `${DISEASE_RESULT_LABELS[disease.result].color}20` }}
        >
          <Text className="text-xs font-medium" style={{ color: DISEASE_RESULT_LABELS[disease.result].color }}>
            {DISEASE_RESULT_LABELS[disease.result].text}
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

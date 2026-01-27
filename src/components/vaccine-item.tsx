import { Text, View } from "react-native";

import { useColors } from "@/hooks/use-colors";
import { daysUntil, formatDate, getVaccineStatus, getVaccineStatusColor, getVaccineStatusLabel } from "@/lib/helpers";
import { VaccinationRecordWithDetails } from "@/types";

import { CardEdit } from "./card-edit";

interface VaccineItemProps {
  vaccine: VaccinationRecordWithDetails;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function VaccineItem({ vaccine, onEdit, onDelete }: VaccineItemProps) {
  const colors = useColors();

  return (
    <CardEdit
      title={vaccine.vaccineName}
      label={<VaccineBadge vaccine={vaccine} />}
      handleEdit={onEdit}
      handleDelete={onDelete}
      small
    >
      <View className="flex-1">
        {vaccine.batchUsed && <Text className="text-sm text-muted mt-1">Lote: {vaccine.batchUsed}</Text>}
        <View className="flex-row gap-3">
          <Text className="text-sm text-muted mt-1">Aplicada: {formatDate(vaccine.dateApplied)}</Text>
          {vaccine.nextDoseDate && !vaccine.isNextDoseApplied && (
            <Text
              className="text-sm mt-1"
              style={{
                color: daysUntil(vaccine.nextDoseDate) < 0 ? colors.error : colors.success,
              }}
            >
              Próxima: {formatDate(vaccine.nextDoseDate)}
            </Text>
          )}
        </View>
      </View>
    </CardEdit>
  );
}

interface VaccineBadgeProps {
  vaccine: VaccinationRecordWithDetails;
}

export function VaccineBadge({ vaccine }: VaccineBadgeProps) {
  const colors = useColors();
  const getStatusInfoDetail = () => {
    const status = getVaccineStatus(vaccine.nextDoseDate, vaccine.isNextDoseApplied);

    return {
      color: colors[getVaccineStatusColor(status)],
      label: getVaccineStatusLabel(vaccine.nextDoseDate, vaccine.isNextDoseApplied),
      status,
    };
  };
  const status = getStatusInfoDetail();

  return (
    <View
      className="px-2 py-1 rounded-full flex-row items-center gap-1"
      style={{ backgroundColor: `${status.color}30` }}
    >
      <View className="w-2 h-2 rounded-full" style={{ backgroundColor: status.color }} />
      <Text className="text-xs font-medium" style={{ color: status.color }}>
        {status.label}
      </Text>
    </View>
  );
}

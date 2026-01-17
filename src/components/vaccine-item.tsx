import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

import { IconSymbol } from "@/components/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { formatDate } from "@/lib/helpers";
import { VaccinationRecordWithDetails } from "@/types";

interface VaccineItemProps {
  vaccine: VaccinationRecordWithDetails;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function VaccineItem({ vaccine, onEdit, onDelete }: VaccineItemProps) {
  const colors = useColors();
  const today = new Date();
  const nextDoseDate = vaccine.nextDoseDate ? new Date(vaccine.nextDoseDate) : null;
  const daysUntilNextDose = nextDoseDate
    ? Math.ceil((nextDoseDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    : null;

  const getStatusInfo = () => {
    if (!nextDoseDate) {
      return { color: "#22C55E", label: "Em dia", bgColor: "#22C55E20" };
    }
    if (daysUntilNextDose !== null && daysUntilNextDose < 0) {
      return { color: "#EF4444", label: "Atrasada", bgColor: "#EF444420" };
    }
    if (daysUntilNextDose !== null && daysUntilNextDose <= 30) {
      return { color: "#F59E0B", label: `Em ${daysUntilNextDose}d`, bgColor: "#F59E0B20" };
    }
    return { color: "#22C55E", label: "Em dia", bgColor: "#22C55E20" };
  };

  const status = getStatusInfo();

  return (
    <View className="bg-surface rounded-2xl p-4 border border-border gap-2">
      <View className="flex-row justify-between items-start">
        <View className="flex-1">
          <View className="flex-row items-center gap-2 mb-1">
            <Text className="text-base font-semibold text-foreground">{vaccine.vaccineName}</Text>
            <View className="px-2 py-0.5 rounded-full" style={{ backgroundColor: status.bgColor }}>
              <Text className="text-xs font-semibold" style={{ color: status.color }}>
                {status.label}
              </Text>
            </View>
          </View>
          <Text className="text-sm text-muted mt-1">Lote: {vaccine.batchUsed}</Text>
          <Text className="text-sm text-muted mt-1">Aplicada: {formatDate(vaccine.dateApplied)}</Text>
          {vaccine.nextDoseDate && (
            <Text
              className="text-sm mt-1"
              style={{
                color: daysUntilNextDose !== null && daysUntilNextDose < 0 ? "#EF4444" : colors.muted,
              }}
            >
              Próxima: {formatDate(vaccine.nextDoseDate)}
            </Text>
          )}
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
    </View>
  );
}

interface VaccineBadgeProps {
  vaccine: VaccinationRecordWithDetails;
}

export function VaccineBadge({ vaccine }: VaccineBadgeProps) {
  const today = new Date();
  const nextDoseDate = vaccine.nextDoseDate ? new Date(vaccine.nextDoseDate) : null;
  const daysUntilNextDose = nextDoseDate
    ? Math.ceil((nextDoseDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    : null;

  const getStatusInfo = () => {
    if (!nextDoseDate) {
      return { color: "#22C55E", label: "Vacinado" };
    }
    if (daysUntilNextDose !== null && daysUntilNextDose < 0) {
      return { color: "#EF4444", label: "Atrasado" };
    }
    if (daysUntilNextDose !== null && daysUntilNextDose <= 30) {
      return { color: "#F59E0B", label: "Pendente" };
    }
    return { color: "#22C55E", label: "Vacinado" };
  };

  const status = getStatusInfo();

  return (
    <View
      className="px-2 py-1 rounded-full flex-row items-center gap-1"
      style={{ backgroundColor: `${status.color}20` }}
    >
      <View className="w-2 h-2 rounded-full" style={{ backgroundColor: status.color }} />
      <Text className="text-xs font-medium" style={{ color: status.color }}>
        {status.label}
      </Text>
    </View>
  );
}

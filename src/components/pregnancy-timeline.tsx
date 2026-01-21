import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

import { useColors } from "@/hooks/use-colors";
import { calculateDaysPregnant, formatDate } from "@/lib/helpers";
import { Pregnancy } from "@/types";

import { IconSymbol } from "./icon-symbol";

interface PregnancyTimelineProps {
  pregnancy: Pregnancy;
  onEdit?: () => void;
  onDelete?: () => void;
  onCompleteBirth?: () => void;
  onCreateCalf?: () => void;
}

export function PregnancyTimeline({
  pregnancy,
  onEdit,
  onDelete,
  onCompleteBirth,
  onCreateCalf,
}: PregnancyTimelineProps) {
  const colors = useColors();
  const today = new Date();
  const coverageDate = new Date(pregnancy.coverageDate);
  const expectedBirthDate = new Date(pregnancy.expectedBirthDate);
  const actualBirthDate = pregnancy.actualBirthDate ? new Date(pregnancy.actualBirthDate) : null;

  const totalDays = 280;
  const daysElapsed =
    pregnancy.result === "pending"
      ? calculateDaysPregnant(pregnancy.coverageDate)
      : actualBirthDate
        ? Math.ceil((actualBirthDate.getTime() - coverageDate.getTime()) / (1000 * 60 * 60 * 24))
        : totalDays;

  const progress = Math.min((daysElapsed / totalDays) * 100, 100);
  const isPastDue = today > expectedBirthDate && pregnancy.result === "pending";
  const isCompleted = pregnancy.result !== "pending";

  const getStatusColor = (): string => {
    if (pregnancy.result === "success") return "#22C55E";
    if (pregnancy.result === "complications") return "#F59E0B";
    if (pregnancy.result === "failed") return "#EF4444";
    if (isPastDue) return "#EF4444";
    return colors.primary;
  };

  const getStatusText = (): string => {
    if (pregnancy.result === "success") return "Parto realizado com sucesso";
    if (pregnancy.result === "complications") return "Parto com complicações";
    if (pregnancy.result === "failed") return "Gestação perdida";
    if (isPastDue) return "Atrasada - Verificar";
    return "Em andamento";
  };

  return (
    <View className="bg-surface rounded-2xl p-4 border border-border gap-4">
      {/* Header */}
      <View className="flex-row justify-between items-start">
        <View>
          <Text className="text-lg font-semibold text-foreground">Gestação</Text>
          <View className="px-2 py-0.5 rounded-full mt-1 self-start bg-primary/20">
            <Text className="text-xs font-medium" style={{ color: getStatusColor() }}>
              {getStatusText()}
            </Text>
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

      {/* Timeline Progress */}
      <View className="gap-2">
        <View className="flex-row justify-between text-xs">
          <Text className="text-muted text-xs">Cobertura</Text>
          <Text className="text-muted text-xs">Parto Previsto</Text>
        </View>
        <View className="h-3 bg-border rounded-full overflow-hidden">
          <View
            className="h-full rounded-full"
            style={{
              width: `${progress}%`,
              backgroundColor: getStatusColor(),
            }}
          />
        </View>
        <View className="flex-row justify-between">
          <Text className="text-xs text-muted">{formatDate(pregnancy.coverageDate)}</Text>
          <Text className="text-xs font-semibold" style={{ color: getStatusColor() }}>
            {daysElapsed}/{totalDays} dias
          </Text>
          <Text className="text-xs text-muted">{formatDate(pregnancy.expectedBirthDate)}</Text>
        </View>
      </View>

      {/* Details */}
      <View className="gap-2 pt-2 border-t border-border">
        <View className="flex-row justify-between">
          <Text className="text-sm text-muted">Data de Cobertura</Text>
          <Text className="text-sm font-semibold text-foreground">{formatDate(pregnancy.coverageDate)}</Text>
        </View>
        <View className="flex-row justify-between">
          <Text className="text-sm text-muted">Previsão de Parto</Text>
          <Text
            className="text-sm font-semibold"
            style={{ color: isPastDue && !isCompleted ? "#EF4444" : colors.foreground }}
          >
            {formatDate(pregnancy.expectedBirthDate)}
          </Text>
        </View>
        {actualBirthDate && (
          <View className="flex-row justify-between">
            <Text className="text-sm text-muted">Data do Parto</Text>
            <Text className="text-sm font-semibold text-foreground">{formatDate(actualBirthDate.toISOString())}</Text>
          </View>
        )}
        {pregnancy.complications && (
          <View className="mt-2 p-2 bg-warning/10 rounded-lg">
            <Text className="text-sm text-warning font-medium">Complicações:</Text>
            <Text className="text-sm text-muted mt-1">{pregnancy.complications}</Text>
          </View>
        )}
        {pregnancy.result === "success" && !pregnancy.calfId && onCreateCalf && (
          <TouchableOpacity
            onPress={onCreateCalf}
            className="mt-2 bg-primary rounded-lg p-3 items-center"
            style={{ opacity: 1 }}
          >
            <Text className="text-white font-semibold">Cadastrar Bezerro</Text>
          </TouchableOpacity>
        )}
        {pregnancy.calfId && (
          <View className="mt-2 p-2 bg-success/10 rounded-lg">
            <Text className="text-sm text-success font-medium">✓ Bezerro cadastrado</Text>
          </View>
        )}
      </View>
    </View>
  );
}

interface PregnancyBadgeProps {
  pregnancy: Pregnancy;
}

export function PregnancyBadge({ pregnancy }: PregnancyBadgeProps) {
  const colors = useColors();
  const today = new Date();
  const expectedBirthDate = new Date(pregnancy.expectedBirthDate);
  const isPastDue = today > expectedBirthDate;

  if (pregnancy.result !== "pending") return null;

  return (
    <View
      className="px-2 py-1 rounded-full flex-row items-center gap-1"
      style={{ backgroundColor: isPastDue ? "#EF444420" : `${colors.primary}20` }}
    >
      <View className="w-2 h-2 rounded-full" style={{ backgroundColor: isPastDue ? "#EF4444" : colors.primary }} />
      <Text className="text-xs font-medium" style={{ color: isPastDue ? "#EF4444" : colors.primary }}>
        {isPastDue ? "Atrasada" : "Gestante"}
      </Text>
    </View>
  );
}

import { Text, TouchableOpacity, View } from "react-native";

import { ThemeColorPalette } from "@/constants/theme";
import { useColors } from "@/hooks/use-colors";
import { calculateDaysPregnant, formatDate } from "@/lib/helpers";
import { Pregnancy } from "@/types";

import { CardEdit } from "./card-edit";

function getStatusColor(isPastDue: boolean, result?: string): keyof ThemeColorPalette {
  if (result === "success") return "success";
  if (result === "complications") return "pregnant_delayed";
  if (result === "failed" || isPastDue) return "error";
  return "primary";
}
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

  const statusColor = colors[getStatusColor(isPastDue, pregnancy.result)];

  return (
    <CardEdit
      title="Gestação"
      label={<PregnancyBadge pregnancy={pregnancy} />}
      handleEdit={onEdit}
      handleDelete={onDelete}
    >
      {!isCompleted && (
        <View className="gap-2 border-b border-border py-1">
          <View className="flex-row justify-between text-xs">
            <Text className="text-muted text-xs">Cobertura</Text>
            <Text className="text-muted text-xs">Parto Previsto</Text>
          </View>
          <View className="h-3 bg-border rounded-full overflow-hidden">
            <View
              className="h-full rounded-full"
              style={{
                width: `${progress}%`,
                backgroundColor: statusColor,
              }}
            />
          </View>
          <Text className="flex text-center text-xs font-semibold" style={{ color: statusColor }}>
            {daysElapsed}/{totalDays} dias
          </Text>
        </View>
      )}
      <View className="gap-2 pt-2">
        <View className="flex-row justify-between">
          <Text className="text-sm text-muted">Data de Cobertura</Text>
          <Text className="text-sm font-semibold text-foreground">{formatDate(pregnancy.coverageDate)}</Text>
        </View>
        <View className="flex-row justify-between">
          <Text className="text-sm text-muted">Previsão de Parto</Text>
          <Text className="text-sm font-semibold" style={{ color: isPastDue ? colors.error : colors.foreground }}>
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
    </CardEdit>
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

  const getStatusText = (): string => {
    if (pregnancy.result === "success") return "Parto realizado com sucesso";
    if (pregnancy.result === "complications") return "Parto com complicações";
    if (pregnancy.result === "failed") return "Gestação perdida";
    if (isPastDue) return "Atrasada - Verificar";
    return "Em andamento";
  };

  if (pregnancy.result !== "pending") return null;

  return (
    <View className="px-2 py-0.5 rounded-full mt-1 self-start bg-primary/20">
      <Text className="text-xs font-medium" style={{ color: colors[getStatusColor(isPastDue, pregnancy.result)] }}>
        {getStatusText()}
      </Text>
    </View>
  );
}

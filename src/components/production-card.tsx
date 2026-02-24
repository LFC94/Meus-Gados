import { Alert, Text, View } from "react-native";

import { PERIOD_LABELS } from "@/constants/const";
import { useColors, useNavigation } from "@/hooks";
import { formatDate } from "@/lib/helpers";
import { logger } from "@/lib/logger";
import { milkProductionStorage } from "@/lib/storage";
import { Cattle, MilkProductionRecord } from "@/types";

import { CardEdit } from "./card-edit";

interface ProductionCardProps {
  milkProduction: MilkProductionRecord & { cattle: Cattle };
}

export function ProductionCard({ milkProduction }: ProductionCardProps) {
  const navigation = useNavigation();
  const colors = useColors();

  const handleDelete = async () => {
    Alert.alert("Excluir Registro", `Tem certeza que deseja excluir o registro de este registro de produção?`, [
      {
        text: "Cancelar",
        style: "cancel",
      },
      {
        text: "Excluir",
        style: "destructive",
        onPress: async () => {
          try {
            await milkProductionStorage.delete(milkProduction.id);
          } catch (error) {
            logger.error("ProductionCard/delete", error);
            Alert.alert("Erro", "Não foi possível excluir o registro");
          }
        },
      },
    ]);
  };

  return (
    <CardEdit
      title={milkProduction.cattle.name || `Animal ${milkProduction.cattle.number}`}
      handleEdit={() => navigation.navigate("MilkProductionCad", { id: milkProduction.id })}
      handleDelete={handleDelete}
    >
      <View className="flex-row items-start justify-between">
        <View className="flex-1">
          <Text className="text-sm text-muted mt-1">Nº {milkProduction.cattle.number}</Text>
          <View className="flex-row items-center gap-2 mt-2">
            <View
              className="px-2 py-1 rounded-lg border"
              style={{
                backgroundColor: `${colors[milkProduction.period]}20`,
                borderColor: colors[milkProduction.period],
              }}
            >
              <Text className="text-xs font-medium uppercase" style={{ color: colors[milkProduction.period] }}>
                {PERIOD_LABELS[milkProduction.period]}
              </Text>
            </View>
            <Text className="text-sm text-muted">{formatDate(milkProduction.date)}</Text>
          </View>
        </View>
        <View className="items-end">
          <Text className="text-2xl font-bold text-primary">{milkProduction.quantity.toFixed(1)}</Text>
          <Text className="text-xs text-muted">Litros</Text>
        </View>
      </View>
    </CardEdit>
  );
}

interface ProductionCardCompactProps {
  milkProduction: MilkProductionRecord;
}

export function ProductionCardCompact({ milkProduction }: ProductionCardCompactProps) {
  const navigation = useNavigation();
  const colors = useColors();

  const handleDelete = async () => {
    Alert.alert("Excluir Registro", `Tem certeza que deseja excluir o registro de este registro de produção?`, [
      {
        text: "Cancelar",
        style: "cancel",
      },
      {
        text: "Excluir",
        style: "destructive",
        onPress: async () => {
          try {
            await milkProductionStorage.delete(milkProduction.id);
          } catch (error) {
            logger.error("ProductionCardCompact/delete", error);
            Alert.alert("Erro", "Não foi possível excluir o registro");
          }
        },
      },
    ]);
  };

  return (
    <CardEdit
      handleEdit={() => navigation.navigate("MilkProductionCad", { id: milkProduction.id })}
      handleDelete={handleDelete}
      small
    >
      <View className="flex-row items-center justify-between px-2">
        <Text className="text-sm text-muted">{formatDate(milkProduction.date)}</Text>
        <View
          className="px-2 py-1 rounded-lg border"
          style={{ backgroundColor: `${colors[milkProduction.period]}20`, borderColor: colors[milkProduction.period] }}
        >
          <Text className="text-xs font-medium uppercase" style={{ color: colors[milkProduction.period] }}>
            {PERIOD_LABELS[milkProduction.period]}
          </Text>
        </View>
        <View className="items-center justify-center">
          <Text className="text-xl font-bold text-primary">{milkProduction.quantity.toFixed(1)}</Text>
          <Text className="text-xs text-muted">Litros</Text>
        </View>
      </View>
    </CardEdit>
  );
}

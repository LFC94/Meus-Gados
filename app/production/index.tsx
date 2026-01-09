import { ScreenContainer } from "@/components/screen-container";
import { useNavigation } from "@/hooks";
import { useColors } from "@/hooks/use-colors";
import useScreenHeader from "@/hooks/use-screen-header";
import { formatDate } from "@/lib/helpers";
import { milkProductionStorage } from "@/lib/storage";
import { Cattle, MilkProductionRecord } from "@/types";
import { useFocusEffect } from "@react-navigation/native";
import React, { useState } from "react";
import { ActivityIndicator, RefreshControl, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const PERIOD_LABELS = {
  morning: "Manhã",
  afternoon: "Tarde",
  full_day: "Dia Todo",
};

export default function MilkProductionListScreen() {
  const navigation = useNavigation();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [records, setRecords] = useState<(MilkProductionRecord & { cattle: Cattle })[]>([]);

  useScreenHeader("Controle de Leite");

  useFocusEffect(
    React.useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await milkProductionStorage.getRecent(50);
      setRecords(data);
    } catch (error) {
      console.error("Error loading milk production:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      const data = await milkProductionStorage.getRecent(50);
      setRecords(data);
    } catch (error) {
      console.error("Error refreshing milk production:", error);
    } finally {
      setRefreshing(false);
    }
  };

  if (loading && !refreshing) {
    return (
      <ScreenContainer className="items-center justify-center">
        <ActivityIndicator size="large" color={colors.primary} />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="p-0">
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.primary} />}
        contentContainerStyle={{ flexGrow: 1 }}
        style={{ paddingBottom: insets.bottom }}
      >
        <View className="px-6 gap-4 flex-1">
          {records.length === 0 ? (
            <View className="flex-1 items-center justify-center py-12">
              <Text className="text-6xl mb-4">🥛</Text>
              <Text className="text-lg font-semibold text-foreground text-center">Nenhum registro encontrado</Text>
              <Text className="text-muted text-center mt-2">
                Comece registrando a produção de leite dos seus animais.
              </Text>
            </View>
          ) : (
            <View className="gap-3">
              {records.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  onPress={() => navigation.navigate("MilkProductionCad", { id: item.id })}
                  className="bg-surface rounded-2xl p-4 border border-border"
                >
                  <View className="flex-row items-start justify-between">
                    <View className="flex-1">
                      <Text className="text-base font-semibold text-foreground" numberOfLines={1}>
                        {item.cattle.name || `Animal ${item.cattle.number}`}
                      </Text>
                      <Text className="text-sm text-muted mt-1">Nº {item.cattle.number}</Text>
                      <View className="flex-row items-center gap-2 mt-2">
                        <View className="bg-primary/10 px-2 py-1 rounded-md">
                          <Text className="text-xs font-medium text-primary uppercase">
                            {PERIOD_LABELS[item.period]}
                          </Text>
                        </View>
                        <Text className="text-sm text-muted">{formatDate(item.date)}</Text>
                      </View>
                    </View>
                    <View className="items-end">
                      <Text className="text-2xl font-bold text-primary">{item.quantity.toFixed(1)}</Text>
                      <Text className="text-xs text-muted">Litros</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
          {/* Add Button */}
          <TouchableOpacity
            onPress={() => navigation.navigate("MilkProductionCad", {})}
            className="bg-primary rounded-full p-4 items-center mt-4"
            style={{ opacity: 1 }}
          >
            <Text className="text-background font-semibold text-base">+ Cadastrar Ordenha</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

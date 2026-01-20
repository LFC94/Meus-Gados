import { useFocusEffect } from "@react-navigation/native";
import React, { useState } from "react";
import { ActivityIndicator, Alert, RefreshControl, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ProductionCard } from "@/components";
import { ScreenContainer } from "@/components/screen-container";
import { useNavigation } from "@/hooks";
import { useColors } from "@/hooks/use-colors";
import useScreenHeader from "@/hooks/use-screen-header";
import { milkProductionStorage } from "@/lib/storage";
import { Cattle, MilkProductionRecord } from "@/types";

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
    }, []),
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

  const handleDelete = async (id: string, cattleName: string) => {
    Alert.alert("Excluir Registro", `Tem certeza que deseja excluir o registro de ${cattleName}?`, [
      {
        text: "Cancelar",
        style: "cancel",
      },
      {
        text: "Excluir",
        style: "destructive",
        onPress: async () => {
          try {
            await milkProductionStorage.delete(id);
            loadData();
          } catch (error) {
            console.error("Erro ao excluir registro:", error);
            Alert.alert("Erro", "Não foi possível excluir o registro");
          }
        },
      },
    ]);
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
      >
        <View className="p-6 gap-4 flex-1" style={{ paddingBottom: insets.bottom }}>
          {/* Reports Navigation - Add this at the top */}
          <View className="flex-row gap-3 mb-2">
            <TouchableOpacity
              onPress={() => navigation.navigate("MilkProductionReports")}
              className="flex-1 bg-surface border border-border p-4 rounded-xl flex-row items-center justify-center gap-2"
            >
              <Text className="text-xl">📊</Text>
              <Text className="font-semibold text-foreground">Ver Relatórios</Text>
            </TouchableOpacity>
          </View>

          {records.length === 0 ? (
            <View className="flex-1 items-center justify-center py-12">
              <Text className="text-4xl mb-4">🥛</Text>
              <Text className="text-muted text-center text-base">Nenhum registro encontrado Ordenha</Text>
              <TouchableOpacity
                onPress={() => navigation.navigate("MilkProductionCad", {})}
                className="mt-4 bg-primary rounded-full px-6 py-3"
                style={{ opacity: 1 }}
              >
                <Text className="text-white font-semibold">+ Cadastrar Primeira Ordenha</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View className="gap-3">
              {records.map((item) => (
                <ProductionCard
                  key={item.id}
                  milkProduction={item}
                  handleDelete={() => {
                    handleDelete(item.id, item.cattle.name || `Animal ${item.cattle.number}`);
                  }}
                />
              ))}
            </View>
          )}

          {/* Add Button */}
          {records.length > 0 && (
            <TouchableOpacity
              onPress={() => navigation.navigate("MilkProductionCad", {})}
              className="bg-primary rounded-full p-4 items-center mt-2"
              style={{ opacity: 1 }}
            >
              <Text className="text-white font-semibold text-base">+ Cadastrar Nova Ordenha</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

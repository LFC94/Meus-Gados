import { useFocusEffect } from "@react-navigation/native";
import React, { useState } from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { IconSymbol, InfiniteList, ProductionCard } from "@/components";
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
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [records, setRecords] = useState<(MilkProductionRecord & { cattle: Cattle })[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);

  const LIMIT = 10;

  useScreenHeader("Controle de Leite");

  useFocusEffect(
    React.useCallback(() => {
      loadData();
    }, []),
  );

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await milkProductionStorage.getRecent(LIMIT, 0);
      setRecords(data);
      setOffset(LIMIT);
      setHasMore(data.length === LIMIT);
    } catch (error) {
      console.error("Error loading milk production:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadMoreData = async () => {
    if (isLoadingMore || !hasMore) return;

    try {
      setIsLoadingMore(true);
      const data = await milkProductionStorage.getRecent(LIMIT, offset);
      setRecords((prev) => [...prev, ...data]);
      setOffset((prev) => prev + LIMIT);
      setHasMore(data.length === LIMIT);
    } catch (error) {
      console.error("Error loading more milk production:", error);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      const data = await milkProductionStorage.getRecent(LIMIT, 0);
      setRecords(data);
      setOffset(LIMIT);
      setHasMore(data.length === LIMIT);
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

  const renderHeader = () => (
    <View className="mb-4">
      <View className="flex-row gap-3">
        <TouchableOpacity
          onPress={() => navigation.navigate("MilkProductionReports")}
          className="flex-1 bg-surface border border-border p-4 rounded-xl flex-row items-center justify-center gap-2"
        >
          <Text className="text-xl">📊</Text>
          <Text className="font-semibold text-foreground">Ver Relatórios</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => navigation.navigate("MilkProductionCad", {})}
          className="flex-1 bg-primary rounded-xl p-4 items-center flex-row justify-center gap-2"
        >
          <IconSymbol name="add" color={"white"} />
          <Text className="px-1 text-white font-semibold text-base">Cadastrar Ordenha</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <ScreenContainer className="p-0">
      <InfiniteList<MilkProductionRecord & { cattle: Cattle }>
        data={records}
        renderItem={({ item }) => <ProductionCard milkProduction={item} />}
        keyExtractor={(item) => item.id}
        onLoadMore={loadMoreData}
        isLoadingMore={isLoadingMore}
        hasMore={hasMore}
        onRefresh={handleRefresh}
        refreshing={refreshing}
        contentContainerStyle={{ padding: 24, paddingBottom: insets.bottom + 24 }}
        headerComponent={records.length > 0 ? renderHeader() : null}
        emptyIcon={<IconSymbol name="baby-bottle" color={colors.milk_production} />}
        emptyMessage="Nenhum registro encontrado Ordenha"
        ListEmptyComponent={
          <View className="flex-1 items-center justify-center py-12">
            <IconSymbol name="baby-bottle" color={colors.milk_production} />
            <Text className="text-muted text-center text-base">Nenhum registro encontrado Ordenha</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate("MilkProductionCad", {})}
              className="mt-4 bg-primary rounded-xl px-6 py-3"
            >
              <Text className="text-white font-semibold">+ Cadastrar Primeira Ordenha</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </ScreenContainer>
  );
}

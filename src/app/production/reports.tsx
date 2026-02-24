import { useFocusEffect } from "@react-navigation/native";
import React, { useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { BarChart } from "react-native-gifted-charts";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { LoadingScreen } from "@/components";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import useScreenHeader from "@/hooks/use-screen-header";
import { logger } from "@/lib/logger";
import { generateProductionReport, ProductionReportData } from "@/lib/production-reports";
import { cattleStorage, milkProductionStorage } from "@/lib/storage";

export default function ProductionReportsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<ProductionReportData | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "rankings">("overview");

  useScreenHeader("Relatórios de Produção");

  useFocusEffect(
    React.useCallback(() => {
      loadData();
    }, []),
  );

  const loadData = async () => {
    try {
      setLoading(true);
      const [records, cattle] = await Promise.all([milkProductionStorage.getAll(), cattleStorage.getAll()]);
      const reportData = generateProductionReport(records, cattle);
      setData(reportData);
    } catch (error) {
      logger.error("ProductionReports/loadData", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingScreen />;

  if (!data) {
    return (
      <ScreenContainer className="items-center justify-center">
        <Text className="text-muted">Não foi possível carregar os dados.</Text>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="p-0">
      <View className="flex-row border-b border-border">
        {(["overview", "rankings"] as const).map((tab) => (
          <TouchableOpacity
            key={tab}
            onPress={() => setActiveTab(tab)}
            className={`flex-1 p-4 items-center border-b-2 ${
              activeTab === tab ? "border-primary" : "border-transparent"
            }`}
          >
            <Text className={`font-semibold ${activeTab === tab ? "text-primary" : "text-muted"}`}>
              {tab === "overview" ? "Visão Geral" : "Rankings & Alertas"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          paddingBottom: insets.bottom + 20,
        }}
      >
        <View className="p-6 gap-6">
          {activeTab === "overview" && (
            <>
              {/* Cards Principais */}
              <View className="flex-row gap-4">
                <View className="flex-1 p-4 rounded-2xl border border-primary bg-primary/10">
                  <Text className="text-muted text-xs font-medium uppercase mb-1">Total Mês</Text>
                  <Text className="text-2xl font-bold text-foreground">
                    {data.totalProductionMonth.toFixed(1)} <Text className="text-sm font-normal text-muted">L</Text>
                  </Text>
                </View>
                <View className="flex-1 bg-blue-500/10 p-4 rounded-2xl border border-blue-500/20">
                  <Text className="text-muted text-xs font-medium uppercase mb-1">Média / Vaca</Text>
                  <Text className="text-2xl font-bold text-foreground">
                    {data.averagePerCow.toFixed(1)} <Text className="text-sm font-normal text-muted">L/dia</Text>
                  </Text>
                </View>
              </View>

              {/* Gráfico Gifted Charts */}
              <View className="bg-surface p-5 rounded-2xl border border-border gap-4">
                <Text className="font-semibold text-lg text-foreground">Produção Diária (30 dias)</Text>
                {data.dailyProduction.length === 0 ? (
                  <Text className="text-muted italic">Sem dados suficientes.</Text>
                ) : (
                  <View className="overflow-hidden no-padding -ml-4">
                    <BarChart
                      data={data.dailyProduction.map((d) => ({
                        value: d.total,
                        label: d.date.split("T")[0].split("-")[2] + "/" + d.date.split("T")[0].split("-")[1],
                        frontColor: colors.primary,
                        topLabelComponent: () => (
                          <Text
                            style={{
                              color: colors.text,
                              fontSize: 10,
                              marginBottom: 2,
                              textAlign: "center",
                            }}
                          >
                            {d.total.toFixed(0)}
                          </Text>
                        ),
                      }))}
                      barWidth={18}
                      spacing={14}
                      roundedTop
                      roundedBottom
                      hideRules
                      xAxisThickness={0}
                      yAxisThickness={0}
                      yAxisTextStyle={{ color: colors.muted }}
                      xAxisLabelTextStyle={{
                        color: colors.muted,
                        fontSize: 10,
                      }}
                      noOfSections={4}
                      maxValue={Math.max(...data.dailyProduction.map((d) => d.total)) * 1.2}
                      isAnimated
                    />
                  </View>
                )}
              </View>
            </>
          )}

          {activeTab === "rankings" && (
            <>
              {/* Alertas de Queda */}
              {data.productionDrops.length > 0 && (
                <View className="gap-3">
                  <Text className="font-semibold text-lg text-red-500">⚠️ Quedas Abruptas ({">"}20%)</Text>
                  {data.productionDrops.map((item) => (
                    <View
                      key={item.cattle.id}
                      className="bg-red-50 dark:bg-red-900/10 p-4 rounded-xl border border-red-200 dark:border-red-800"
                    >
                      <View className="flex-row justify-between items-start">
                        <View>
                          <Text className="font-semibold text-foreground text-base">
                            {item.cattle.name || `Animal ${item.cattle.number}`}
                          </Text>
                          <Text className="text-muted text-sm">
                            Média caiu de {item.previousAvg.toFixed(1)}L para {item.currentAvg.toFixed(1)}L
                          </Text>
                        </View>
                        <View className="bg-red-100 dark:bg-red-900/30 px-3 py-1 rounded-full">
                          <Text className="text-red-600 dark:text-red-400 font-bold">
                            -{item.dropPercentage.toFixed(0)}%
                          </Text>
                        </View>
                      </View>
                    </View>
                  ))}
                </View>
              )}

              {/* Top Produtoras */}
              <View className="gap-3">
                <Text className="font-semibold text-lg text-foreground">🏆 Top Produtoras</Text>
                {data.topProducers.length === 0 ? (
                  <Text className="text-muted italic">Nenhum dado registrado.</Text>
                ) : (
                  data.topProducers.map((item, index) => (
                    <View
                      key={item.cattle.id}
                      className="bg-surface p-4 rounded-xl border border-border flex-row items-center gap-4"
                    >
                      <View
                        className={`w-8 h-8 items-center justify-center rounded-xl ${index < 3 ? "bg-yellow-100 dark:bg-yellow-900/20" : "bg-muted/10"}`}
                      >
                        <Text
                          className={`font-bold ${index < 3 ? "text-yellow-600 dark:text-yellow-400" : "text-muted"}`}
                        >
                          {index + 1}
                        </Text>
                      </View>
                      <View className="flex-1">
                        <Text className="font-semibold text-foreground">
                          {item.cattle.name || `Animal ${item.cattle.number}`}
                        </Text>
                        <Text className="text-muted text-xs">Total: {item.total.toFixed(1)}L</Text>
                      </View>
                      <View className="items-end">
                        <Text className="font-bold text-primary text-lg">{item.average.toFixed(1)}</Text>
                        <Text className="text-muted text-xs">L/dia</Text>
                      </View>
                    </View>
                  ))
                )}
              </View>
            </>
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

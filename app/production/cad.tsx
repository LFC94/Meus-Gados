import { CustomDatePicker } from "@/components/date-picker";
import { ScreenContainer } from "@/components/screen-container";
import { useNavigation } from "@/hooks";
import { useColors } from "@/hooks/use-colors";
import useScreenHeader from "@/hooks/use-screen-header";
import { cattleStorage, milkProductionStorage } from "@/lib/storage";
import { Cattle, RootStackParamList } from "@/types";
import { RouteProp, useRoute } from "@react-navigation/native";
import * as Haptics from "expo-haptics";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function MilkProductionCadScreen() {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<RootStackParamList, "MilkProductionCad">>();
  const colors = useColors();
  const { id, cattleId } = route.params;
  const [loading, setLoading] = useState(false);
  const [loadingCattle, setLoadingCattle] = useState(true);
  const [cattle, setCattle] = useState<Cattle[]>([]);
  const [showCattlePicker, setShowCattlePicker] = useState(false);

  const [formData, setFormData] = useState({
    cattleId: cattleId || "",
    date: new Date(),
    period: "morning" as "morning" | "afternoon" | "full_day",
    quantity: "",
    notes: "",
  });

  const insets = useSafeAreaInsets();

  useScreenHeader(id ? "Editar Produção" : "Registrar Produção");

  useEffect(() => {
    loadCattle();
  }, []);

  useEffect(() => {
    if (id) {
      loadProduction();
    }
  }, [id]);

  const loadCattle = async () => {
    try {
      setLoadingCattle(true);
      const data = await cattleStorage.getAll();
      setCattle(data);
    } catch (error) {
      console.error("Erro ao carregar animais:", error);
    } finally {
      setLoadingCattle(false);
    }
  };

  const loadProduction = async () => {
    try {
      setLoading(true);
      if (!id) return;
      const record = await milkProductionStorage.getById(id);
      if (record) {
        setFormData({
          cattleId: record.cattleId,
          date: new Date(record.date),
          period: record.period,
          quantity: record.quantity.toString(),
          notes: record.notes || "",
        });
      }
    } catch (error) {
      console.error("Error loading production:", error);
      Alert.alert("Erro", "Não foi possível carregar o registro");
    } finally {
      setLoading(false);
    }
  };

  const getSelectedCattleName = () => {
    const selected = cattle.find((c) => c.id === formData.cattleId);
    return selected ? selected.name || `Animal ${selected.number}` : "Selecionar animal";
  };

  const handleSave = async () => {
    if (!formData.cattleId) {
      Alert.alert("Erro", "Selecione um animal");
      return;
    }

    if (!formData.quantity || isNaN(Number(formData.quantity.replace(",", ".")))) {
      Alert.alert("Erro", "Informe uma quantidade válida");
      return;
    }

    try {
      setLoading(true);
      if (Platform.OS !== "web") {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }

      const data = {
        cattleId: formData.cattleId,
        date: formData.date.toISOString(),
        period: formData.period,
        quantity: Number(formData.quantity.replace(",", ".")),
        notes: formData.notes.trim() || undefined,
      };

      if (id) {
        await milkProductionStorage.update(id, data);
      } else {
        await milkProductionStorage.add(data);
      }

      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

      Alert.alert("Sucesso", "Registro salvo com sucesso!", [
        {
          text: "OK",
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error) {
      console.error("Erro ao salvar registro:", error);
      Alert.alert("Erro", "Não foi possível salvar o registro");
    } finally {
      setLoading(false);
    }
  };

  if (loadingCattle) {
    return (
      <ScreenContainer className="items-center justify-center">
        <ActivityIndicator size="large" color={colors.primary} />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="p-6">
      <View className="flex-1 gap-4" style={{ paddingBottom: insets.bottom }}>
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <View className="gap-6 pb-6">
            <View>
              <Text className="text-sm font-medium text-foreground mb-2">Animal *</Text>
              <TouchableOpacity
                onPress={() => setShowCattlePicker(!showCattlePicker)}
                className="bg-surface rounded-xl px-4 py-3 border border-border"
                style={{ opacity: 1 }}
                disabled={!!id || !!cattleId}
              >
                <Text className="text-base" style={{ color: formData.cattleId ? colors.foreground : colors.muted }}>
                  {getSelectedCattleName()}
                </Text>
              </TouchableOpacity>

              {showCattlePicker && (
                <View className="mt-2 bg-surface rounded-xl border border-border overflow-hidden">
                  <ScrollView style={{ maxHeight: 200 }}>
                    {cattle.map((item) => (
                      <TouchableOpacity
                        key={item.id}
                        onPress={() => {
                          setFormData({ ...formData, cattleId: item.id });
                          setShowCattlePicker(false);
                        }}
                        className="px-4 py-3 border-b border-border"
                        style={{ opacity: 1 }}
                      >
                        <Text
                          className="text-base"
                          style={{
                            color: formData.cattleId === item.id ? colors.primary : colors.foreground,
                            fontWeight: formData.cattleId === item.id ? "600" : "400",
                          }}
                        >
                          {item.name || `Animal ${item.number}`}
                        </Text>
                        <Text className="text-xs text-muted mt-1">Nº {item.number}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>

            <CustomDatePicker
              label="Data da Ordenha *"
              value={formData.date}
              onChange={(date) => setFormData({ ...formData, date })}
              maximumDate={new Date()}
              placeholder="Selecionar data"
            />

            <View>
              <Text className="text-sm font-medium text-foreground mb-2">Período *</Text>
              <View className="flex-row gap-2">
                {[
                  { label: "Manhã", value: "morning" },
                  { label: "Tarde", value: "afternoon" },
                  { label: "Dia Todo", value: "full_day" },
                ].map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    onPress={() => setFormData({ ...formData, period: option.value as any })}
                    className={`flex-1 p-3 rounded-lg border items-center ${
                      formData.period === option.value ? "bg-primary/10 border-primary" : "bg-surface border-border"
                    }`}
                  >
                    <Text
                      className={`font-semibold ${
                        formData.period === option.value ? "text-primary" : "text-foreground"
                      }`}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View>
              <Text className="text-sm font-medium text-foreground mb-2">Quantidade (Litros) *</Text>
              <View className="bg-surface rounded-xl px-4 py-3 border border-border">
                <TextInput
                  placeholder="0.00"
                  placeholderTextColor={colors.muted}
                  value={formData.quantity}
                  onChangeText={(text) => setFormData({ ...formData, quantity: text })}
                  keyboardType="numeric"
                  className="text-base text-foreground"
                />
              </View>
            </View>

            <View>
              <Text className="text-sm font-medium text-foreground mb-2">Observações</Text>
              <View className="bg-surface rounded-xl px-4 py-3 border border-border">
                <TextInput
                  placeholder="Observações sobre a ordenha..."
                  placeholderTextColor={colors.muted}
                  value={formData.notes}
                  onChangeText={(text) => setFormData({ ...formData, notes: text })}
                  className="text-base text-foreground"
                  style={{ padding: 0, minHeight: 80, textAlignVertical: "top" }}
                  multiline
                />
              </View>
            </View>
          </View>
        </ScrollView>

        <TouchableOpacity
          onPress={handleSave}
          disabled={loading}
          className="bg-primary rounded-full p-4 items-center"
          style={{ opacity: loading ? 0.6 : 1 }}
        >
          {loading ? (
            <ActivityIndicator color={colors.background} />
          ) : (
            <Text className="text-background font-semibold text-base">Salvar Registro</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScreenContainer>
  );
}

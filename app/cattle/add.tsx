import { CustomDatePicker } from "@/components/date-picker";
import { ScreenContainer } from "@/components/screen-container";
import { CATTLE_BREEDS } from "@/constants/const";
import { useColors } from "@/hooks/use-colors";
import useNavigation from "@/hooks/use-navigation";
import useScreenHeader from "@/hooks/use-screen-header";
import { validateCattleNumber, validateWeight } from "@/lib/helpers";
import { cattleStorage } from "@/lib/storage";
import * as Haptics from "expo-haptics";
import { useState } from "react";
import { ActivityIndicator, Alert, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function AddCattleScreen() {
  const navigation = useNavigation();
  const colors = useColors();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    number: "",
    name: "",
    breed: "Nelore",
    birthDate: new Date(),
    weight: "",
  });
  const [showBreedPicker, setShowBreedPicker] = useState(false);

  const insets = useSafeAreaInsets();

  useScreenHeader("Cadastrar Animal");

  const handleSave = async () => {
    // Validações
    if (!validateCattleNumber(formData.number)) {
      Alert.alert("Erro", "O número do animal é obrigatório");
      return;
    }

    const weight = parseFloat(formData.weight);
    if (!formData.weight || isNaN(weight) || !validateWeight(weight)) {
      Alert.alert("Erro", "Informe um peso válido");
      return;
    }

    try {
      setLoading(true);

      if (Platform.OS !== "web") {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }

      await cattleStorage.add({
        number: formData.number.trim(),
        name: formData.name.trim(),
        breed: formData.breed,
        birthDate: formData.birthDate.toISOString(),
        weight: parseFloat(formData.weight),
      });

      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

      Alert.alert("Sucesso", "Animal cadastrado com sucesso!", [
        {
          text: "OK",
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error) {
      console.error("Error saving cattle:", error);
      Alert.alert("Erro", "Não foi possível cadastrar o animal");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer className="p-6">
      <View className="flex-1 gap-4" style={{ paddingBottom: insets.bottom }}>
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <View className="gap-4 pb-6">
            {/* Número */}
            <View>
              <Text className="text-sm font-medium text-foreground mb-2">Número do Animal *</Text>
              <View className="bg-surface rounded-xl px-4 py-3 border border-border">
                <TextInput
                  placeholder="Ex: 001, A123, etc"
                  placeholderTextColor={colors.muted}
                  value={formData.number}
                  onChangeText={(text) => setFormData({ ...formData, number: text })}
                  className="text-base text-foreground"
                  style={{ padding: 0 }}
                />
              </View>
            </View>

            {/* Nome */}
            <View>
              <Text className="text-sm font-medium text-foreground mb-2">Nome (Opcional)</Text>
              <View className="bg-surface rounded-xl px-4 py-3 border border-border">
                <TextInput
                  placeholder="Ex: Mimosa, Estrela, etc"
                  placeholderTextColor={colors.muted}
                  value={formData.name}
                  onChangeText={(text) => setFormData({ ...formData, name: text })}
                  className="text-base text-foreground"
                  style={{ padding: 0 }}
                />
              </View>
            </View>

            {/* Raça */}
            <View>
              <Text className="text-sm font-medium text-foreground mb-2">Raça *</Text>
              <TouchableOpacity
                onPress={() => setShowBreedPicker(!showBreedPicker)}
                className="bg-surface rounded-xl px-4 py-3 border border-border"
                style={{ opacity: 1 }}
              >
                <Text className="text-base text-foreground">{formData.breed}</Text>
              </TouchableOpacity>

              {showBreedPicker && (
                <View className="mt-2 bg-surface rounded-xl border border-border overflow-hidden">
                  <ScrollView style={{ maxHeight: 200 }}>
                    {CATTLE_BREEDS.map((breed) => (
                      <TouchableOpacity
                        key={breed}
                        onPress={() => {
                          setFormData({ ...formData, breed });
                          setShowBreedPicker(false);
                        }}
                        className="px-4 py-3 border-b border-border"
                        style={{ opacity: 1 }}
                      >
                        <Text
                          className="text-base"
                          style={{
                            color: formData.breed === breed ? colors.primary : colors.foreground,
                            fontWeight: formData.breed === breed ? "600" : "400",
                          }}
                        >
                          {breed}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>

            {/* Data de Nascimento */}
            <CustomDatePicker
              label="Data de Nascimento *"
              value={formData.birthDate}
              onChange={(date) => setFormData({ ...formData, birthDate: date })}
              maximumDate={new Date()}
              placeholder="Selecionar data"
            />

            {/* Peso */}
            <View>
              <Text className="text-sm font-medium text-foreground mb-2">Peso (kg) *</Text>
              <View className="bg-surface rounded-xl px-4 py-3 border border-border">
                <TextInput
                  placeholder="Ex: 350"
                  placeholderTextColor={colors.muted}
                  value={formData.weight}
                  onChangeText={(text) => setFormData({ ...formData, weight: text })}
                  keyboardType="decimal-pad"
                  className="text-base text-foreground"
                  style={{ padding: 0 }}
                />
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Save Button */}
        <TouchableOpacity
          onPress={handleSave}
          disabled={loading}
          className="bg-primary rounded-full p-4 items-center"
          style={{ opacity: loading ? 0.6 : 1 }}
        >
          {loading ? (
            <ActivityIndicator color={colors.background} />
          ) : (
            <Text className="text-background font-semibold text-base">Salvar Animal</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScreenContainer>
  );
}

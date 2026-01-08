import { CustomDatePicker } from "@/components/date-picker";
import { ScreenContainer } from "@/components/screen-container";
import { CATTLE_BREEDS } from "@/constants/const";
import { useColors } from "@/hooks/use-colors";
import useNavigation from "@/hooks/use-navigation";
import useScreenHeader from "@/hooks/use-screen-header";
import { validateCattleNumber, validateWeight } from "@/lib/helpers";
import { cattleStorage } from "@/lib/storage";
import { RootStackParamList } from "@/types";
import { RouteProp, useRoute } from "@react-navigation/native";
import * as Haptics from "expo-haptics";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function EditCattleScreen() {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<RootStackParamList, "CattleEdit">>();
  const colors = useColors();
  const id = route.params?.id;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    number: "",
    name: "",
    breed: "Nelore",
    birthDate: new Date(),
    weight: "",
  });
  const [showBreedPicker, setShowBreedPicker] = useState(false);
  const insets = useSafeAreaInsets();

  useScreenHeader(id ? "Editar Animal" : "Cadastrar Animal", id ? "Atualize os dados do animal" : undefined);

  useEffect(() => {
    loadCattle();
  }, [id]);

  const loadCattle = async () => {
    try {
      if (!id) {
        setLoading(false);
        return;
      }
      const cattle = await cattleStorage.getById(id);
      if (cattle) {
        setFormData({
          number: cattle.number,
          name: cattle.name || "",
          breed: cattle.breed,
          birthDate: new Date(cattle.birthDate),
          weight: cattle.weight.toString(),
        });
      }
    } catch (error) {
      console.error("Error loading cattle:", error);
      Alert.alert("Erro", "Não foi possível carregar os dados do animal");
    } finally {
      setLoading(false);
    }
  };

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
      setSaving(true);

      if (Platform.OS !== "web") {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      const data = {
        number: formData.number.trim(),
        name: formData.name.trim(),
        breed: formData.breed,
        birthDate: formData.birthDate.toISOString(),
        weight: parseFloat(formData.weight),
      };

      if (id) {
        await cattleStorage.update(id!, data);
      } else {
        await cattleStorage.add(data);
      }

      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

      Alert.alert("Sucesso", id ? "Animal atualizado com sucesso!" : "Animal cadastrado com sucesso!", [
        {
          text: "OK",
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error) {
      console.error("Error updating cattle:", error);
      Alert.alert("Erro", "Não foi possível atualizar o animal");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <ScreenContainer className="items-center justify-center">
        <ActivityIndicator size="large" color={colors.primary} />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="p-0">
      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: insets.bottom }} className="p-4">
        <View className="gap-6">
          {/* Form Fields */}
          <View className="gap-4">
            {/* Número */}
            <View className="gap-2">
              <Text className="text-sm font-semibold text-foreground">Número do Animal *</Text>
              <TextInput
                placeholder="Ex: 001"
                value={formData.number}
                onChangeText={(text) => setFormData({ ...formData, number: text })}
                className="border border-border rounded-lg p-3 text-foreground bg-surface"
                placeholderTextColor={colors.muted}
                editable={!saving}
              />
            </View>

            {/* Nome */}
            <View className="gap-2">
              <Text className="text-sm font-semibold text-foreground">Nome (Opcional)</Text>
              <TextInput
                placeholder="Ex: Margarida"
                value={formData.name}
                onChangeText={(text) => setFormData({ ...formData, name: text })}
                className="border border-border rounded-lg p-3 text-foreground bg-surface"
                placeholderTextColor={colors.muted}
                editable={!saving}
              />
            </View>

            {/* Raça */}
            <View className="gap-2">
              <Text className="text-sm font-semibold text-foreground">Raça *</Text>
              <TouchableOpacity
                onPress={() => setShowBreedPicker(!showBreedPicker)}
                disabled={saving}
                className="border border-border rounded-lg p-3 bg-surface"
              >
                <Text className="text-foreground">{formData.breed}</Text>
              </TouchableOpacity>
              {showBreedPicker && (
                <View className="border border-border rounded-lg bg-surface p-2 gap-2">
                  {CATTLE_BREEDS.map((breed) => (
                    <TouchableOpacity
                      key={breed}
                      onPress={() => {
                        setFormData({ ...formData, breed });
                        setShowBreedPicker(false);
                      }}
                      className="p-3 border-b border-border"
                    >
                      <Text className={formData.breed === breed ? "font-bold text-primary" : "text-foreground"}>
                        {breed}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            {/* Data de Nascimento */}
            <View className="gap-2">
              <Text className="text-sm font-semibold text-foreground">Data de Nascimento *</Text>
              <CustomDatePicker
                value={formData.birthDate}
                onChange={(date) => setFormData({ ...formData, birthDate: date })}
                maximumDate={new Date()}
                disabled={saving}
              />
            </View>

            {/* Peso */}
            <View className="gap-2">
              <Text className="text-sm font-semibold text-foreground">Peso (kg) *</Text>
              <TextInput
                placeholder="Ex: 450"
                value={formData.weight}
                onChangeText={(text) => setFormData({ ...formData, weight: text })}
                className="border border-border rounded-lg p-3 text-foreground bg-surface"
                placeholderTextColor={colors.muted}
                keyboardType="decimal-pad"
                editable={!saving}
              />
            </View>
          </View>

          {/* Buttons */}
          <View className="gap-3 mt-6">
            <TouchableOpacity onPress={handleSave} disabled={saving} className="bg-primary rounded-lg p-4 items-center">
              {saving ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white font-semibold text-base">Salvar</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => navigation.goBack()}
              disabled={saving}
              className="border border-border rounded-lg p-4 items-center"
            >
              <Text className="text-foreground font-semibold text-base">Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

import { FormInput, FormSelect } from "@/components";
import { CustomDatePicker } from "@/components/date-picker";
import { ScreenContainer } from "@/components/screen-container";
import { CATTLE_BREEDS } from "@/constants/const";
import { useColors, useNavigation, useScreenHeader } from "@/hooks";
import { validateCattleNumber, validateWeight } from "@/lib/helpers";
import { cattleStorage } from "@/lib/storage";
import { RootStackParamList } from "@/types";
import { RouteProp, useRoute } from "@react-navigation/native";
import * as Haptics from "expo-haptics";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Platform, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function CattleCadScreen() {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<RootStackParamList, "CattleCad">>();
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
            <FormInput
              label="Número do Animal"
              value={formData.number}
              onChangeText={(text) => setFormData({ ...formData, number: text })}
              placeholder="Ex: 001"
              required
              disabled={saving}
            />

            {/* Nome */}
            <FormInput
              label="Nome (Opcional)"
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
              placeholder="Ex: Margarida"
              disabled={saving}
            />

            {/* Raça */}
            <FormSelect
              label="Raça"
              value={formData.breed}
              onValueChange={(value) => setFormData({ ...formData, breed: value })}
              options={CATTLE_BREEDS.map((breed) => ({ label: breed, value: breed }))}
              required
              disabled={saving}
            />

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
            <FormInput
              label="Peso (kg)"
              value={formData.weight}
              onChangeText={(text) => setFormData({ ...formData, weight: text })}
              placeholder="Ex: 450"
              keyboardType="decimal-pad"
              required
              disabled={saving}
            />
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

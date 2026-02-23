import { RouteProp, useRoute } from "@react-navigation/native";
import { useCallback } from "react";
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { CustomDatePicker, FormInput, FormSelect, ScreenContainer } from "@/components";
import { CATTLE_BREEDS } from "@/constants/const";
import { useColors, useFormScreen, useNavigation, useScreenHeader } from "@/hooks";
import { validateCattleNumber, validateWeight } from "@/lib/helpers";
import { cattleStorage } from "@/lib/storage";
import { CattleFormData, RootStackParamList } from "@/types";

export default function CattleCadScreen() {
  const route = useRoute<RouteProp<RootStackParamList, "CattleCad">>();
  const navigation = useNavigation();
  const colors = useColors();
  const id = route.params?.id;
  const insets = useSafeAreaInsets();

  useScreenHeader(id ? "Editar Animal" : "Cadastrar Animal", id ? "Atualize os dados do animal" : undefined);

  const initialData: CattleFormData = {
    number: "",
    name: "",
    breed: "Nelore",
    birthDate: new Date(),
    weight: "",
  };

  const loadData = useCallback(async () => {
    if (!id) return null;
    const cattle = await cattleStorage.getById(id);
    if (cattle) {
      return {
        number: cattle.number,
        name: cattle.name || "",
        breed: cattle.breed,
        birthDate: cattle.birthDate ? new Date(cattle.birthDate) : null,
        weight: cattle.weight.toString(),
      };
    }
    return null;
  }, [id]);

  const validate = useCallback((data: CattleFormData): string | null => {
    if (!validateCattleNumber(data.number)) {
      return "O número do animal é obrigatório";
    }
    if (!data.birthDate) {
      return "A data de nascimento é obrigatória";
    }
    const weight = parseFloat(data.weight);
    if (!data.weight || isNaN(weight) || !validateWeight(weight)) {
      return "Informe um peso válido";
    }
    return null;
  }, []);

  const onSave = useCallback(
    async (data: CattleFormData) => {
      const payload = {
        number: data.number.trim(),
        name: data.name.trim(),
        breed: data.breed,
        birthDate: data.birthDate!.toISOString(),
        weight: parseFloat(data.weight),
      };

      if (id) {
        await cattleStorage.update(id, payload);
      } else {
        await cattleStorage.add(payload);
      }
    },
    [id],
  );

  const { data, setData, loading, saving, save } = useFormScreen<CattleFormData>({
    initialData,
    loadData,
    validate,
    onSave,
    successMessage: id ? "Animal atualizado com sucesso!" : "Animal cadastrado com sucesso!",
  });

  if (loading) {
    return (
      <ScreenContainer className="items-center justify-center">
        <ActivityIndicator size="large" color={colors.primary} />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="p-0">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="p-4">
        <View className="gap-6" style={{ marginBottom: insets.bottom }}>
          <View className="gap-4">
            <FormInput
              label="Número do Animal"
              value={data.number}
              onChangeText={(text) => setData({ ...data, number: text })}
              placeholder="Ex: 001"
              required
              disabled={saving}
            />

            <FormInput
              label="Nome (Opcional)"
              value={data.name}
              onChangeText={(text) => setData({ ...data, name: text })}
              placeholder="Ex: Margarida"
              disabled={saving}
            />

            <FormSelect
              label="Raça"
              value={data.breed}
              onValueChange={(value) => setData({ ...data, breed: value })}
              options={CATTLE_BREEDS.map((breed) => ({
                label: breed,
                value: breed,
              }))}
              required
              disabled={saving}
            />

            <View className="gap-2">
              <Text className="text-sm font-semibold text-foreground">Data de Nascimento *</Text>
              <CustomDatePicker
                value={data.birthDate}
                onChange={(date) => setData({ ...data, birthDate: date })}
                maximumDate={new Date()}
                disabled={saving}
              />
            </View>

            <FormInput
              label="Peso (kg)"
              value={data.weight}
              onChangeText={(text) => setData({ ...data, weight: text })}
              placeholder="Ex: 450"
              keyboardType="decimal-pad"
              required
              disabled={saving}
            />
          </View>

          <View className="gap-3">
            <TouchableOpacity onPress={save} disabled={saving} className="bg-primary rounded-lg p-4 items-center">
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

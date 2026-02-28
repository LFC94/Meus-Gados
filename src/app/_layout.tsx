import "@/global.css";
import "@/lib/_core/nativewind-pressable";
import "react-native-reanimated";

import {
  createDrawerNavigator,
  DrawerContentComponentProps,
  DrawerContentScrollView,
  DrawerItemList,
} from "@react-navigation/drawer";
import { createStackNavigator } from "@react-navigation/stack";
import Constants from "expo-constants";
import { useEffect, useMemo } from "react";
import { Image, Text, View } from "react-native";
import { initialWindowMetrics, SafeAreaProvider, useSafeAreaInsets } from "react-native-safe-area-context";

import { IconSymbol } from "@/components";
import { AuthProvider, useColors, useScreenOptions } from "@/hooks/";
import { useUpdates } from "@/hooks/use-updates";
import { requestNotificationPermission } from "@/lib/notifications";
import { ThemeProvider } from "@/lib/theme-provider";
// Screens
import { RootStackParamList } from "@/types";

import {
  CattleCadScreen,
  CattleDetailScreen,
  CattleListScreen,
  DiseasesCadScreen,
  HomeScreen,
  MilkProductionCadScreen,
  MilkProductionListScreen,
  MilkProductionReportsScreen,
  PregnancyAddScreen,
  PregnancyEditScreen,
  ScheduledNotificationsScreen,
  SettingsScreen,
  VaccineCadScreen,
  VaccineCatalogCadScreen,
  VaccineCatalogScreen,
  VaccinePendingScreen,
} from "./_screens";

// Create navigators
const Drawer = createDrawerNavigator();
const Stack = createStackNavigator<RootStackParamList>();

// Custom Drawer Content to show the Logo
function CustomDrawerContent(props: DrawerContentComponentProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1 }}>
      <DrawerContentScrollView {...props} contentContainerStyle={{ paddingTop: 0 }}>
        <View className="items-center border-b border-border" style={{ paddingTop: insets.top }}>
          <Image source={require("@/assets/images/icon.png")} style={{ height: 120 }} resizeMode="contain" />
        </View>
        <DrawerItemList {...props} />
      </DrawerContentScrollView>

      <View className="p-4 border-t border-border items-center" style={{ paddingBottom: Math.max(insets.bottom, 16) }}>
        <Text className="text-xs text-muted">Versão {Constants.expoConfig?.version ?? "1.0.0"}</Text>
      </View>
    </View>
  );
}

// Drawer Navigator - telas principais acessíveis pelo menu lateral
function DrawerNavigator() {
  const colors = useColors();

  return (
    <Drawer.Navigator
      initialRouteName="Home"
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        drawerActiveTintColor: colors.primary,
        drawerInactiveTintColor: colors.muted,
        headerTintColor: colors.text,
        drawerStyle: {
          backgroundColor: colors.background,
        },
        drawerItemStyle: {
          borderRadius: 10,
          borderColor: `${colors.border}20`,
          borderWidth: 0,
          borderBottomWidth: 1,
        },
        drawerLabelStyle: {
          fontSize: 16,
          color: colors.text,
        },
        headerShown: true,
        headerStyle: {
          backgroundColor: colors.background,
        },
        headerTitleStyle: {
          color: colors.text,
        },
        swipeEnabled: true,
        drawerType: "front",
      }}
    >
      <Drawer.Screen
        name="Home"
        component={HomeScreen}
        options={{
          drawerLabel: "Inicio",
          title: "Meus Gados",
          drawerIcon: () => <IconSymbol name="home" color={colors.primary} />,
        }}
      />
      <Drawer.Screen
        name="CattleList"
        component={CattleListScreen}
        options={{
          drawerLabel: "Animais",
          title: "Animais",
          drawerIcon: () => <IconSymbol name="cow" color={colors.primary} />,
        }}
      />

      <Drawer.Screen
        name="MilkProductionList"
        component={MilkProductionListScreen}
        options={{
          title: "Controle de Leite",
          drawerLabel: "Controle de Leite",
          drawerIcon: () => <IconSymbol name="baby-bottle" color={colors.milk_production} />,
        }}
      />
      <Drawer.Screen
        name="VaccineCatalog"
        component={VaccineCatalogScreen}
        options={{
          drawerLabel: "Catálogo de Vacinas",
          title: "Catálogo de Vacinas",
          drawerIcon: () => <IconSymbol name={"medication"} color={colors.primary} />,
        }}
      />
      <Drawer.Screen
        name="VaccinePending"
        component={VaccinePendingScreen}
        options={{
          drawerLabel: "Vacinas Pendentes",
          title: "Vacinas Pendentes",
          drawerIcon: () => <IconSymbol name={"vaccines"} color={colors.vaccine_pending} />,
        }}
      />
      <Drawer.Screen
        name="ScheduledNotifications"
        component={ScheduledNotificationsScreen}
        options={{
          drawerLabel: "Notificações",
          title: "Notificações",
          drawerIcon: () => <IconSymbol name="notifications" color={colors.warning} />,
        }}
      />
      <Drawer.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          drawerLabel: "Configurações",
          title: "Configurações",
          drawerIcon: () => <IconSymbol name={"settings"} color={colors.muted} />,
        }}
      />
    </Drawer.Navigator>
  );
}

// Stack Navigator principal - contém todas as telas incluindo as de ação
function MainStackNavigator() {
  const screenOptions = useScreenOptions();
  return (
    <Stack.Navigator screenOptions={screenOptions} initialRouteName="Drawer">
      {/* Telas do Drawer integradas no Stack */}
      <Stack.Screen name="Drawer" component={DrawerNavigator} />

      <Stack.Screen
        name="CattleDetail"
        component={CattleDetailScreen}
        options={{
          title: "Detalhes do Animal",
        }}
      />
      <Stack.Screen
        name="CattleCad"
        component={CattleCadScreen}
        options={{
          title: "Editar Animal",
        }}
      />
      <Stack.Screen
        name="VaccineCad"
        component={VaccineCadScreen}
        options={{
          title: "Registrar Vacina",
        }}
      />
      <Stack.Screen
        name="VaccineCatalogCad"
        component={VaccineCatalogCadScreen}
        options={{
          title: "Editar Vacina",
        }}
      />
      <Stack.Screen
        name="PregnancyAdd"
        component={PregnancyAddScreen}
        options={{
          title: "Registrar Gestação",
        }}
      />
      <Stack.Screen
        name="PregnancyEdit"
        component={PregnancyEditScreen}
        options={{
          title: "Editar Gestação",
        }}
      />
      <Stack.Screen
        name="VaccineCatalog"
        component={VaccineCatalogScreen}
        options={{
          title: "Catálogo de Vacinas",
        }}
      />
      <Stack.Screen
        name="DiseasesCad"
        component={DiseasesCadScreen}
        options={{
          title: "Registrar Doença",
        }}
      />
      <Stack.Screen
        name="MilkProductionCad"
        component={MilkProductionCadScreen}
        options={{
          title: "Registrar Produção",
        }}
      />
      <Stack.Screen
        name="MilkProductionReports"
        component={MilkProductionReportsScreen}
        options={{
          title: "Relatórios de Produção",
        }}
      />
    </Stack.Navigator>
  );
}

export default function RootLayout() {
  useUpdates();

  useEffect(() => {
    requestNotificationPermission();
  }, []);

  const providerInitialMetrics = useMemo(() => {
    const metrics = initialWindowMetrics;
    if (!metrics) return undefined;

    return {
      ...metrics,
      insets: {
        ...metrics.insets,
        top: Math.max(metrics.insets.top, 16),
        bottom: Math.max(metrics.insets.bottom, 12),
      },
    };
  }, []);

  return (
    <ThemeProvider>
      <AuthProvider>
        <SafeAreaProvider initialMetrics={providerInitialMetrics}>
          <MainStackNavigator />
        </SafeAreaProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

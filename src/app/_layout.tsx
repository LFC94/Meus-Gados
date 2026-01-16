import "@/global.css";
import "@/lib/_core/nativewind-pressable";
import { requestNotificationPermission } from "@/lib/notifications";
import { ThemeProvider } from "@/lib/theme-provider";

import { useEffect, useMemo } from "react";
import { Text } from "react-native";
import "react-native-reanimated";
import { SafeAreaProvider, initialWindowMetrics } from "react-native-safe-area-context";

import { AuthProvider, useColors, useScreenOptions } from "@/hooks/";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { createStackNavigator } from "@react-navigation/stack";

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
  NotificationsSettingsScreen,
  PregnancyAddScreen,
  PregnancyEditScreen,
  ScheduledNotificationsScreen,
  SettingsScreen,
  SyncSetupScreen,
  VaccineCadScreen,
  VaccineCatalogCadScreen,
  VaccineCatalogScreen,
  VaccinePendingScreen,
} from "./_screens";

// Create navigators
const Drawer = createDrawerNavigator();
const Stack = createStackNavigator<RootStackParamList>();

// Drawer Navigator - telas principais acessíveis pelo menu lateral
function DrawerNavigator() {
  const colors = useColors();

  return (
    <Drawer.Navigator
      initialRouteName="Home"
      screenOptions={{
        drawerActiveTintColor: colors.primary,
        drawerInactiveTintColor: colors.muted,
        headerTintColor: colors.text,
        drawerStyle: {
          backgroundColor: colors.background,
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
          drawerLabel: "Meus Gados",
          title: "Meus Gados",
          drawerIcon: () => <Text className="text-lg">🐮</Text>,
        }}
      />
      <Drawer.Screen
        name="CattleList"
        component={CattleListScreen}
        options={{
          drawerLabel: "Animais",
          title: "Animais",
          drawerIcon: () => <Text className="text-lg">🐄</Text>,
        }}
      />

      <Drawer.Screen
        name="MilkProductionList"
        component={MilkProductionListScreen}
        options={{
          title: "Controle de Leite",
          drawerLabel: "Controle de Leite",
          drawerIcon: () => <Text className="text-lg">🥛</Text>,
        }}
      />
      <Drawer.Screen
        name="VaccineCatalog"
        component={VaccineCatalogScreen}
        options={{
          drawerLabel: "Catálogo de Vacinas",
          title: "Catálogo de Vacinas",
          drawerIcon: () => <Text className="text-lg">💉</Text>,
        }}
      />
      <Drawer.Screen
        name="VaccinePending"
        component={VaccinePendingScreen}
        options={{
          drawerLabel: "Vacinas Pendentes",
          title: "Vacinas Pendentes",
          drawerIcon: () => <Text className="text-lg">🚨</Text>,
        }}
      />
      <Drawer.Screen
        name="ScheduledNotifications"
        component={ScheduledNotificationsScreen}
        options={{
          drawerLabel: "Notificações",
          title: "Notificações",
          drawerIcon: () => <Text className="text-lg">🔔</Text>,
        }}
      />
      <Drawer.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          drawerLabel: "Configurações",
          title: "Configurações",
          drawerIcon: () => <Text className="text-lg">⚙️</Text>,
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
        name="NotificationsSettings"
        component={NotificationsSettingsScreen}
        options={{
          title: "Configurar Notificações",
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
        name="SyncSetup"
        component={SyncSetupScreen}
        options={{
          title: "Sincronização em Nuvem",
        }}
      />
    </Stack.Navigator>
  );
}

export default function RootLayout() {
  useEffect(() => {
    // Request notification permissions on app startup
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

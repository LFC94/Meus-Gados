import "@/global.css";
import "@/lib/_core/nativewind-pressable";
import { ThemeProvider } from "@/lib/theme-provider";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Platform, Text } from "react-native";
import "react-native-reanimated";
import type { EdgeInsets, Metrics, Rect } from "react-native-safe-area-context";
import {
  SafeAreaFrameContext,
  SafeAreaInsetsContext,
  SafeAreaProvider,
  initialWindowMetrics,
} from "react-native-safe-area-context";

import { useColors, useScreenOptions } from "@/hooks/";

import { initManusRuntime, subscribeSafeAreaInsets } from "@/lib/_core/manus-runtime";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";

// Screens
import { RootStackParamList } from "@/types";

import { NotificationsSettingsScreen } from ".";
import CattleDetailScreen from "./cattle/[id]";
import CattleAddScreen from "./cattle/add";
import CattleEditScreen from "./cattle/edit";
import CattleListScreen from "./cattle/list";
import DiseasesAddScreen from "./diseases/add";
import DiseasesEditScreen from "./diseases/edit";
import HomeScreen from "./home";
import ScheduledNotificationsScreen from "./notifications/scheduled";
import PregnancyAddScreen from "./pregnancy/add";
import PregnancyEditScreen from "./pregnancy/edit";
import SettingsScreen from "./settings";
import VaccineAddScreen from "./vaccines/add";
import VaccineCatalogAddScreen from "./vaccines/catalog/add";
import VaccineCatalogEditScreen from "./vaccines/catalog/edit";
import VaccineCatalogIndexScreen from "./vaccines/catalog/index";
import EditVaccineScreen from "./vaccines/edit";
import VaccinePendingScreen from "./vaccines/pending";

const DEFAULT_WEB_INSETS: EdgeInsets = { top: 0, right: 0, bottom: 0, left: 0 };
const DEFAULT_WEB_FRAME: Rect = { x: 0, y: 0, width: 0, height: 0 };

// Create navigators
const Drawer = createDrawerNavigator();
const Stack = createStackNavigator<RootStackParamList>();

// Drawer Navigator - telas principais acessíveis pelo menu lateral
function DrawerNavigator() {
  const colors = useColors();

  return (
    <Drawer.Navigator
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
        drawerType: Platform.OS === "web" ? "permanent" : "front",
      }}
    >
      <Drawer.Screen
        name="Home"
        component={HomeScreen}
        options={{
          drawerLabel: "Home",
          title: "Meus Gados",
          drawerIcon: ({ color }) => <Text className="text-lg">🐮</Text>,
        }}
      />
      <Drawer.Screen
        name="CattleList"
        component={CattleListScreen}
        options={{
          drawerLabel: "Animais",
          title: "Animais",
          drawerIcon: ({ color }) => <Text className="text-lg">🐄</Text>,
        }}
      />
      <Drawer.Screen
        name="VaccineCatalogIndex"
        component={VaccineCatalogIndexScreen}
        options={{
          drawerLabel: "Catálogo de Vacinas",
          title: "Catálogo de Vacinas",
          drawerIcon: ({ color }) => <Text className="text-lg">💉</Text>,
        }}
      />
      <Drawer.Screen
        name="VaccinePending"
        component={VaccinePendingScreen}
        options={{
          drawerLabel: "Vacinas Pendentes",
          title: "Vacinas Pendentes",
          drawerIcon: ({ color }) => <Text className="text-lg">🐄</Text>,
        }}
      />
      <Drawer.Screen
        name="ScheduledNotifications"
        component={ScheduledNotificationsScreen}
        options={{
          drawerLabel: "Notificações",
          title: "Notificações",
          drawerIcon: ({ color }) => <Text className="text-lg">🔔</Text>,
        }}
      />
      <Drawer.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          drawerLabel: "Configurações",
          title: "Configurações",
          drawerIcon: ({ color }) => <Text className="text-lg">⚙️</Text>,
        }}
      />
    </Drawer.Navigator>
  );
}

// Stack Navigator principal - contém todas as telas incluindo as de ação
function MainStackNavigator() {
  const screenOptions = useScreenOptions();
  return (
    <Stack.Navigator screenOptions={screenOptions}>
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
        name="CattleEdit"
        component={CattleEditScreen}
        options={{
          title: "Editar Animal",
        }}
      />
      <Stack.Screen
        name="CattleAdd"
        component={CattleAddScreen}
        options={{
          title: "Cadastrar Animal",
        }}
      />
      <Stack.Screen
        name="VaccineAdd"
        component={VaccineAddScreen}
        options={{
          title: "Registrar Vacina",
        }}
      />
      <Stack.Screen
        name="VaccineEdit"
        component={EditVaccineScreen}
        options={{
          title: "Editar Vacina",
        }}
      />
      <Stack.Screen
        name="VaccineCatalogEdit"
        component={VaccineCatalogEditScreen}
        options={{
          title: "Editar Vacina",
        }}
      />
      <Stack.Screen
        name="VaccineCatalogAdd"
        component={VaccineCatalogAddScreen}
        options={{
          title: "Cadastrar Vacina",
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
        name="DiseasesAdd"
        component={DiseasesAddScreen}
        options={{
          title: "Registrar Doença",
        }}
      />
      <Stack.Screen
        name="DiseasesEdit"
        component={DiseasesEditScreen}
        options={{
          title: "Editar Doença",
        }}
      />
      <Stack.Screen
        name="NotificationsSettings"
        component={NotificationsSettingsScreen}
        options={{
          title: "Configurar Notificações",
        }}
      />
    </Stack.Navigator>
  );
}

export default function RootLayout() {
  const initialInsets = initialWindowMetrics?.insets ?? DEFAULT_WEB_INSETS;
  const initialFrame = initialWindowMetrics?.frame ?? DEFAULT_WEB_FRAME;

  const [insets, setInsets] = useState<EdgeInsets>(initialInsets);
  const [frame, setFrame] = useState<Rect>(initialFrame);

  useEffect(() => {
    initManusRuntime();
  }, []);

  const handleSafeAreaUpdate = useCallback((metrics: Metrics) => {
    setInsets(metrics.insets);
    setFrame(metrics.frame);
  }, []);

  useEffect(() => {
    if (Platform.OS !== "web") return;
    const unsubscribe = subscribeSafeAreaInsets(handleSafeAreaUpdate);
    return () => unsubscribe();
  }, [handleSafeAreaUpdate]);

  const providerInitialMetrics = useMemo(() => {
    const metrics = initialWindowMetrics ?? { insets: initialInsets, frame: initialFrame };
    return {
      ...metrics,
      insets: {
        ...metrics.insets,
        top: Math.max(metrics.insets.top, 16),
        bottom: Math.max(metrics.insets.bottom, 12),
      },
    };
  }, [initialInsets, initialFrame]);

  const content = <MainStackNavigator />;

  const shouldOverrideSafeArea = Platform.OS === "web";

  if (shouldOverrideSafeArea) {
    return (
      <ThemeProvider>
        <SafeAreaProvider initialMetrics={providerInitialMetrics}>
          <SafeAreaFrameContext.Provider value={frame}>
            <SafeAreaInsetsContext.Provider value={insets}>
              <NavigationContainer>{content}</NavigationContainer>
            </SafeAreaInsetsContext.Provider>
          </SafeAreaFrameContext.Provider>
        </SafeAreaProvider>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <SafeAreaProvider initialMetrics={providerInitialMetrics}>{content}</SafeAreaProvider>
    </ThemeProvider>
  );
}

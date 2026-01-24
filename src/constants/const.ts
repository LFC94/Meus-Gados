import { IconMapping } from "@/components";
import { type ThemeColorPalette } from "@/lib/_core/theme";
import { CattleResult, DiseaseResult, PregnancyResult } from "@/types";

export const COOKIE_NAME = "app_session_id";
export const ONE_YEAR_MS = 1000 * 60 * 60 * 24 * 365;
export const AXIOS_TIMEOUT_MS = 30_000;
export const UNAUTHED_ERR_MSG = "Please login (10001)";
export const NOT_ADMIN_ERR_MSG = "You do not have required permission (10002)";

/**
 * Vacinas comuns no Brasil para sugestão
 */
export const COMMON_VACCINES = [
  { name: "Anaplasmose", daysBetweenDoses: 180, description: "Prevenção de Anaplasmose" },
  { name: "Brucelose", daysBetweenDoses: 365, description: "Imunização contra Brucelose (B19)" },
  { name: "Carbúnculo Sintomático", daysBetweenDoses: 180, description: "Prevenção de Carbúnculo" },
  { name: "Clostridioses", daysBetweenDoses: 180, description: "Vacina múltipla contra clostrídios" },
  { name: "Diarréria Viral Bovina", daysBetweenDoses: 180, description: "Proteção contra DV B" },
  { name: "Ectima Contagioso", daysBetweenDoses: 365, description: "Vacina contra ectima (caroço)" },
  { name: "Febre Aftosa", daysBetweenDoses: 180, description: "Imunização contra Febre Aftosa" },
  { name: "IBR/BVD", daysBetweenDoses: 180, description: "Reprodução - Rinotraqueíte e Diarreia" },
  { name: "Leptospirose", daysBetweenDoses: 180, description: "Prevenção de Leptospirose" },
  { name: "Raiva", daysBetweenDoses: 365, description: "Imunização contra Raiva" },
];

/**
 * Chaves do AsyncStorage
 */
export const STORAGE_KEYS = {
  CATTLE: "@meus_gados:cattle",
  VACCINE_CATALOG: "@meus_gados:vaccine_catalog",
  VACCINATION_RECORDS: "@meus_gados:vaccination_records",
  PREGNANCIES: "@meus_gados:pregnancies",
  DISEASES: "@meus_gados:diseases",
  MILK_PRODUCTION: "@meus_gados:milk_production",
  PREFERENCES: "@meus_gados_preferences",
  LAST_SYNC: "@meus_gados:last_sync",
} as const;

/**
 * Opções de raças comuns no Brasil
 */
export const CATTLE_BREEDS = [
  "Angus",
  "Braford",
  "Brahman",
  "Brangus",
  "Canchim",
  "Caracu",
  "Curraleiro Pe-Duro",
  "Gir",
  "Girolando",
  "Guzera",
  "Hereford",
  "Holandesa",
  "Jersey",
  "Nelore",
  "Pantaneiro",
  "Santa Gertrudis",
  "Santa Rosalia",
  "Simental",
  "Sindi",
  "Outra",
] as const;

/**
 * Labels para resultados de gestação
 */
export const PREGNANCY_RESULT_LABELS: Record<PregnancyResult, string> = {
  pending: "Aguardando",
  success: "Sucesso",
  complications: "Complicações",
  failed: "Falha",
};

/**
 * Labels para resultados de tratamento
 */
export const DISEASE_RESULT_LABELS: Record<
  DiseaseResult,
  { color: keyof ThemeColorPalette; text: string; icon: IconMapping }
> = {
  in_treatment: { text: "Em Tratamento", color: "treatment", icon: "medical-services" },
  cured: { text: "Curado", color: "healthy", icon: "heart" },
  death: { text: "Óbito", color: "deceased", icon: "heart-broken" },
};

/**
 * STATUS do GADO
 */
export const STATUS_CATTLE: Record<CattleResult, { color: keyof ThemeColorPalette; text: string; icon: IconMapping }> =
  {
    in_treatment: { color: "treatment", text: "Em Tratamento", icon: "medical-services" },
    healthy: { color: "healthy", text: "Saudável", icon: "heart" },
    death: { color: "deceased", text: "Óbito", icon: "heart-broken" },
    pregnancy: { color: "pregnant", text: "Gestação", icon: "stroller" },
    overdue_pregnancy: { color: "pregnant_delayed", text: "Gestação Atrasada", icon: "baby-carriage" },
    pending_vaccine: { color: "vaccine_pending", text: "Vacina Pendente", icon: "vaccines" },
  };

export const PERIOD_LABELS = {
  morning: "Manhã",
  afternoon: "Tarde",
  full_day: "Dia Todo",
};

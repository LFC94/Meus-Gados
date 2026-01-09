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
  { name: "Febre Aftosa", daysBetweenDoses: 180, description: "Imunização contra Febre Aftosa" },
  { name: "Brucelose", daysBetweenDoses: 365, description: "Imunização contra Brucelose (B19)" },
  { name: "Carbúnculo Sintomático", daysBetweenDoses: 180, description: "Prevenção de Carbúnculo" },
  { name: "Raiva", daysBetweenDoses: 365, description: "Imunização contra Raiva" },
  { name: "Clostridioses", daysBetweenDoses: 180, description: "Vacina múltipla contra clostrídios" },
  { name: "IBR/BVD", daysBetweenDoses: 180, description: "Reprodução - Rinotraqueíte e Diarreia" },
  { name: "Leptospirose", daysBetweenDoses: 180, description: "Prevenção de Leptospirose" },
  { name: "Anaplasmose", daysBetweenDoses: 180, description: "Prevenção de Anaplasmose" },
  { name: "Ectima Contagioso", daysBetweenDoses: 365, description: "Vacina contra ectima (caroço)" },
  { name: "Diarréria Viral Bovina", daysBetweenDoses: 180, description: "Proteção contra DV B" },
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
} as const;

/**
 * Opções de raças comuns no Brasil
 */
export const CATTLE_BREEDS = [
  "Nelore",
  "Angus",
  "Brahman",
  "Gir",
  "Guzerá",
  "Holandês",
  "Jersey",
  "Senepol",
  "Simental",
  "Charolês",
  "Hereford",
  "Limousin",
  "Mestiço",
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
export const DISEASE_RESULT_LABELS: Record<DiseaseResult, string> = {
  in_treatment: "Em Tratamento",
  cured: "Curado",
  death: "Óbito",
};

/**
 * STATUS do GADO
 */
export const STATUS_CATTLE: Record<CattleResult, { color: string; text: string; icon: string }> = {
  in_treatment: { color: "#f5550b", text: "Em Tratamento", icon: "🏥" },
  healthy: { color: "#22C55E", text: "Saudável", icon: "💚" },
  death: { color: "#9c0101ff", text: "Óbito", icon: "🪦" },
  pregnancy: { color: "#c2f50bff", text: "Gestação", icon: "🤱" },
  overdue_pregnancy: { color: "#EF4444", text: "Gestação Atrasada", icon: "🤰" },
  pending_vaccine: { color: "#F59E0B", text: "Vacina Pendente", icon: "💉" },
};

import { STORAGE_KEYS } from "@/constants/const";
import { Cattle, Disease, MilkProductionRecord, Pregnancy, VaccinationRecord, VaccineModel } from "@/types";

import { clearAllData, setItems } from "./index";

const now = new Date();
const daysAgo = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString();
};

export const seedDatabase = async () => {
  try {
    console.log("🌱 Iniciando seed massivo do banco de dados...");

    // 0. Limpar dados existentes
    await clearAllData();

    // 1. Catálogo de Vacinas
    const vaccineCatalog: VaccineModel[] = [
      {
        id: "v1",
        name: "Febre Aftosa",
        manufacturer: "Ourofino",
        isActive: true,
        daysBetweenDoses: 180,
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      },
      {
        id: "v2",
        name: "Brucelose (B19)",
        manufacturer: "MSD",
        isActive: true,
        daysBetweenDoses: 0,
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      },
      {
        id: "v3",
        name: "Raiva Herbívora",
        isActive: true,
        daysBetweenDoses: 365,
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      },
      {
        id: "v4",
        name: "Clostridiose",
        manufacturer: "Boehringer",
        isActive: true,
        daysBetweenDoses: 365,
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      },
      {
        id: "v5",
        name: "Leptospirose",
        isActive: true,
        daysBetweenDoses: 180,
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      },
      {
        id: "v6",
        name: "Mastite (Preventivo)",
        isActive: true,
        daysBetweenDoses: 90,
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      },
    ];

    // 2. Animais (Gado) - Total 20
    const cattle: Cattle[] = [
      // Matrizes
      {
        id: "c1",
        number: "101",
        name: "Estrela",
        breed: "Holandesa",
        birthDate: daysAgo(2000),
        weight: 580,
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      },
      {
        id: "c2",
        number: "102",
        name: "Mimosa",
        breed: "Girolando",
        birthDate: daysAgo(1500),
        weight: 510,
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      },
      {
        id: "c3",
        number: "103",
        name: "Bela",
        breed: "Jersey",
        birthDate: daysAgo(1200),
        weight: 460,
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      },
      {
        id: "c4",
        number: "104",
        name: "Luna",
        breed: "Pardo Suíço",
        birthDate: daysAgo(1800),
        weight: 600,
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      },
      {
        id: "c5",
        number: "105",
        name: "Dalia",
        breed: "Holandesa",
        birthDate: daysAgo(900),
        weight: 420,
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      },
      {
        id: "c6",
        number: "106",
        name: "Pérola",
        breed: "Girolando",
        birthDate: daysAgo(2500),
        weight: 620,
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      },
      {
        id: "c11",
        number: "111",
        name: "Maia",
        breed: "Nelore",
        birthDate: daysAgo(1100),
        weight: 540,
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      },
      {
        id: "c12",
        number: "112",
        name: "Jade",
        breed: "Jersey",
        birthDate: daysAgo(800),
        weight: 410,
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      },
      {
        id: "c13",
        number: "113",
        name: "Safira",
        breed: "Holandesa",
        birthDate: daysAgo(1300),
        weight: 590,
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      },
      {
        id: "c14",
        number: "114",
        name: "Cristal",
        breed: "Girolando",
        birthDate: daysAgo(1600),
        weight: 530,
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      },

      // Bezerros (1ª geração)
      {
        id: "c7",
        number: "201",
        name: "Flor",
        breed: "Holandesa",
        birthDate: daysAgo(180),
        weight: 140,
        motherId: "c1",
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      },
      {
        id: "c8",
        number: "202",
        name: "Alegre",
        breed: "Girolando",
        birthDate: daysAgo(15),
        weight: 48,
        motherId: "c2",
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      },
      {
        id: "c9",
        number: "203",
        name: "Esperança",
        breed: "Jersey",
        birthDate: daysAgo(300),
        weight: 220,
        motherId: "c3",
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      },
      {
        id: "c15",
        number: "205",
        name: "Faísca",
        breed: "Nelore",
        birthDate: daysAgo(40),
        weight: 65,
        motherId: "c11",
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      },
      {
        id: "c16",
        number: "206",
        name: "Mel",
        breed: "Jersey",
        birthDate: daysAgo(90),
        weight: 80,
        motherId: "c12",
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      },

      // Bezerros (2ª geração)
      {
        id: "c17",
        number: "301",
        name: "Pingo",
        breed: "Holandesa",
        birthDate: daysAgo(5),
        weight: 42,
        motherId: "c7",
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      },

      // Machos / Touros
      {
        id: "c10",
        number: "401",
        name: "Trovão",
        breed: "Nelore",
        birthDate: daysAgo(1500),
        weight: 920,
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      },
      {
        id: "c18",
        number: "402",
        name: "Brutus",
        breed: "Nelore",
        birthDate: daysAgo(2200),
        weight: 980,
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      },
      {
        id: "c19",
        number: "403",
        name: "Guerreiro",
        breed: "Brahman",
        birthDate: daysAgo(1200),
        weight: 810,
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      },
      {
        id: "c20",
        number: "404",
        name: "Zorro",
        breed: "Nelore",
        birthDate: daysAgo(100),
        weight: 95,
        motherId: "c11",
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      },
    ];

    // 3. Produção de Leite (Últimos 20 dias para as 10 vacas matrizes)
    const milkProduction: MilkProductionRecord[] = [];
    ["c1", "c2", "c3", "c4", "c5", "c6", "c11", "c12", "c13", "c14"].forEach((cid) => {
      for (let i = 0; i < 20; i++) {
        milkProduction.push({
          id: `milk_${cid}_${i}`,
          cattleId: cid,
          date: daysAgo(i).split("T")[0],
          period: i % 2 === 0 ? "morning" : "afternoon",
          quantity: 7 + Math.random() * 15,
          createdAt: now.toISOString(),
          updatedAt: now.toISOString(),
        });
      }
    });

    // 4. Registros de Vacinação
    const vaccinationRecords: VaccinationRecord[] = [
      {
        id: "vr1",
        cattleId: "c1",
        vaccineId: "v1",
        dateApplied: daysAgo(10),
        nextDoseDate: daysAgo(-170),
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      },
      {
        id: "vr2",
        cattleId: "c2",
        vaccineId: "v1",
        dateApplied: daysAgo(190),
        nextDoseDate: daysAgo(10),
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      },
      {
        id: "vr3",
        cattleId: "c3",
        vaccineId: "v2",
        dateApplied: daysAgo(365),
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      },
      {
        id: "vr4",
        cattleId: "c4",
        vaccineId: "v3",
        dateApplied: daysAgo(100),
        nextDoseDate: daysAgo(-265),
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      },
      {
        id: "vr5",
        cattleId: "c5",
        vaccineId: "v4",
        dateApplied: daysAgo(20),
        nextDoseDate: daysAgo(-345),
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      },
      {
        id: "vr6",
        cattleId: "c6",
        vaccineId: "v5",
        dateApplied: daysAgo(200),
        nextDoseDate: daysAgo(-20),
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      },
      {
        id: "vr7",
        cattleId: "c11",
        vaccineId: "v1",
        dateApplied: daysAgo(5),
        nextDoseDate: daysAgo(-175),
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      },
      {
        id: "vr8",
        cattleId: "c12",
        vaccineId: "v6",
        dateApplied: daysAgo(15),
        nextDoseDate: daysAgo(-75),
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      },
    ];

    // 5. Gestações
    const pregnancies: Pregnancy[] = [
      {
        id: "p1",
        cattleId: "c1",
        coverageDate: daysAgo(460),
        expectedBirthDate: daysAgo(180),
        actualBirthDate: daysAgo(180),
        result: "success",
        calfId: "c7",
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      },
      {
        id: "p2",
        cattleId: "c2",
        coverageDate: daysAgo(295),
        expectedBirthDate: daysAgo(15),
        actualBirthDate: daysAgo(15),
        result: "success",
        calfId: "c8",
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      },
      {
        id: "p3",
        cattleId: "c4",
        coverageDate: daysAgo(150),
        expectedBirthDate: daysAgo(-130),
        result: "pending",
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      },
      {
        id: "p4",
        cattleId: "c5",
        coverageDate: daysAgo(300),
        expectedBirthDate: daysAgo(20),
        result: "complications",
        complications: "Retenção de placenta",
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      },
      {
        id: "p5",
        cattleId: "c6",
        coverageDate: daysAgo(60),
        expectedBirthDate: daysAgo(-220),
        result: "pending",
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      },
      {
        id: "p6",
        cattleId: "c13",
        coverageDate: daysAgo(280),
        expectedBirthDate: daysAgo(0),
        result: "pending",
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      },
      {
        id: "p7",
        cattleId: "c7",
        coverageDate: daysAgo(285),
        expectedBirthDate: daysAgo(5),
        actualBirthDate: daysAgo(5),
        result: "success",
        calfId: "c17",
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      },
    ];

    // 6. Doenças
    const diseases: Disease[] = [
      {
        id: "d1",
        cattleId: "c3",
        type: "Mastite",
        diagnosisDate: daysAgo(5),
        symptoms: "Úbere inchado",
        treatment: "Massagem e antibiótico",
        result: "cured",
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      },
      {
        id: "d2",
        cattleId: "c5",
        type: "Tristeza Parasitária",
        diagnosisDate: daysAgo(3),
        symptoms: "Prostração e febre",
        treatment: "Ganaseg + Vitaminas",
        result: "in_treatment",
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      },
      {
        id: "d3",
        cattleId: "c1",
        type: "Poflexia",
        diagnosisDate: daysAgo(60),
        symptoms: "Dificuldade ao andar",
        treatment: "Casqueamento químico",
        result: "cured",
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      },
      {
        id: "d4",
        cattleId: "c14",
        type: "Pneumonia",
        diagnosisDate: daysAgo(1),
        symptoms: "Tosse e secreção",
        treatment: "Antibiótico injetável",
        result: "in_treatment",
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      },
    ];

    // Salvar tudo usando setItems para preservar os IDs fixos e garantir as chaves estrangeiras
    await Promise.all([
      setItems(STORAGE_KEYS.CATTLE, cattle),
      setItems(STORAGE_KEYS.VACCINE_CATALOG, vaccineCatalog),
      setItems(STORAGE_KEYS.VACCINATION_RECORDS, vaccinationRecords),
      setItems(STORAGE_KEYS.MILK_PRODUCTION, milkProduction),
      setItems(STORAGE_KEYS.PREGNANCIES, pregnancies),
      setItems(STORAGE_KEYS.DISEASES, diseases),
    ]);

    console.log("✅ Seed Massivo finalizado com sucesso!");
  } catch (error) {
    console.error("❌ Erro ao realizar seed:", error);
    throw error;
  }
};

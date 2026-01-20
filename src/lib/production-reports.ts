import { Cattle, MilkProductionRecord } from "@/types";

export interface ProductionReportData {
  totalProductionMonth: number;
  averagePerCow: number;
  topProducers: { cattle: Cattle; average: number; total: number }[];
  productionDrops: { cattle: Cattle; currentAvg: number; previousAvg: number; dropPercentage: number }[];
  dailyProduction: { date: string; total: number }[];
}

export function generateProductionReport(records: MilkProductionRecord[], cattleList: Cattle[]): ProductionReportData {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  // Filtra registros deste mês para totais
  const monthRecords = records.filter((r) => {
    const d = new Date(r.date);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  const totalProductionMonth = monthRecords.reduce((sum, r) => sum + r.quantity, 0);

  // Agrupa por vaca
  const cattleProduction = new Map<string, MilkProductionRecord[]>();
  records.forEach((r) => {
    const list = cattleProduction.get(r.cattleId) || [];
    list.push(r);
    cattleProduction.set(r.cattleId, list);
  });

  const topProducers: { cattle: Cattle; average: number; total: number }[] = [];
  const productionDrops: { cattle: Cattle; currentAvg: number; previousAvg: number; dropPercentage: number }[] = [];
  let totalDailyAverageSum = 0;
  let activeCowsCount = 0;

  cattleList.forEach((cow) => {
    const cowRecords = cattleProduction.get(cow.id) || [];
    if (cowRecords.length === 0) return;

    // Calcula total e média geral da vaca
    const total = cowRecords.reduce((sum, r) => sum + r.quantity, 0);
    const uniqueDays = new Set(cowRecords.map((r) => r.date.split("T")[0])).size;
    const average = uniqueDays > 0 ? total / uniqueDays : 0;

    topProducers.push({ cattle: cow, average, total });

    // Calcula média dos últimos 7 dias vs 7 dias anteriores para detectar quedas
    const sortedRecords = [...cowRecords].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

    let currentSum = 0;
    let currentCount = 0;
    let previousSum = 0;
    let previousCount = 0;

    sortedRecords.forEach((r) => {
      const d = new Date(r.date);
      if (d >= sevenDaysAgo) {
        currentSum += r.quantity;
        currentCount++;
      } else if (d >= fourteenDaysAgo) {
        previousSum += r.quantity;
        previousCount++;
      }
    });

    const currentAvg = currentCount > 0 ? currentSum / currentCount : 0;
    // Normaliza para dias únicos se necessário, mas simplificando por registro ou dia
    // Melhor: Agrupar por dia antes de médias se houver várias ordenhas
    const previousAvg = previousCount > 0 ? previousSum / previousCount : 0;

    if (previousAvg > 5 && currentAvg < previousAvg * 0.8) {
      // Queda de 20% e produção relevante
      productionDrops.push({
        cattle: cow,
        currentAvg,
        previousAvg,
        dropPercentage: ((previousAvg - currentAvg) / previousAvg) * 100,
      });
    }

    totalDailyAverageSum += average;
    activeCowsCount++;
  });

  // Ordena Top Producers
  topProducers.sort((a, b) => b.total - a.total);

  // Média geral do rebanho: Soma das médias individuais / num vacas (ou Total Geral / Dias Totais)
  // Vamos usar Total Mês / (Dias Mês decorridos * Vacas ordenhadas)?
  // Simplificando: Média das médias individuais para dar uma ideia de "potência do rebanho"
  const averagePerCow = activeCowsCount > 0 ? totalDailyAverageSum / activeCowsCount : 0;

  // Produção diária para gráfico (últimos 30 dias)
  const dailyMap = new Map<string, number>();
  records.forEach((r) => {
    const day = r.date.split("T")[0];
    dailyMap.set(day, (dailyMap.get(day) || 0) + r.quantity);
  });

  const dailyProduction = Array.from(dailyMap.entries())
    .map(([date, total]) => ({ date, total }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(-30);

  return {
    totalProductionMonth,
    averagePerCow,
    topProducers: topProducers.slice(0, 10), // Top 10
    productionDrops,
    dailyProduction,
  };
}

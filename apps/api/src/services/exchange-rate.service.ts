// ============================================
// Servicio de Tasas de Cambio
// Integración con APIs de tasas Venezuela
// ============================================

import { prisma } from "@vetice/database";

// Fallback rate (tasa manual de respaldo)
const FALLBACK_BCV_RATE = 45.5;

// URLs alternativas para obtener tasas
const API_URLS = [
  "https://pydolarve.org/api/v2/dollar",
  "https://pydolar.kiud.com.ve/api/v2/dollar",
];

interface MonitorData {
  price: number;
  price_old?: number;
  change?: number;
  percent?: number;
  [key: string]: unknown;
}

interface MonitorsMap {
  [key: string]: MonitorData;
}

interface ApiResponse {
  datetime?: { date: string; time: string };
  monitors?: MonitorsMap;
  bcv?: number;
  usd?: number;
  [key: string]: unknown;
}

interface ExchangeRateData {
  bcv: number;
  enparalelovzla: number;
  binance: number;
  lastUpdate: Date;
  source: string;
}

export async function fetchPyDolarRates(): Promise<ExchangeRateData> {
  let lastError: Error | null = null;

  // Intentar con cada URL disponible
  for (const apiUrl of API_URLS) {
    try {
      console.log(`[ExchangeRate] Intentando conectar a: ${apiUrl}`);
      const response = await fetch(apiUrl, {
        headers: { "Content-Type": "application/json" },
        signal: AbortSignal.timeout(10000), // 10s timeout
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = (await response.json()) as ApiResponse;
      const monitors = data.monitors || {};

      // Extraer tasas de diferentes fuentes posibles
      const bcv =
        monitors["bcv"]?.price ||
        monitors["usd"]?.price ||
        (data as any).bcv ||
        (data as any).usd ||
        0;

      const enparalelovzla = monitors["enparalelovzla"]?.price || 0;
      const binance = monitors["binance"]?.price || 0;

      console.log(
        `[ExchangeRate] Tasas obtenidas - BCV: ${bcv}, EnParalelo: ${enparalelovzla}, Binance: ${binance}`,
      );

      return {
        bcv: bcv || FALLBACK_BCV_RATE,
        enparalelovzla,
        binance,
        lastUpdate: data.datetime?.date
          ? new Date(data.datetime.date)
          : new Date(),
        source: apiUrl,
      };
    } catch (error) {
      lastError = error instanceof Error ? error : new Error("Unknown error");
      console.warn(`[ExchangeRate] Falló ${apiUrl}:`, lastError.message);
      // Continuar con la siguiente URL
    }
  }

  // Si todas las URLs fallan, usar tasa de respaldo
  console.warn(
    `[ExchangeRate] Todas las APIs fallaron, usando tasa de respaldo: ${FALLBACK_BCV_RATE}`,
  );

  return {
    bcv: FALLBACK_BCV_RATE,
    enparalelovzla: 0,
    binance: 0,
    lastUpdate: new Date(),
    source: "fallback",
  };
}

export async function fetchBCVRate(): Promise<number> {
  const rates = await fetchPyDolarRates();
  return rates.bcv;
}

export async function saveExchangeRate(
  rate: number,
  currency: string = "VES",
  source: string = "BCV",
) {
  return prisma.exchangeRate.create({
    data: {
      currency,
      rate,
      source,
    },
  });
}

export async function saveMultipleRates(rates: ExchangeRateData) {
  const saves = [];

  if (rates.bcv > 0) {
    saves.push(saveExchangeRate(rates.bcv, "VES", "BCV"));
  }
  if (rates.enparalelovzla > 0) {
    saves.push(saveExchangeRate(rates.enparalelovzla, "VES", "EnParaleloVzla"));
  }
  if (rates.binance > 0) {
    saves.push(saveExchangeRate(rates.binance, "VES", "Binance"));
  }

  return Promise.all(saves);
}

export async function getLatestExchangeRate(
  currency: string = "VES",
  source?: string,
) {
  const where = source ? { currency, source } : { currency };

  const rate = await prisma.exchangeRate.findFirst({
    where,
    orderBy: { date: "desc" },
  });

  return rate;
}

export async function syncExchangeRates() {
  try {
    console.log("[ExchangeRate] Iniciando sincronización...");

    const rates = await fetchPyDolarRates();
    await saveMultipleRates(rates);

    console.log(
      `[ExchangeRate] Tasas sincronizadas - BCV: ${rates.bcv} VES/USD`,
    );

    return { success: true, rates };
  } catch (error) {
    console.error("[ExchangeRate] Error en sincronización:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function syncBCVRate() {
  try {
    console.log("[ExchangeRate] Iniciando sincronización de tasa BCV...");

    const rate = await fetchBCVRate();
    await saveExchangeRate(rate, "VES", "BCV");

    console.log(`[ExchangeRate] Tasa BCV sincronizada: ${rate} VES/USD`);

    return { success: true, rate };
  } catch (error) {
    console.error("[ExchangeRate] Error en sincronización:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export function calculateVESFromUSD(amountUsd: number, rate?: number): number {
  const exchangeRate = rate || 45.5;
  return amountUsd * exchangeRate;
}

export function calculateUSDFromVES(amountVes: number, rate?: number): number {
  const exchangeRate = rate || 45.5;
  return amountVes / exchangeRate;
}

export const exchangeRateService = {
  fetchPyDolarRates,
  fetchBCVRate,
  saveExchangeRate,
  saveMultipleRates,
  getLatestExchangeRate,
  syncExchangeRates,
  syncBCVRate,
  calculateVESFromUSD,
  calculateUSDFromVES,
};

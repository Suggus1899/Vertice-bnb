// ============================================
// Cron Job para Sincronización de Tasas
// Integración con PyDolarVenezuela API
// ============================================

import { syncExchangeRates } from "../services/exchange-rate.service";

export function startExchangeRateSync() {
  console.log("[Cron] Exchange rate sync started");

  syncExchangeRates();

  setInterval(
    () => {
      syncExchangeRates();
    },
    60 * 60 * 1000,
  ); // Cada hora
}

if (process.argv[1]?.includes("sync-rates")) {
  syncExchangeRates()
    .then((result) => {
      console.log("[Cron] Sync completed:", result);
      process.exit(0);
    })
    .catch((error) => {
      console.error("[Cron] Sync failed:", error);
      process.exit(1);
    });
}

import { defineStore } from "pinia";
import { useConfigStore } from "./config";

const config = useConfigStore();

export const useHomeStore = defineStore("home", {
  state: () => ({
    activeDevices: 0,
    recentMessages: 0,
    weeklyStats: null,
    loading: false,
    error: null,
  }),

  actions: {
    async fetchAllStats() {
      this.loading = true;
      this.error = null;

      try {
        // Obtener todos los servidores
        const serversResponse = await fetch(config.getServersUrl);
        const servers = await serversResponse.json();
        const serverIds = servers.map((server) => server.id).join(",");

        // Realizar las tres llamadas en paralelo
        const [activeDevices, recentMessages, weeklyStats] = await Promise.all([
          // Dispositivos activos (última hora)
          fetch(
            `${config.getDevicesActivityUrl}?serverIds=${serverIds}&dateRange=last_hour`
          ),
          // Mensajes Recibidos (últimas 24h)
          fetch(
            `${config.getMessagesSearchUrl}?serverIds=${serverIds}&dateRange=last_24_hours`
          ),
          // Cobertura semanal (última semana)
          fetch(
            `${config.getDevicesActivityUrl}?serverIds=${serverIds}&dateRange=last_week`
          ),
        ]);

        const [activeDevicesData, recentMessagesData, weeklyStatsData] =
          await Promise.all([
            activeDevices.json(),
            recentMessages.json(),
            weeklyStats.json(),
          ]);

        // Actualizar el state
        this.activeDevices = activeDevicesData.totalItems;
        this.recentMessages = recentMessagesData.totalItems;
        this.weeklyStats = weeklyStatsData;
      } catch (err) {
        console.error("Error fetching home stats:", err);
        this.error = "Error al cargar las estadísticas";
      } finally {
        this.loading = false;
      }
    },
  },
});

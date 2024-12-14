import { defineStore } from "pinia";
import { useConfigStore } from "./config";

const config = useConfigStore();

export const useHomeStore = defineStore("home", {
  state: () => ({
    activeDevices: null,
    recentMessages: null,
    weeklyStats: null,
    loading: false,
    errors: {
      activeDevices: null,
      recentMessages: null,
      weeklyStats: null,
    },
  }),

  actions: {
    async fetchAllStats() {
      this.loading = true;
      this.errors = {
        activeDevices: null,
        recentMessages: null,
        weeklyStats: null,
      };

      try {
        // 1. Obtener servidores
        const serversResponse = await fetch(config.getServersUrl);
        const servers = await serversResponse.json();
        const serverIds = servers.map((server) => server.id).join(",");

        // 2. Realizar las tres llamadas en paralelo
        const responses = await Promise.all([
          fetch(
            `${config.getDevicesActivityUrl}?serverIds=${serverIds}&dateRange=last_hour`
          ),
          fetch(
            `${config.getMessagesSearchUrl}?serverIds=${serverIds}&dateRange=last_24_hours`
          ),
          fetch(
            `${config.getDevicesActivityUrl}?serverIds=${serverIds}&dateRange=last_week`
          ),
        ]);

        // 3. Procesar las respuestas
        const [activeDevices, recentMessages, weeklyStats] = await Promise.all(
          responses.map(async (response, index) => {
            const data = await response.json();
            const key = ["activeDevices", "recentMessages", "weeklyStats"][
              index
            ];

            if (!response.ok) {
              this.errors[key] = {
                name:
                  response.status === 404
                    ? "NotFoundError"
                    : response.status === 400
                    ? "BadRequestError"
                    : "Error",
                message: data.error || "Error inesperado al cargar los datos",
              };
              return null;
            }

            return data;
          })
        );

        // 4. Actualizar el estado
        this.activeDevices = activeDevices?.totalItems ?? null;
        this.recentMessages = recentMessages?.totalItems ?? null;
        this.weeklyStats = weeklyStats;
      } catch (err) {
        console.error("Error fetching home stats:", err);
        // Error de conexión (TypeError) u otros errores inesperados
        const error = {
          name: err instanceof TypeError ? "ConnectionError" : "Error",
          message:
            err instanceof TypeError
              ? "No se puede conectar al servidor. Verifique su conexión a internet y que el servidor esté en ejecución."
              : "Error inesperado al cargar los datos",
        };
        this.errors.activeDevices = error;
        this.errors.recentMessages = error;
        this.errors.weeklyStats = error;
      } finally {
        this.loading = false;
      }
    },
  },
});

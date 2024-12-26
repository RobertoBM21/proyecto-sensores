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
        const response = await fetch(`${config.getHomeStatsUrl}`);
        const data = await response.json();

        if (!response.ok) {
          // Manejar errores HTTP específicos
          const error = {
            name:
              response.status === 404
                ? "NotFoundError"
                : response.status === 400
                ? "BadRequestError"
                : "Error",
            message: data.error || "Error inesperado al cargar los datos",
          };

          // Aplicar el error a todos los campos si es un error general
          if (response.status !== 404) {
            this.errors.activeDevices = error;
            this.errors.recentMessages = error;
            this.errors.weeklyStats = error;
            return;
          }
        }

        // Actualizar el estado con los datos del backend
        this.activeDevices = data.activeDevices;
        this.recentMessages = data.recentMessages;
        this.weeklyStats = data.weeklyStats;

        // Actualizar errores específicos que vienen del backend
        if (data.errors) {
          Object.keys(data.errors).forEach((key) => {
            if (data.errors[key]) {
              this.errors[key] = {
                name: data.errors[key].name,
                message: data.errors[key].message,
              };
            }
          });
        }
      } catch (err) {
        console.error("Error fetching home stats:", err);
        const error = {
          name: err instanceof TypeError ? "ConnectionError" : "Error",
          message:
            err instanceof TypeError
              ? "No se puede conectar al servidor. Verifique su conexión a internet y que el servidor esté en ejecución."
              : "Ha ocurrido un error inesperado al cargar los datos.",
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

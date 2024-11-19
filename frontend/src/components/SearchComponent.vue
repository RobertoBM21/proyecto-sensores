<template>
  <div>
    <HeaderComponent />
    <div class="mt-2 text-right px-4">
      <div class="relative inline-block text-left">
        <button
          class="inline-flex items-center text-primary font-bold hover:text-primary-dark"
          @click="toggleDropdown"
        >
          <span class="px-2">
            {{ selectedServerNames || "Servidores" }}
          </span>
          <i :class="dropdownIconClass"></i>
        </button>
        <ul
          v-show="dropdownVisible"
          class="absolute right-0 w-48 mt-2 bg-white border border-primary rounded-lg shadow-card"
        >
          <li
            v-if="servers.length === 0"
            class="px-4 py-2 text-center text-gray-600"
          >
            No hay servidores disponibles
          </li>
          <li
            v-else
            v-for="server in servers"
            :key="server.id"
            class="px-4 py-2 hover:bg-gray-50"
          >
            <label class="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                :value="server.id"
                class="w-4 h-4 border-2 border-primary rounded text-primary focus:ring-primary"
                v-model="selectedServers"
                @change="updateSelectedServerNames"
              />
              <span>{{ server.name }}</span>
            </label>
          </li>
        </ul>
      </div>
    </div>

    <div class="min-h-screen flex flex-col">
      <main class="flex-grow">
        <div class="container mx-auto px-4 my-20">
          <div class="text-center mb-20">
            <h1 class="text-5xl font-bold mb-6">Sensores</h1>
            <p class="text-gray-600 font-bold leading-relaxed">
              Aquí podrás acceder a la información transmitida por los sensores
              de <br />
              OdinS distribuidos por todo el país.
            </p>
          </div>

          <form class="max-w-4xl mx-auto" @submit.prevent="searchDevices">
            <div class="grid grid-cols-1 md:grid-cols-12 gap-4 mb-6">
              <div class="md:col-span-8">
                <div class="relative">
                  <input
                    type="text"
                    v-model="serial"
                    id="serial"
                    class="w-full p-4 border border-gray-300 rounded-lg focus:ring-[#92d050] focus:border-[#92d050]"
                    placeholder="Número de serie"
                  />
                </div>
              </div>
              <div class="md:col-span-4">
                <select
                  v-model="dateRange"
                  class="w-full p-4 border border-gray-300 rounded-lg focus:ring-[#92d050] focus:border-[#92d050]"
                >
                  <option value="">Sin filtro de fecha</option>
                  <option value="last_5_minutes">Últimos 5 minutos</option>
                  <option value="last_15_minutes">Últimos 15 minutos</option>
                  <option value="last_30_minutes">Últimos 30 minutos</option>
                  <option value="last_hour">Última hora</option>
                  <option value="last_24_hours">Últimas 24 horas</option>
                  <option value="today">Hoy</option>
                  <option value="yesterday">Ayer</option>
                  <option value="last_week">Última semana</option>
                  <option value="last_month">Último mes</option>
                  <option value="last_year">Último año</option>
                </select>
              </div>
            </div>

            <div class="text-center mb-20">
              <button type="submit" class="boton px-16">Buscar</button>
            </div>
          </form>

          <div class="max-w-4xl mx-auto space-y-4">
            <div
              v-for="result in paginatedResults"
              :key="result.id"
              class="bg-gray-50 p-6 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
            >
              <div class="font-bold text-lg mb-3">
                Serial: {{ result.serial }}
              </div>
              <div class="text-gray-600 grid gap-4 md:grid-cols-3">
                <span class="truncate">Topic: {{ result.topic || "N/A" }}</span>
                <span class="truncate"
                  >Contenido: {{ result.content || "N/A" }}</span
                >
                <span class="truncate">
                  Timestamp: {{ new Date(result.timestamp).toLocaleString() }}
                </span>
              </div>
            </div>
          </div>

          <nav v-if="searchResults.length > 0" class="mt-8">
            <ul class="flex justify-center space-x-1">
              <li>
                <a
                  href="#"
                  @click.prevent="changePage(1)"
                  :class="[
                    'px-4 py-2 bg-[#92d050] text-white rounded-l-lg hover:bg-[#79b73c] transition-colors',
                    { 'opacity-50 cursor-not-allowed': currentPage === 1 },
                  ]"
                  >&laquo;&laquo;</a
                >
              </li>
              <li>
                <a
                  href="#"
                  @click.prevent="changePage(currentPage - 1)"
                  :class="[
                    'px-4 py-2 bg-[#92d050] text-white hover:bg-[#79b73c] transition-colors',
                    { 'opacity-50 cursor-not-allowed': currentPage === 1 },
                  ]"
                  >&laquo;</a
                >
              </li>
              <li v-for="page in totalPages" :key="page">
                <a
                  href="#"
                  @click.prevent="changePage(page)"
                  :class="[
                    'px-4 py-2 bg-[#92d050] text-white hover:bg-[#79b73c] transition-colors',
                    { 'bg-[#5bae5e]': page === currentPage },
                  ]"
                  >{{ page }}</a
                >
              </li>
              <li>
                <a
                  href="#"
                  @click.prevent="changePage(currentPage + 1)"
                  :class="[
                    'px-4 py-2 bg-[#92d050] text-white hover:bg-[#79b73c] transition-colors',
                    {
                      'opacity-50 cursor-not-allowed':
                        currentPage === totalPages,
                    },
                  ]"
                  >&raquo;</a
                >
              </li>
              <li>
                <a
                  href="#"
                  @click.prevent="changePage(totalPages)"
                  :class="[
                    'px-4 py-2 bg-[#92d050] text-white rounded-r-lg hover:bg-[#79b73c] transition-colors',
                    {
                      'opacity-50 cursor-not-allowed':
                        currentPage === totalPages,
                    },
                  ]"
                  >&raquo;&raquo;</a
                >
              </li>
            </ul>
          </nav>
        </div>
      </main>
    </div>
    <FooterComponent />
  </div>
</template>

<script>
import HeaderComponent from "./HeaderComponent.vue";
import FooterComponent from "./FooterComponent.vue";
import { useConfigStore } from "../stores/config";

export default {
  components: {
    HeaderComponent,
    FooterComponent,
  },
  setup() {
    const config = useConfigStore();
    const apiUrl = config.getApiUrl;

    return {
      apiUrl,
    };
  },
  data() {
    return {
      servers: [],
      selectedServers: [],
      dropdownVisible: false,
      dropdownIconClass: "bi bi-chevron-up",
      serial: "",
      dateRange: "",
      searchResults: [],
      currentPage: 1,
      resultsPerPage: 10,
      selectedServerNames: "",
    };
  },
  computed: {
    paginatedResults() {
      const start = (this.currentPage - 1) * this.resultsPerPage;
      const end = start + this.resultsPerPage;
      return this.searchResults.slice(start, end);
    },
    totalPages() {
      return Math.ceil(this.searchResults.length / this.resultsPerPage);
    },
  },
  methods: {
    fetchServers() {
      fetch(`${this.apiUrl}/servers`)
        .then((response) => response.json())
        .then((data) => {
          this.servers = data;
        })
        .catch((error) => {
          console.error("Error fetching servers:", error);
        });
    },
    toggleDropdown() {
      this.dropdownVisible = !this.dropdownVisible;
      this.updateDropdownIcon();
    },
    updateDropdownIcon() {
      this.dropdownIconClass = this.dropdownVisible
        ? "bi bi-chevron-down"
        : "bi bi-chevron-up";
    },
    toggleFilters() {
      this.showFilters = !this.showFilters;
    },
    searchDevices() {
      let url = new URL(`${this.apiUrl}/messages/search`);
      let params = new URLSearchParams();

      if (this.serial) params.append("serial", this.serial);
      if (this.dateRange) params.append("dateRange", this.dateRange);
      if (this.selectedServers.length > 0) {
        this.selectedServers.forEach((serverId) => {
          params.append("serverId", serverId); // Cambiado a serverId en singular
        });
      }

      url.search = params.toString();

      fetch(url)
        .then((response) => {
          if (!response.ok) {
            throw new Error("Network response was not ok");
          }
          return response.json();
        })
        .then((data) => {
          this.searchResults = data.messages || []; // Cambiado a messages
          this.currentPage = 1;
        })
        .catch((error) => {
          console.error("Error fetching data:", error);
          this.searchResults = [];
        });
    },
    changePage(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.currentPage = page;
      }
    },
    updateSelectedServerNames() {
      const selectedNames = this.servers
        .filter((server) => this.selectedServers.includes(server.id))
        .map((server) => server.name);

      this.selectedServerNames = selectedNames.length
        ? selectedNames.join(", ")
        : "";
    },
  },
  watch: {
    servers: {
      handler: "updateSelectedServerNames",
      immediate: true,
    },
  },
  created() {
    this.fetchServers();
  },
};
</script>

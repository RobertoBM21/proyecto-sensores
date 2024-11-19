<template>
  <div id="search-component">
    <HeaderComponent />
    <div class="dropdown-container mt-2 text-end">
      <div class="dropdown">
        <button
          class="btn labeled-icon"
          type="button"
          id="dropdownMenuButton"
          @click="toggleDropdown"
        >
          <span id="serverName">
            {{ selectedServerNames || "Servidores" }}
          </span>
          <i :class="dropdownIconClass"></i>
        </button>
        <ul
          class="dropdown-menu"
          :class="{ show: dropdownVisible }"
          id="serverDropdown"
        >
          <li v-if="servers.length === 0" class="dropdown-item text-center">
            No hay servidores disponibles
          </li>
          <li
            v-else
            v-for="server in servers"
            :key="server.id"
            class="dropdown-item"
          >
            <label>
              <input
                type="checkbox"
                :value="server.id"
                class="form-check-input"
                v-model="selectedServers"
                @change="updateSelectedServerNames"
              />
              {{ server.name }}
            </label>
          </li>
        </ul>
      </div>
    </div>
    <div class="d-flex flex-column min-vh-100">
      <main class="flex-grow-1">
        <div class="container my-5">
          <div id="main" class="text-center mb-5">
            <h1>Sensores</h1>
            <p>
              Aquí podrás acceder a la información transmitida por los sensores
              de <br />
              OdinS distribuidos por todo el país.
            </p>
          </div>
          <form id="searchForm" @submit.prevent="searchDevices">
            <div class="row mb-3 justify-content-center">
              <div class="col-md-8">
                <div class="form-floating">
                  <input
                    type="text"
                    v-model="serial"
                    id="serial"
                    class="form-control"
                    placeholder="Número de serie"
                  />
                  <label for="serial">Número de serie</label>
                </div>
              </div>
              <div class="col-md-4">
                <div class="form-floating">
                  <select
                    v-model="dateRange"
                    class="form-control"
                    id="dateRange"
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
                  <label for="dateRange">Rango de fecha</label>
                </div>
              </div>
            </div>
            <div class="row justify-content-center">
              <div class="mt-2 mb-5">
                <button type="submit" id="searchButton" class="boton">
                  Buscar
                </button>
              </div>
            </div>
          </form>
          <div id="results" class="container">
            <div
              v-for="result in paginatedResults"
              :key="result.id"
              class="result-item"
            >
              <div class="result-header">Serial: {{ result.serial }}</div>
              <div class="result-details">
                <span>Topic: {{ result.topic || "N/A" }}</span>
                <span>Contenido: {{ result.content || "N/A" }}</span>
                <span
                  >Timestamp:
                  {{ new Date(result.timestamp).toLocaleString() }}</span
                >
              </div>
            </div>
          </div>
          <nav v-if="searchResults.length > 0">
            <ul id="pagination" class="pagination justify-content-center">
              <li class="page-item" :class="{ disabled: currentPage === 1 }">
                <a class="page-button" href="#" @click.prevent="changePage(1)"
                  >&laquo;&laquo;</a
                >
              </li>
              <li class="page-item" :class="{ disabled: currentPage === 1 }">
                <a
                  class="page-button"
                  href="#"
                  @click.prevent="changePage(currentPage - 1)"
                  >&laquo;</a
                >
              </li>
              <li
                class="page-item"
                :class="{ active: page === currentPage }"
                v-for="page in totalPages"
                :key="page"
              >
                <a
                  class="page-button"
                  href="#"
                  @click.prevent="changePage(page)"
                  >{{ page }}</a
                >
              </li>
              <li
                class="page-item"
                :class="{ disabled: currentPage === totalPages }"
              >
                <a
                  class="page-button"
                  href="#"
                  @click.prevent="changePage(currentPage + 1)"
                  >&raquo;</a
                >
              </li>
              <li
                class="page-item"
                :class="{ disabled: currentPage === totalPages }"
              >
                <a
                  class="page-button"
                  href="#"
                  @click.prevent="changePage(totalPages)"
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
import { API_BASE_URL } from "../config.js";

export default {
  components: {
    HeaderComponent,
    FooterComponent,
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
      fetch(`${API_BASE_URL}/servers`)
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
      let url = new URL(`${API_BASE_URL}/messages/search`); // Cambiado a messages/search
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

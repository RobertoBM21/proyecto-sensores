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
          aria-expanded="false"
        >
          <span id="serverName">Servidores</span>
          <i :class="dropdownIconClass" id="dropdownIcon"></i>
        </button>
        <ul
          class="dropdown-menu mt-2"
          aria-labelledby="dropdownMenuButton"
          v-show="dropdownVisible"
          id="serverDropdown"
        >
          <li v-if="servers.length === 0" class="dropdown-item text-center">
            No hay servidores disponibles
          </li>
          <li
            v-else
            v-for="server in servers"
            :key="server.serverId"
            class="dropdown-item"
          >
            <label class="dropdown-item">
              <input
                type="checkbox"
                :value="server.serverId"
                class="form-check-input me-1"
                v-model="selectedServers"
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
              <div class="col-md-11 mb-3">
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
              <div id="filterButtonContainer" class="col-md-1 mb-3">
                <button
                  type="button"
                  id="filterButton"
                  class="btn btn-secondary labeled-icon"
                  @click="toggleFilters"
                >
                  <i class="bi bi-filter icon"></i>
                </button>
              </div>
            </div>
            <div v-show="showFilters" id="filters" class="row mb-3">
              <div class="col-md-6 mt-4 mb-4">
                <div class="form-floating">
                  <input
                    type="text"
                    v-model="apikey"
                    id="apikey"
                    class="form-control"
                    placeholder="API Key"
                  />
                  <label for="apikey">API Key</label>
                </div>
              </div>
              <div class="col-md-6 mb-4">
                <div class="form-floating">
                  <input
                    type="text"
                    v-model="topic"
                    id="topic"
                    class="form-control"
                    placeholder="Topic"
                  />
                  <label for="topic">Topic</label>
                </div>
              </div>
              <div class="col-md-6 mb-4">
                <div class="form-floating">
                  <input
                    type="date"
                    v-model="startDate"
                    id="startDate"
                    class="form-control"
                    placeholder="Fecha Inicio"
                  />
                  <label for="startDate">Fecha Inicio</label>
                </div>
              </div>
              <div class="col-md-6 mb-4">
                <div class="form-floating">
                  <input
                    type="date"
                    v-model="endDate"
                    id="endDate"
                    class="form-control"
                    placeholder="Fecha Fin"
                  />
                  <label for="endDate">Fecha Fin</label>
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
              :key="result.serial"
              class="result-item"
            >
              <div class="result-header">Serial: {{ result.serial }}</div>
              <div class="result-details">
                <span>API Key: {{ result.apikey || "N/A" }}</span>
                <span>Servidor: {{ result.name || "N/A" }}</span>
                <span>ServerId: {{ result.serverId || "N/A" }}</span>
                <span
                  >Última Comunicación:
                  {{
                    new Date(result.lastCommunication).toLocaleString()
                  }}</span
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
      apikey: "",
      topic: "",
      startDate: "",
      endDate: "",
      showFilters: false,
      searchResults: [],
      currentPage: 1,
      resultsPerPage: 10,
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
      fetch("http://localhost:3000/servers")
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
      let url = `http://localhost:3000/devices?`;
      if (this.serial) url += `serial_like=^${this.serial}&`;
      if (this.apikey) url += `apikey=${this.apikey}&`;
      if (this.startDate)
        url += `lastCommunication_gte=${new Date(
          this.startDate
        ).toISOString()}&`;
      if (this.endDate)
        url += `lastCommunication_lte=${new Date(this.endDate).toISOString()}&`;

      this.selectedServers.forEach((serverId) => {
        url += `serverId=${serverId}&`;
      });

      url = url.endsWith("&") ? url.slice(0, -1) : url;

      fetch(url)
        .then((response) => response.json())
        .then((data) => {
          this.searchResults = data;
          this.currentPage = 1;
        })
        .catch((error) => console.error("Error fetching data:", error));
    },
    changePage(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.currentPage = page;
      }
    },
  },
  created() {
    this.fetchServers();
  },
};
</script>

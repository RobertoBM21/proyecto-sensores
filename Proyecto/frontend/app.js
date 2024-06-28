document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("loginButton").addEventListener("click", login);
  document.getElementById("filterButton").addEventListener("click", toggleFilters);
  document.getElementById("searchButton").addEventListener("click", searchDevices);
});

// Funcionalidad de login: AUN NO IMPLEMENTADA
function login() {}


// Funcionalidad de filtros: muestra/oculta los filtros de búsqueda y ajusta la posicion del botón de búsqueda
function toggleFilters() {
  const filters = document.getElementById("filters");
  const searchButton =
    document.getElementById("searchButton").parentElement.parentElement;
  if (filters.style.display === "none" || filters.style.display === "") {
    filters.style.display = "flex";
    searchButton.style.marginTop = "1rem";
  } else {
    filters.style.display = "none";
    searchButton.style.marginTop = "0";
  }
}

// Funcionalidad de búsqueda: API fetch y muestra los dispositivos que coinciden con los filtros
function searchDevices() {
  const serial = document.getElementById("serial").value;
  const apikey = document.getElementById("apikey").value;
  const topic = document.getElementById("topic").value;
  const startDate = document.getElementById("startDate").value;
  const endDate = document.getElementById("endDate").value;

  const serverDropdown = document.getElementById("serverDropdown");
  const servers = Array.from(
    serverDropdown.querySelectorAll("input[type=checkbox]:checked")
  ).map((checkbox) => checkbox.value);

  if (servers.length === 0) {
    alert("Seleccione al menos un servidor");
    return;
  }

  let url = `http://localhost:3000/messages?`;

  if (serial) url += `serial=${serial}&`;
  if (apikey) url += `apikey=${apikey}&`;
  if (topic) url += `messageType=${topic}&`;
  if (startDate) url += `timestamp_gte=${new Date(startDate).toISOString()}&`;
  if (endDate) url += `timestamp_lte=${new Date(endDate).toISOString()}&`;

  fetch(url)
    .then((response) => response.json())
    .then((data) => displayResults(data))
    .catch((error) => console.error("Error fetching data:", error));
}

// Funcionalidad de paginación: muestra los resultados de búsqueda en páginas y crea botones para navegar entre ellas
const RESULTS_PER_PAGE = 10;
let currentPage = 1;
let searchResults = [];

function displayResults(data) {
  searchResults = data;
  currentPage = 1;
  renderPage();
}

function renderPage() {
  const resultsDiv = document.getElementById("results");
  resultsDiv.innerHTML = "";

  const startIndex = (currentPage - 1) * RESULTS_PER_PAGE;
  const endIndex = Math.min(startIndex + RESULTS_PER_PAGE, searchResults.length);

  for (let i = startIndex; i < endIndex; i++) {
    const item = searchResults[i];
    const div = document.createElement("div");
    div.className = "result-item";
    
    const header = document.createElement("div");
    header.className = "result-header";
    header.textContent = `Serial: ${item.serial}`;

    const details = document.createElement("div");
    details.className = "result-details";
    details.innerHTML = `
      <span>API Key: ${item.apikey || "N/A"}</span>
      <span>Servidor: ${item.name || "N/A"}</span>
      <span>ServerId: ${item.serverId || "N/A"}</span>
      <span>Última Comunicación: ${new Date(item.timestamp).toLocaleDateString()}</span>
    `;

    div.appendChild(header);
    div.appendChild(details);
    div.onclick = () => viewDeviceDetails(item.serial);
    resultsDiv.appendChild(div);
  }

  renderPagination();
}

function renderPagination() {
  const paginationDiv = document.getElementById("pagination");
  paginationDiv.innerHTML = "";

  const totalPages = Math.ceil(searchResults.length / RESULTS_PER_PAGE);

  const createButton = (text, page, isDisabled = false) => {
    const button = document.createElement("button");
    button.textContent = text;
    button.className = `page-button ${isDisabled ? 'disabled' : ''}`;
    if (page === currentPage) {
      button.classList.add("active");
    }
    if (!isDisabled) {
      button.onclick = () => {
        currentPage = page;
        renderPage();
      };
    }
    return button;
  };

  // Botón de ir a la primera página
  paginationDiv.appendChild(createButton("<<", 1, currentPage === 1));

  // Botones de números de página
  for (let i = 1; i <= totalPages; i++) {
    paginationDiv.appendChild(createButton(i, i));
  }

  // Botón de ir a la última página
  paginationDiv.appendChild(createButton(">>", totalPages, currentPage === totalPages));
}

// Funcionalidad de redirección a la página de detalles de un dispositivo
function viewDeviceDetails(serial) {
  window.location.href = `device.html?serial=${serial}`;
}
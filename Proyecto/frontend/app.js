document.addEventListener("DOMContentLoaded", () => {
  document
    .getElementById("filterButton")
    .addEventListener("click", toggleFilters);
  document
    .getElementById("searchButton")
    .addEventListener("click", searchDevices);
});

// Funcionalidad de filtros: muestra/oculta los filtros de búsqueda y ajusta el margen del botón de búsqueda
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
  const startDate = document.getElementById("startDate").value;
  const endDate = document.getElementById("endDate").value;
  const topic = document.getElementById("topic").value;

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
  if (startDate) url += `timestamp_gte=${new Date(startDate).toISOString()}&`;
  if (endDate) url += `timestamp_lte=${new Date(endDate).toISOString()}&`;
  if (topic) url += `messageType=${topic}&`;

  fetch(url)
    .then((response) => response.json())
    .then((data) => displayResults(data))
    .catch((error) => console.error("Error fetching data:", error));
}

function displayResults(data) {
  const resultsDiv = document.getElementById("results");
  resultsDiv.innerHTML = "";

  data.forEach((item) => {
    const div = document.createElement("div");
    div.className = "list-group-item";
    div.textContent = `Serial: ${item.serial}, API Key: ${
      item.apikey || "N/A"
    }, Server: ${item.serverId || "N/A"}, Última Comunicación: ${
      item.timestamp
    }`;
    div.onclick = () => viewDeviceDetails(item.serial);
    resultsDiv.appendChild(div);
  });
}

function viewDeviceDetails(serial) {
  window.location.href = `device.html?serial=${serial}`;
}

// Funcionalidad futura

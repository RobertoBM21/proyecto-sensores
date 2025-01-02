import Keycloak from "keycloak-js";

//TODO: Sustituir valores por variables de entorno
// Constantes
const KEYCLOAK_CONFIG = {
  url: "http://localhost:8080/",
  realm: "sensores",
  clientId: "frontend-sensores",
};

const TOKEN_REFRESH_THRESHOLD = 30;

// Instancia de Keycloak
let keycloakInstance = null;

// Funciones del servicio
const initKeycloak = async () => {
  const keycloak = new Keycloak(KEYCLOAK_CONFIG);

  try {
    keycloak.onTokenExpired = async () => {
      console.log("Token expired, updating...");
      await updateToken();
    };

    await keycloak.init({
      checkLoginIframe: false,
    });

    keycloakInstance = keycloak;
    return keycloak;
  } catch (error) {
    console.error("Keycloak init error:", error);
    throw error;
  }
};

const updateToken = async () => {
  try {
    const updated = await keycloakInstance?.updateToken(
      TOKEN_REFRESH_THRESHOLD
    );
    if (updated) {
      console.log("Token updated successfully");
    } else {
      console.log("Token still valid, not updated");
    }
    return updated;
  } catch (error) {
    console.error("Failed to update token:", error);
    throw error;
  }
};

const login = async (path) => {
  await keycloakInstance?.login({
    redirectUri: `http://localhost:80${path}`,
  });
};

const logout = async () => {
  await keycloakInstance?.logout({
    redirectUri: "http://localhost:80/",
  });
};

export const keycloakService = {
  init: initKeycloak,
  login,
  logout,
  updateToken,
  getInstance: () => keycloakInstance,
};

import Keycloak from "keycloak-js";

// Constantes
const KEYCLOAK_CONFIG = {
  url: import.meta.env.VITE_KEYCLOAK_URL,
  realm: import.meta.env.VITE_KEYCLOAK_REALM,
  clientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID,
};

const HOME_URL = import.meta.env.VITE_FRONTEND_URL;

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
    redirectUri: `${HOME_URL}${path}`,
  });
};

const logout = async () => {
  await keycloakInstance?.logout({
    redirectUri: `${HOME_URL}/`,
  });
};

export const keycloakService = {
  init: initKeycloak,
  login,
  logout,
  updateToken,
  getInstance: () => keycloakInstance,
};

const { createLocalJWKSet, jwtVerify } = require("jose");

const KEYCLOAK_JWKS_URI = `${process.env.KEYCLOAK_URL}realms/${process.env.KEYCLOAK_REALM}/protocol/openid-connect/certs`;
const KEYCLOAK_ISSUER = `${process.env.VITE_KEYCLOAK_URL}realms/${process.env.KEYCLOAK_REALM}`;

const ROLES = {
  ADMIN: "admin",
  USER: "user",
};

//* Cachear la JWKS en memoria
let JWKS = null;

//* Función para obtener la JWKS
async function getJWKS() {
  if (!JWKS) {
    const response = await fetch(KEYCLOAK_JWKS_URI); // Descarga la JWKS del servidor Keycloak
    const data = await response.json();
    JWKS = createLocalJWKSet(data);
  }
  return JWKS;
}

//* Middleware para rutas protegidas
function authMiddleware(requiredRole = null) {
  return async (req, res, next) => {
    try {
      // Extraer Bearer token
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        return res.status(401).json({ error: "Missing Authorization header" });
      }

      const [scheme, token] = authHeader.split(" ");
      if (scheme !== "Bearer" || !token) {
        return res
          .status(401)
          .json({ error: "Invalid Authorization header format" });
      }

      // Verificar firma y claims base (issuer, exp y audience)
      const jwks = await getJWKS();
      const { payload } = await jwtVerify(token, jwks, {
        issuer: KEYCLOAK_ISSUER,
        audience: process.env.VITE_KEYCLOAK_CLIENT_ID,
      });

      // Guardar payload en req.user
      req.user = payload;

      // Si requiredRole != null, verificar roles
      if (requiredRole) {
        const roles =
          payload.resource_access?.[process.env.VITE_KEYCLOAK_CLIENT_ID]
            ?.roles || [];
        if (!roles.includes(requiredRole)) {
          return res.status(403).json({ error: "Forbidden: missing role" });
        }
      }

      // Si llegamos aquí, el token es válido
      return next();
    } catch (error) {
      console.error("Token validation error:", error);
      return res.status(401).json({ error: "Invalid or expired token" });
    }
  };
}

module.exports = { authMiddleware, ROLES };

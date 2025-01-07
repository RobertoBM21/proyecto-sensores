const { createLocalJWKSet, jwtVerify } = require("jose");

const KEYCLOAK_JWKS_URI = `${process.env.KEYCLOAK_URL}realms/${process.env.KEYCLOAK_REALM}/protocol/openid-connect/certs`;
const KEYCLOAK_ISSUER = `${process.env.VITE_KEYCLOAK_URL}realms/${process.env.KEYCLOAK_REALM}`;

// Para cachear la JWKS en memoria (o puedes guardarla en variable global)
let JWKS = null;

// Función para obtener la JWKS
async function getJWKS() {
  if (!JWKS) {
    // Descarga la JWKS del servidor Keycloak
    const response = await fetch(KEYCLOAK_JWKS_URI);
    const data = await response.json();
    JWKS = createLocalJWKSet(data);
    // 'data' es el JSON con "keys": [ ... ]
  }
  return JWKS;
}

// Middleware para rutas protegidas
async function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: "Missing Authorization header" });
    }

    const tokenParts = authHeader.split(" ");
    if (tokenParts.length !== 2 || tokenParts[0] !== "Bearer") {
      return res
        .status(401)
        .json({ error: "Invalid Authorization header format" });
    }

    const token = tokenParts[1];

    // Obtén la JWKS (y créala si no existe)
    const jwks = await getJWKS();

    // Verifica la firma y el contenido del token
    // En "issuer", pon la URL real de tu realm (fíjate que coincida con el 'iss' del token)
    const { payload } = await jwtVerify(token, jwks, {
      issuer: KEYCLOAK_ISSUER,
      // audience: 'app-sensores', // Si quieres validar la 'aud'
    });

    // Si llegamos hasta aquí, el token es válido. Guarda info en req.user si deseas
    req.user = payload;

    // Continua
    return next();
  } catch (error) {
    console.error("Token validation error:", error);
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

module.exports = { authMiddleware };

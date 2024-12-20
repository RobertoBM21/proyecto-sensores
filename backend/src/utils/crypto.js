const crypto = require("crypto");

//* Encripta un texto con el algoritmo AES-256-CBC (se usa para encriptar la contraseña de cada servidor de la base de datos)
function encrypt(text) {
  const SEPARATOR = ":";
  const ALGORITHM = "aes-256-cbc";
  const key = Buffer.from(process.env.ENCRYPTION_KEY, "hex");
  const iv = crypto.randomBytes(16);

  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  return `${encrypted}${SEPARATOR}${iv.toString("hex")}`;
}

module.exports = { encrypt };

# Utilizo alpine para reducir el tamaño de la imagen
FROM node:22-alpine

# Establecer directorio de trabajo
WORKDIR /app

# Copiar todos los archivos menos los que están en .dockerignore
COPY . .

# Instalar dependencias y construir la aplicación
RUN npm install && node --run build

# Exponer puerto
EXPOSE 4173

# Comando por defecto
CMD ["node", "--run", "preview"]

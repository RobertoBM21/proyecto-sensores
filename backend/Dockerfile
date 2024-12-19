# Utilizo alpine para reducir el tamaño de la imagen
FROM node:22-alpine

# Establecer directorio de trabajo
WORKDIR /app

# Copiar todos los archivos menos los que están en .dockerignore
COPY . .

# Instalar dependencias
RUN npm install

# Exponer puerto
EXPOSE 3000

# Comando por defecto
CMD ["node", "--run", "start"]

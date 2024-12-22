# Primera etapa: Construir la aplicación
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install

# Segunda etapa: Servir la aplicación con node
FROM node:22-alpine
WORKDIR /app

# Asegurar permisos antes de cambiar usuario
COPY --from=builder --chown=node:node /app/package*.json ./
COPY --from=builder --chown=node:node /app/node_modules ./node_modules
COPY --chown=node:node ./src ./src

USER node

EXPOSE 3000
CMD ["node", "--run", "start"]

# Primera etapa: Construir la aplicación
FROM node:22-alpine AS builder
WORKDIR /app
COPY . .
RUN npm install && node --run build

# Segunda etapa: Servir la aplicación con nginx
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

# Utilizo slim para reducir el tamaño de la imagen
FROM python:3.12-slim

# Establecer directorio de trabajo
WORKDIR /app

# Instalar dependencias del sistema
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copiar todos los archivos menos los que están en .dockerignore
COPY . .

# Instalar dependencias de Python
RUN pip install --no-cache-dir -r requirements.txt

# Ejecutar el script con opción -u para no colapsar el buffer de salida
CMD ["python", "-u", "mqtt_manager.py"]

# # Primera etapa: Construir la aplicación
# FROM python:3.12-slim AS builder
# WORKDIR /app

# RUN apt-get update && apt-get install -y --no-install-recommends \
#     gcc \
#     && rm -rf /var/lib/apt/lists/*

# COPY requirements.txt .
# RUN pip install --no-cache-dir --prefix=/install -r requirements.txt

# # Segunda etapa: Servir la aplicación con python
# FROM python:3.12-slim
# WORKDIR /app

# # Copiar las dependencias ya compiladas
# COPY --from=builder /install /usr/local
# COPY mqtt_manager.py mqtt_client.py ./

# # Crear usuario no root
# RUN useradd -m appuser && \
#     chown -R appuser /app
# USER appuser

# CMD ["python", "-u", "mqtt_manager.py"]


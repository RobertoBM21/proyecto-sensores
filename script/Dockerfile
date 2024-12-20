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

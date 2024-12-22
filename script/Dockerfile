# Primera etapa: Construir la aplicación
FROM python:3.12-slim AS builder
WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir --prefix=/install -r requirements.txt

# Segunda etapa: Servir la aplicación con python
FROM python:3.12-slim
WORKDIR /app

# Copiar las dependencias ya compiladas
COPY --from=builder /install /usr/local
COPY mqtt_manager.py mqtt_client.py ./

# Mantener el contenedor en ejecución
CMD ["tail", "-f", "/dev/null"]
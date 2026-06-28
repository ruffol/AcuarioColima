FROM node:20-slim AS base

# Instalar dependencias de compilación para better-sqlite3
RUN apt-get update && apt-get install -y \
  python3 \
  make \
  g++ \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copiar package files
COPY package.json package-lock.json ./

# Instalar dependencias
RUN npm ci

# Copiar el resto del proyecto
COPY . .

# Build
RUN npm run build

# Puerto
EXPOSE $PORT

# Start
CMD ["npm", "run", "start"]

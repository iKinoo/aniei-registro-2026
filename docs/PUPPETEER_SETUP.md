# Configuración de Puppeteer para Docker / Servidor Propio

Este documento describe cómo configurar Puppeteer para la generación de PDFs cuando la aplicación se ejecute en un entorno propio (servidor dedicado, VPS, Docker) en lugar de Vercel.

---

## 1. Dependencias del Sistema (Linux)

Chromium requiere una serie de bibliotecas del sistema para funcionar correctamente. En distribuciones basadas en Debian/Ubuntu, instala lo siguiente:

```bash
apt-get update && apt-get install -y \
  ca-certificates \
  fonts-liberation \
  libappindicator3-1 \
  libasound2 \
  libatk-bridge2.0-0 \
  libatk1.0-0 \
  libc6 \
  libcairo2 \
  libcups2 \
  libdbus-1-3 \
  libexpat1 \
  libfontconfig1 \
  libgbm1 \
  libgcc1 \
  libglib2.0-0 \
  libgtk-3-0 \
  libnspr4 \
  libnss3 \
  libpango-1.0-0 \
  libpangocairo-1.0-0 \
  libstdc++6 \
  libx11-6 \
  libx11-xcb1 \
  libxcb1 \
  libxcomposite1 \
  libxcursor1 \
  libxdamage1 \
  libxext6 \
  libxfixes3 \
  libxi6 \
  libxrandr2 \
  libxrender1 \
  libxss1 \
  libxtst6 \
  lsb-release \
  wget \
  xdg-utils
```

> **Nota:** En Alpine Linux, Puppeteer/Chromium requiere un conjunto diferente de paquetes (`chromium`, `nss`, `freetype`, `harfbuzz`, `ca-certificates`, `ttf-freefont`).

---

## 2. Instalación de Chromium

Puedes usar **uno** de los siguientes métodos:

### Opción A: Usar Chromium del sistema (recomendado para Docker)

```bash
apt-get install -y chromium
```

Luego define la variable de entorno:

```bash
export PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium
```

### Opción B: Usar @sparticuz/chromium (sin dependencias del sistema)

El paquete `@sparticuz/chromium` ya está incluido en las dependencias del proyecto. Intenta encontrar el ejecutable automáticamente; si no puede, cae en el fallback de buscar rutas comunes.

---

## 3. Variables de Entorno

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `PUPPETEER_EXECUTABLE_PATH` | Ruta al ejecutable de Chrome/Chromium. | `/usr/bin/chromium` |
| `VERCEL` | Se establece automáticamente en Vercel. No modificar manualmente. | `1` |

> **Consejo:** Siempre que sea posible, define `PUPPETEER_EXECUTABLE_PATH` para evitar ambigüedades y acelerar el inicio del servicio.

---

## 4. Dockerfile de Ejemplo

```dockerfile
# Etapa de construcción
FROM node:20-slim AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Etapa de producción
FROM node:20-slim
WORKDIR /app

# Instalar dependencias de sistema y Chromium
RUN apt-get update && apt-get install -y \
    chromium \
    fonts-liberation \
    libnss3 \
    libatk-bridge2.0-0 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    libgbm1 \
    libasound2 \
    libpangocairo-1.0-0 \
    libxss1 \
    libgtk-3-0 \
    ca-certificates \
    --no-install-recommends && \
    rm -rf /var/lib/apt/lists/*

ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium
ENV NODE_ENV=production

COPY --from=builder /app/package*.json ./
RUN npm ci --only=production
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

EXPOSE 3000
CMD ["npm", "start"]
```

---

## 5. Opciones de Rendimiento en Contenedores

En entornos Docker, Chromium debe ejecutarse sin sandbox por defecto. El servicio `PuppeteerPdfService` ya incluye estos argumentos cuando usa `PUPPETEER_EXECUTABLE_PATH` o el fallback de rutas:

```ts
args: ['--no-sandbox', '--disable-setuid-sandbox']
```

Si esperas un alto volumen de generación de PDFs, considera:

- **Reutilizar el navegador:** En lugar de lanzar/cerrar un browser por cada PDF, crea un pool de navegadores o reutiliza uno solo. Esto requiere modificar `getBrowser()` y `htmlToPdfBuffer()` para aceptar un browser externo.
- **Ejecutar en un worker separado:** Si la generación de PDFs se vuelve un cuello de botella, considérala extraer a un microservicio o función serverless dedicada.

---

## 6. Solución de Problemas

### Error: "No se encontró un ejecutable de Chromium"

- Verifica que `chromium` esté instalado: `which chromium` o `which google-chrome`.
- Define explícitamente `PUPPETEER_EXECUTABLE_PATH` con la ruta correcta.

### Error: "Failed to launch the browser process"

- Revisa que todas las librerías del sistema de la sección 1 estén instaladas.
- Asegúrate de que el contenedor/servidor tenga suficiente memoria RAM (Chromium consume ~100-300MB por instancia).

### Tamaño de fuentes incorrecto en PDF

- Asegúrate de instalar las fuentes del sistema (`fonts-liberation`, `ttf-freefont`, etc.).
- El template usa `'DejaVu Sans', 'Liberation Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif` como stack de fuentes seguras.

---

## 7. Migración desde Vercel

Si actualmente usas Vercel y decides migrar a un servidor propio o Docker:

1. Elimina la variable `VERCEL` de tu entorno (o no la definas).
2. Instala Chromium en el servidor o en el contenedor.
3. Define `PUPPETEER_EXECUTABLE_PATH`.
4. Despliega con `npm run build && npm start` (o usa el Dockerfile de ejemplo).

No es necesario cambiar código: `PuppeteerPdfService` detecta automáticamente el entorno mediante `VERCEL` o `PUPPETEER_EXECUTABLE_PATH`.

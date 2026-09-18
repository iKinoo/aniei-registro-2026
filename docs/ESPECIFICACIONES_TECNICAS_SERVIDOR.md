# Especificaciones Técnicas para Despliegue — ANIEI Registro 2026

> **Fecha:** 2026-09-14  
> **Propósito:** Definir los requisitos mínimos y recomendables de hardware y software para desplegar el sistema de registro ANIEI 2026 en un servidor Linux.

---

## 1. Resumen Ejecutivo

El sistema es una aplicación web Next.js 16 con base de datos MySQL 8.x, diseñada para manejar registros individuales y grupales, generación de constancias PDF, gestión de actividades con cupo y panel de administración.

**Volumen esperado:** ~800 registros totales durante el periodo del congreso (no simultáneos).

**Modelo de despliegue:** Servidor Linux dedicado o VPS, sin Docker, con archivos en sistema de archivos local.

---

## 2. Perfil de Carga

| Métrica | Valor Estimado |
|---------|----------------|
| Registros totales | ~800 |
| Usuarios simultáneos pico | 10-30 (registro en línea) |
| Comprobantes de pago | ~800 archivos (~4 GB) |
| Constancias PDF | ~800 archivos (~2 GB) |
| Tamaño base de datos | <100 MB |

---

## 3. Especificaciones Mínimas (Producción)

### 3.1 Hardware

| Componente | Especificación Mínima |
|------------|----------------------|
| **CPU** | 1 núcleo (1 vCPU) |
| **RAM** | 1 GB |
| **Almacenamiento** | 20 GB SSD |
| **Red** | 100 Mbps |

### 3.2 Software

| Componente | Versión Mínima | Notas |
|------------|----------------|-------|
| **Sistema Operativo** | Ubuntu 22.04 LTS o superior | Debian 11+ también compatible |
| **Node.js** | 20.x LTS | 22.x LTS recomendado |
| **MySQL** | 8.0 | 8.4 LTS recomendado |
| **npm** | 10.x | Incluido con Node.js |

### 3.3 Espacio en Disco (Desglose)

| Ubicación | Tamaño | Propósito |
|-----------|--------|-----------|
| `/opt/aniei-registro-2026` | 500 MB | Código + node_modules |
| `./storage/` | 6 GB | Comprobantes (~4 GB) + constancias (~2 GB) |
| MySQL data | 1 GB | Base de datos (~800 registros) |
| Sistema + logs | 3 GB | SO, logs, temporales |
| **Total** | **~11 GB** | Suficiente para el evento completo |

---

## 4. Especificaciones Recomendadas (Con Margen de Crecimiento)

### 4.1 Hardware

| Componente | Especificación Recomendada | Justificación |
|------------|---------------------------|---------------|
| **CPU** | 2 núcleos (2 vCPU) | Compilación Next.js + margen |
| **RAM** | 2 GB | MySQL + Node.js + sistema |
| **Almacenamiento** | 40 GB SSD | Espacio para respaldos |
| **Red** | 100 Mbps | Suficiente para carga de archivos |

### 4.2 Software

| Componente | Versión Recomendada | Notas |
|------------|---------------------|-------|
| **Sistema Operativo** | Ubuntu 24.04 LTS | Soporte hasta 2029 |
| **Node.js** | 22.x LTS | Mejor rendimiento y soporte hasta 2027 |
| **MySQL** | 8.4 LTS | Soporte hasta 2026+, mejor rendimiento |
| **nginx** | 1.24+ | Reverse proxy + TLS termination |
| **certbot** | 3.x | Certificados Let's Encrypt automáticos |

### 4.3 Espacio en Disco (Desglose)

| Ubicación | Tamaño | Propósito |
|-----------|--------|-----------|
| `/opt/aniei-registro-2026` | 1 GB | Código + node_modules + margen |
| `./storage/` | 10 GB | Archivos + margen de crecimiento |
| MySQL data | 2 GB | Base de datos + índices |
| Respaldos | 10 GB | 7 días de respaldos diarios |
| Sistema + logs | 5 GB | SO, logs rotados, temporales |
| **Total** | **~28 GB** | Con margen cómodo |

---

## 4. Requisitos de Red y Seguridad

### 4.1 Puertos

| Puerto | Protocolo | Servicio | Exposición |
|--------|-----------|----------|------------|
| 22 | TCP | SSH | Público (restringir por IP si es posible) |
| 80 | TCP | HTTP | Público (redirige a HTTPS) |
| 443 | TCP | HTTPS | Público |
| 3000 | TCP | Node.js (app) | **Solo localhost** (detrás de nginx) |
| 3306 | TCP | MySQL | **Solo localhost** (nunca exponer) |

### 4.2 Firewall (UFW)

```bash
sudo ufw allow 22,80,443/tcp
sudo ufw enable
```

**No exponer:** 3000 (app), 3306 (MySQL)

### 4.3 TLS/SSL

- **Requerido:** Certificado TLS válido (Let's Encrypt gratuito)
- **Configuración:** nginx + certbot con renovación automática
- **Protocolos:** TLS 1.2 y 1.3 únicamente
- **Cipher suites:** Configurar según Mozilla Intermediate Profile

---

## 5. Requisitos de Base de Datos

### 5.1 Configuración MySQL

| Parámetro | Valor Recomendado | Notas |
|-----------|-------------------|-------|
| `innodb_buffer_pool_size` | 1-2 GB (50-70% de RAM) | Mejora rendimiento de consultas |
| `innodb_log_file_size` | 256 MB | Para cargas de escritura moderadas |
| `max_connections` | 150 | Suficiente para app + respaldos |
| `character-set-server` | utf8mb4 | Requerido (emojis, caracteres especiales) |
| `collation-server` | utf8mb4_0900_ai_ci | Requerido por Prisma |
| `default-time-zone` | '+00:00' | UTC (configuración de la app) |

### 5.2 Bases de Datos

| Base de Datos | Propósito | Tamaño Estimado |
|---------------|-----------|-----------------|
| `aniei` | Datos de producción | 100 MB - 2 GB |
| `aniei_shadow` | Migraciones Prisma | 100 MB - 2 GB (temporal) |

### 5.3 Usuario MySQL

- **Usuario:** `aniei`
- **Host:** `localhost`
- **Permisos:** Solo sobre `aniei` y `aniei_shadow`
- **Autenticación:** Contraseña fuerte (mínimo 16 caracteres)

---

## 6. Variables de Entorno Requeridas

| Variable | Tipo | Ejemplo | Obligatorio |
|----------|------|---------|-------------|
| `DATABASE_URL` | String | `mysql://aniei:***@localhost:3306/aniei` | Sí |
| `DIRECT_URL` | String | `mysql://aniei:***@localhost:3306/aniei` | Sí |
| `SHADOW_DATABASE_URL` | String | `mysql://aniei:***@localhost:3306/aniei_shadow` | Sí (solo migraciones) |
| `AUTH_SECRET` | String (32+ chars) | `openssl rand -base64 32` | Sí |
| `STORAGE_URL_SECRET` | String (32+ chars) | `openssl rand -base64 32` | Sí |
| `NEXT_PUBLIC_APP_URL` | URL | `https://registro.aniei.mx` | Sí |
| `STORAGE_PROVIDER` | String | `filesystem` | Sí |
| `STORAGE_LOCAL_DIR` | Path | `./storage` | Sí |
| `GMAIL_USER` | Email | `registro.aniei@gmail.com` | Sí (para correos) |
| `GMAIL_APP_PASSWORD` | String | App Password de Gmail | Sí (para correos) |
| `EMAIL_FROM` | String | `ANIEI <registro.aniei@gmail.com>` | Sí |

---

## 7. Procesos y Servicios

### 7.1 Servicios del Sistema

| Servicio | Descripción | Reinicio automático |
|----------|-------------|---------------------|
| `mysql.service` | Base de datos MySQL | Sí |
| `aniei.service` | Aplicación Next.js (systemd) | Sí |
| `nginx.service` | Reverse proxy + TLS | Sí |
| `cron.service` | Respaldos programados | Sí |

### 7.2 Configuración systemd (aniei.service)

```ini
[Unit]
Description=ANIEI Registro 2026 (Next.js)
After=network.target mysql.service
Requires=mysql.service

[Service]
Type=simple
User=aniei
Group=aniei
WorkingDirectory=/opt/aniei-registro-2026
EnvironmentFile=/opt/aniei-registro-2026/.env.local
ExecStart=/usr/bin/npm start -- --port 3000 --hostname 127.0.0.1
Restart=always
RestartSec=5
NoNewPrivileges=true

[Install]
WantedBy=multi-user.target
```

### 7.3 Tareas Programadas (cron)

| Frecuencia | Tarea | Comando |
|------------|-------|---------|
| Diario 02:00 | Respaldo BD | `mysqldump ... \| gzip > backup.sql.gz` |
| Diario 02:30 | Respaldo archivos | `tar -czf storage-backup.tgz storage/` |
| Diario 03:00 | Limpieza respaldos >7 días | `find /var/backups/aniei -mtime +7 -delete` |

---

## 8. Rendimiento Esperado

### 8.1 Métricas de Referencia

| Escenario | Especificaciones | Usuarios Simultáneos | Tiempo de Respuesta |
|-----------|------------------|---------------------|---------------------|
| **Mínimo** | 1 vCPU, 1 GB RAM | 5-10 | <2s |
| **Recomendado** | 2 vCPU, 2 GB RAM | 10-30 | <1s |

### 8.2 Factores de Rendimiento

- **CPU:** Compilación Next.js (solo en `npm run build`), generación de PDFs, codificación QR
- **RAM:** MySQL buffer pool, Node.js heap, generación de PDFs en memoria
- **Disco:** IOPS para MySQL, escritura de comprobantes/constancias
- **Red:** Carga de archivos (comprobantes PDF/imágenes hasta 5 MB)

### 8.3 Capacidad del Sistema

Con las especificaciones recomendadas (2 vCPU, 2 GB RAM):
- Soporta cómodamente los ~800 registros del congreso
- Picos de 10-30 usuarios simultáneos sin degradación
- Generación de constancias PDF sin problemas de memoria

---

## 9. Escalabilidad

### 9.1 Escalabilidad Vertical

- **CPU:** Aumentar núcleos mejora compilación y requests concurrentes
- **RAM:** Aumentar `innodb_buffer_pool_size` mejora rendimiento de MySQL
- **Disco:** SSD NVMe mejora IOPS de MySQL y escritura de archivos

### 9.2 Escalabilidad Horizontal

**Limitaciones actuales:**
- Archivos en sistema de archivos local (no compartido)
- Sesiones en memoria (Auth.js)
- Sin soporte nativo para múltiples instancias

**Para escalar horizontalmente se requiere:**
- Migrar `./storage/` a S3/NFS compartido
- Migrar sesiones a Redis/MySQL
- Load balancer (nginx/HAProxy)
- Múltiples instancias de la app

---

## 10. Monitoreo y Logs

### 10.1 Logs del Sistema

| Log | Ubicación | Rotación |
|-----|-----------|----------|
| Aplicación | `journalctl -u aniei` | systemd-journald |
| MySQL | `/var/log/mysql/error.log` | logrotate diario |
| nginx | `/var/log/nginx/access.log`, `error.log` | logrotate diario |
| Auditoría | `journalctl -k` | systemd-journald |

### 10.2 Métricas Recomendadas

| Métrica | Herramienta | Alerta |
|---------|-------------|--------|
| Uso de CPU | `htop`, `top` | >80% por 5 min |
| Uso de RAM | `free -h` | >85% |
| Espacio en disco | `df -h` | >80% |
| Conexiones MySQL | `SHOW STATUS LIKE 'Threads_connected'` | >100 |
| Tiempo de respuesta | nginx access log | >2s promedio |
| Errores 5xx | nginx error log | >10/hora |

---

## 11. Seguridad

### 11.1 Hardening del Sistema

- [ ] Actualizaciones automáticas de seguridad (`unattended-upgrades`)
- [ ] Firewall UFW activo (solo 22, 80, 443)
- [ ] SSH con llaves públicas (desactivar contraseña)
- [ ] Fail2ban para SSH y nginx
- [ ] AppArmor/SELinux activado
- [ ] Usuario `aniei` sin privilegios sudo

### 11.2 Seguridad de la Aplicación

- [ ] `.env.local` con permisos `600` (solo lectura para usuario `aniei`)
- [ ] Secretos generados con `openssl rand -base64 32`
- [ ] HTTPS obligatorio (redirección 80 → 443)
- [ ] MySQL solo escucha localhost
- [ ] Archivos privados servidos vía URLs firmadas (expiración 5 min)
- [ ] Validación de entrada con Zod (previene inyección SQL/XSS)
- [ ] Contraseñas hasheadas con bcrypt (cost 10)

### 11.3 Respaldos

- [ ] Respaldo diario de MySQL (compress con gzip)
- [ ] Respaldo diario de `./storage/` (tar + gzip)
- [ ] Retención: 7 días locales + 30 días offsite
- [ ] Prueba de restauración mensual (documentada)

---

## 12. Costos Estimados (Proveedores Cloud)

### 12.1 VPS (DigitalOcean, Vultr, Linode)

| Plan | Especificaciones | Costo Mensual | Adecuado para |
|------|------------------|---------------|---------------|
| Basic | 1 vCPU, 1 GB RAM, 25 GB SSD | $6 USD | Producción (~800 registros) |
| Basic | 2 vCPU, 2 GB RAM, 50 GB SSD | $12 USD | Producción con margen |

### 12.2 Servidor Dedicado (Hetzner, OVH)

| Plan | Especificaciones | Costo Mensual | Adecuado para |
|------|------------------|---------------|---------------|
| CX11 | 1 vCPU, 2 GB RAM, 20 GB SSD | €3.49 EUR | Producción económica |
| CX21 | 2 vCPU, 4 GB RAM, 40 GB SSD | €4.49 EUR | Producción recomendada |

### 12.3 Costos Adicionales

| Concepto | Costo | Notas |
|----------|-------|-------|
| Dominio | $10-15 USD/año | `.mx` o `.com` |
| Certificado TLS | Gratis | Let's Encrypt |
| Respaldos offsite | $0-5 USD/mes | Backblaze B2 (opcional) |
| Correo (Gmail) | Gratis | App Password (sin costo adicional) |

### 12.4 Costo Total Estimado

| Escenario | Costo Mensual | Costo Anual |
|-----------|---------------|-------------|
| **Económico** (Hetzner CX11) | ~$4 USD | ~$48 USD + dominio |
| **Recomendado** (DigitalOcean Basic 2GB) | ~$12 USD | ~$144 USD + dominio |

---

## 13. Checklist de Despliegue

### 13.1 Pre-despliegue

- [ ] Servidor con SO instalado (Ubuntu 24.04 LTS recomendado)
- [ ] Acceso SSH con llave pública
- [ ] Dominio apuntando a IP del servidor
- [ ] Credenciales de Gmail (App Password) listas
- [ ] Código fuente en `.zip` verificado

### 13.2 Instalación

- [ ] Node.js 22.x LTS instalado
- [ ] MySQL 8.4 instalado y configurado
- [ ] Bases de datos `aniei` y `aniei_shadow` creadas
- [ ] Usuario MySQL `aniei` creado con permisos
- [ ] Código descomprimido en `/opt/aniei-registro-2026`
- [ ] Dependencias instaladas (`npm ci`)
- [ ] Migraciones aplicadas (`npx prisma migrate deploy`)
- [ ] Catálogos sembrados (`node prisma/seed.mjs`)
- [ ] `.env.local` configurado con secretos únicos
- [ ] Primer usuario ADMIN creado

### 13.3 Configuración

- [ ] Servicio systemd creado y habilitado
- [ ] nginx configurado como reverse proxy
- [ ] Certificado TLS emitido con certbot
- [ ] Firewall UFW configurado (22, 80, 443)
- [ ] Respaldos programados en cron
- [ ] `NEXT_PUBLIC_APP_URL` actualizado a URL pública HTTPS

### 13.4 Verificación

- [ ] `curl http://localhost:3000/login` → HTTP 200
- [ ] Login ADMIN funcional → `/cpanel` accesible
- [ ] Login USER funcional → `/perfil` accesible
- [ ] Registro E2E funcional (archivo subido + correo enviado)
- [ ] URLs de archivos privadas funcionan (200 con sesión, 401 sin sesión)
- [ ] HTTPS activo y válido
- [ ] Build limpio (`npm run build`, `npx tsc --noEmit`, `npm run lint`)

---

## 14. Soporte y Documentación

### 14.1 Documentación del Proyecto

| Documento | Ubicación | Propósito |
|-----------|-----------|-----------|
| `PLAN_DESPLIEGUE.md` | Raíz del proyecto | Guía paso a paso para despliegue |
| `docs/DESIGN.md` | `docs/` | Arquitectura y decisiones técnicas |
| `docs/PROGRESS.md` | `docs/` | Estado de tareas y pendientes |
| `AGENTS.md` | Raíz del proyecto | Comandos y convenciones de código |

### 14.2 Comandos de Soporte

```bash
# Estado del servicio
sudo systemctl status aniei

# Logs en tiempo real
sudo journalctl -u aniei -f

# Reiniciar servicio
sudo systemctl restart aniei

# Estado de migraciones
source /tmp/prod-env.sh && npx prisma migrate status

# Verificar conexiones MySQL
mysql -u aniei -p -e "SHOW STATUS LIKE 'Threads_connected';" aniei

# Espacio en disco
df -h
du -sh /opt/aniei-registro-2026/storage/*
```

---

## 15. Conclusión

**Para un despliegue exitoso en producción (~800 registros totales):**

- **Hardware mínimo:** 1 vCPU, 1 GB RAM, 20 GB SSD
- **Hardware recomendado:** 2 vCPU, 2 GB RAM, 40 GB SSD
- **Software:** Ubuntu 24.04 LTS, Node.js 22.x, MySQL 8.4
- **Red:** nginx + TLS, firewall UFW, MySQL solo localhost
- **Seguridad:** Secretos únicos, `.env.local` protegido, respaldos diarios
- **Costo estimado:** $4-12 USD/mes (VPS) + dominio

**Notas importantes:**

- El sistema está diseñado para ~800 registros totales, no usuarios simultáneos
- Picos esperados de 10-30 usuarios simultáneos durante periodos de registro activo
- Un VPS básico es más que suficiente para este volumen
- La aplicación está optimizada para desplegarse en un solo servidor sin dependencias externas (excepto SMTP para correos)
- Los archivos se almacenan en disco local, simplificando la infraestructura

---

*Documento generado el 2026-09-14. Para dudas sobre arquitectura: `docs/DESIGN.md`. Para guía de despliegue detallada: `PLAN_DESPLIEGUE.md`.*

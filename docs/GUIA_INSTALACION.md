# 🚀 Guía de Instalación y Configuración - Sistema ANIEI

Esta guía detalla los requerimientos y pasos necesarios para levantar el proyecto ANIEI en un entorno de desarrollo local.

---

## 📋 Tabla de Contenidos

1. [Requerimientos del Sistema](#-requerimientos-del-sistema)
2. [Opción A: Instalación con XAMPP (Recomendado)](#-opción-a-instalación-con-xampp-recomendado)
3. [Opción B: Instalación con Docker](#-opción-b-instalación-con-docker)
4. [Opción C: Instalación Manual en Linux](#-opción-c-instalación-manual-en-linux)
5. [Configuración de la Base de Datos](#-configuración-de-la-base-de-datos)
6. [Configuración del Proyecto](#-configuración-del-proyecto)
7. [Verificación de la Instalación](#-verificación-de-la-instalación)
8. [Credenciales de Acceso](#-credenciales-de-acceso)
9. [Solución de Problemas](#-solución-de-problemas)

---

## 📦 Requerimientos del Sistema

### Requerimientos Mínimos

| Componente | Versión Requerida | Notas |
|------------|-------------------|-------|
| **PHP** | 5.6 - 7.4 | ⚠️ No compatible con PHP 8+ |
| **MySQL** | 5.0 - 5.7 | O MariaDB 10.x |
| **Apache** | 2.2+ | Con mod_rewrite habilitado |
| **Sistema Operativo** | Windows/Linux/macOS | Cualquiera con soporte LAMP/WAMP |

### Extensiones PHP Requeridas

```
✅ mysql / mysqli
✅ session
✅ gd (para generación de imágenes)
✅ mbstring
✅ date
```

### Verificar versión de PHP
```bash
php -v
```

### Verificar extensiones instaladas
```bash
php -m | grep -E "mysql|session|gd|mbstring"
```

---

## 🔧 Opción A: Instalación con XAMPP (Recomendado)

### Paso 1: Descargar e Instalar XAMPP

```
┌─────────────────────────────────────────────────────────────┐
│  Descargar XAMPP desde: https://www.apachefriends.org      │
│                                                              │
│  ⚠️ IMPORTANTE: Descargar versión con PHP 7.4 o anterior   │
│     (El proyecto NO es compatible con PHP 8+)               │
│                                                              │
│  Versiones recomendadas:                                    │
│  - XAMPP 7.4.x (PHP 7.4)                                    │
│  - XAMPP 7.3.x (PHP 7.3)                                    │
└─────────────────────────────────────────────────────────────┘
```

**Windows:**
1. Ejecutar el instalador `.exe`
2. Instalar en `C:\xampp`
3. Iniciar XAMPP Control Panel

**Linux:**
```bash
# Descargar (ejemplo con PHP 7.4)
wget https://sourceforge.net/projects/xampp/files/XAMPP%20Linux/7.4.33/xampp-linux-x64-7.4.33-0-installer.run

# Dar permisos de ejecución
chmod +x xampp-linux-x64-7.4.33-0-installer.run

# Instalar (como root)
sudo ./xampp-linux-x64-7.4.33-0-installer.run
```

### Paso 2: Copiar el Proyecto

**Windows:**
```
Copiar carpeta "aniei" a: C:\xampp\htdocs\
Resultado: C:\xampp\htdocs\aniei\
```

**Linux:**
```bash
# Copiar proyecto
sudo cp -r /home/kino/aniei/aniei /opt/lampp/htdocs/

# Dar permisos
sudo chmod -R 755 /opt/lampp/htdocs/aniei
sudo chown -R daemon:daemon /opt/lampp/htdocs/aniei
```

### Paso 3: Iniciar Servicios

**Windows (XAMPP Control Panel):**
- Clic en "Start" para Apache
- Clic en "Start" para MySQL

**Linux:**
```bash
sudo /opt/lampp/lampp start
```

---

## 🐳 Opción B: Instalación con Docker

### Crear archivo `docker-compose.yml`

En la carpeta raíz del proyecto, crear:

```yaml
version: '3.8'

services:
  web:
    image: php:7.4-apache
    container_name: aniei_web
    ports:
      - "8080:80"
    volumes:
      - ./:/var/www/html
    depends_on:
      - db
    environment:
      - APACHE_DOCUMENT_ROOT=/var/www/html

  db:
    image: mysql:5.7
    container_name: aniei_db
    restart: always
    environment:
      MYSQL_ROOT_PASSWORD: root
      MYSQL_DATABASE: aniei_org_mx_rnd2011
      MYSQL_USER: aniei
      MYSQL_PASSWORD: aniei123
    ports:
      - "3306:3306"
    volumes:
      - db_data:/var/lib/mysql
      - ./otros/aniei2008_database.sql:/docker-entrypoint-initdb.d/init.sql

  phpmyadmin:
    image: phpmyadmin/phpmyadmin
    container_name: aniei_phpmyadmin
    restart: always
    ports:
      - "8081:80"
    environment:
      PMA_HOST: db
      MYSQL_ROOT_PASSWORD: root

volumes:
  db_data:
```

### Crear archivo `Dockerfile` (opcional, para extensión mysql)

```dockerfile
FROM php:7.4-apache

# Instalar extensiones necesarias
RUN docker-php-ext-install mysql mysqli pdo pdo_mysql

# Habilitar mod_rewrite
RUN a]2enmod rewrite

# Configurar PHP
RUN echo "short_open_tag = On" >> /usr/local/etc/php/conf.d/custom.ini
```

### Ejecutar Docker

```bash
# Levantar contenedores
docker-compose up -d

# Verificar que estén corriendo
docker-compose ps

# Ver logs si hay errores
docker-compose logs -f
```

### Acceso con Docker

| Servicio | URL |
|----------|-----|
| Aplicación | http://localhost:8080 |
| phpMyAdmin | http://localhost:8081 |

---

## 🐧 Opción C: Instalación Manual en Linux

### Paso 1: Instalar Apache, MySQL y PHP

**Ubuntu/Debian:**
```bash
# Actualizar repositorios
sudo apt update

# Instalar Apache
sudo apt install apache2

# Instalar MySQL
sudo apt install mysql-server mysql-client

# Instalar PHP 7.4 (requiere repositorio especial en Ubuntu 22.04+)
sudo add-apt-repository ppa:ondrej/php
sudo apt update
sudo apt install php7.4 php7.4-mysql php7.4-gd php7.4-mbstring libapache2-mod-php7.4

# Reiniciar Apache
sudo systemctl restart apache2
```

**CentOS/RHEL:**
```bash
# Instalar EPEL y Remi
sudo yum install epel-release
sudo yum install https://rpms.remirepo.net/enterprise/remi-release-7.rpm

# Habilitar PHP 7.4
sudo yum-config-manager --enable remi-php74

# Instalar paquetes
sudo yum install httpd mysql-server php php-mysql php-gd php-mbstring

# Iniciar servicios
sudo systemctl start httpd
sudo systemctl start mysqld
sudo systemctl enable httpd mysqld
```

### Paso 2: Configurar PHP

Editar `/etc/php/7.4/apache2/php.ini`:

```ini
; Habilitar short_open_tag (requerido por el proyecto)
short_open_tag = On

; Zona horaria
date.timezone = America/Mexico_City

; Tamaño de uploads
upload_max_filesize = 10M
post_max_size = 10M
```

### Paso 3: Copiar Proyecto

```bash
# Crear directorio
sudo mkdir -p /var/www/html/aniei

# Copiar archivos
sudo cp -r /home/kino/aniei/aniei/* /var/www/html/aniei/

# Establecer permisos
sudo chown -R www-data:www-data /var/www/html/aniei
sudo chmod -R 755 /var/www/html/aniei

# Reiniciar Apache
sudo systemctl restart apache2
```

---

## 🗄️ Configuración de la Base de Datos

### Paso 1: Acceder a MySQL

```bash
# Como root
mysql -u root -p
```

### Paso 2: Crear Base de Datos y Usuario

```sql
-- Crear la base de datos
CREATE DATABASE aniei_org_mx_rnd2011 
CHARACTER SET latin1 
COLLATE latin1_general_ci;

-- Crear usuario (opcional, puedes usar root)
CREATE USER 'aniei'@'localhost' IDENTIFIED BY 'aniei123';

-- Dar permisos
GRANT ALL PRIVILEGES ON aniei_org_mx_rnd2011.* TO 'aniei'@'localhost';
FLUSH PRIVILEGES;

-- Salir
EXIT;
```

### Paso 3: Importar Estructura y Datos

```bash
# Importar el SQL del proyecto
mysql -u root -p aniei_org_mx_rnd2011 < /var/www/html/aniei/otros/aniei2008_database.sql
```

**O usando phpMyAdmin:**
1. Acceder a http://localhost/phpmyadmin
2. Seleccionar la base de datos `aniei_org_mx_rnd2011`
3. Pestaña "Importar"
4. Seleccionar archivo `otros/aniei2008_database.sql`
5. Clic en "Continuar"

### Paso 4: Verificar Importación

```sql
-- Conectar a la base de datos
USE aniei_org_mx_rnd2011;

-- Ver tablas creadas
SHOW TABLES;

-- Debe mostrar:
-- +--------------------------------+
-- | Tables_in_aniei_org_mx_rnd2011 |
-- +--------------------------------+
-- | accesos                        |
-- | actividades                    |
-- | cargos                         |
-- | costos                         |
-- | depositos                      |
-- | estados                        |
-- | facturaciones                  |
-- | fecha_eventos                  |
-- | inscripciones                  |
-- | instituciones                  |
-- | salas                          |
-- | tipoactividad                  |
-- | usuarios                       |
-- +--------------------------------+
```

---

## ⚙️ Configuración del Proyecto

### Paso 1: Editar Configuración de Base de Datos

Editar el archivo `funciones/configuracion.php`:

```php
<?php
    session_start();
    // ** Configuración de MySQL ** //
    define('DB_NAME', 'aniei_org_mx_rnd2011');    // Nombre de la base de datos
    define('DB_USER', 'root');                     // Usuario MySQL
    define('DB_PASSWORD', '');                     // Contraseña (vacía por defecto en XAMPP)
    define('DB_HOST', 'localhost');               // Servidor (localhost normalmente)
?>
```

**Si usas Docker o credenciales personalizadas:**
```php
<?php
    session_start();
    define('DB_NAME', 'aniei_org_mx_rnd2011');
    define('DB_USER', 'aniei');           // Usuario creado
    define('DB_PASSWORD', 'aniei123');    // Contraseña configurada
    define('DB_HOST', 'db');              // 'db' para Docker, 'localhost' para otros
?>
```

### Paso 2: Configurar PHP para Short Tags

El proyecto usa `<?` en lugar de `<?php`. Verificar que esté habilitado:

**Verificar configuración actual:**
```bash
php -i | grep short_open_tag
```

**Si está deshabilitado, editar php.ini:**
```bash
# Encontrar ubicación de php.ini
php --ini

# Editar (ejemplo en XAMPP Linux)
sudo nano /opt/lampp/etc/php.ini

# Buscar y cambiar:
short_open_tag = On
```

**Reiniciar Apache después de cambios:**
```bash
# XAMPP
sudo /opt/lampp/lampp restart

# Apache nativo
sudo systemctl restart apache2
```

---

## ✅ Verificación de la Instalación

### Lista de Verificación

```
┌─────────────────────────────────────────────────────────────┐
│                 CHECKLIST DE VERIFICACIÓN                    │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  □ Apache está corriendo                                    │
│  □ MySQL está corriendo                                     │
│  □ Base de datos creada e importada                         │
│  □ Archivo configuracion.php actualizado                    │
│  □ short_open_tag = On en php.ini                          │
│  □ Permisos correctos en carpeta del proyecto              │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Probar la Aplicación

1. **Página Principal:**
   ```
   http://localhost/aniei/
   ```
   Debe mostrar la página de bienvenida con opciones de registro.

2. **Panel de Administración:**
   ```
   http://localhost/aniei/cpanel/
   ```
   Debe mostrar el formulario de login.

3. **Verificar conexión a BD (crear archivo de prueba):**

   Crear `test_conexion.php` en la raíz del proyecto:
   ```php
   <?php
   include("funciones/basedatos.php");
   
   $conn = Conectar();
   
   if($conn) {
       echo "✅ Conexión exitosa a la base de datos!<br>";
       
       $result = mysql_query("SELECT COUNT(*) as total FROM usuarios");
       $row = mysql_fetch_assoc($result);
       echo "Total de usuarios: " . $row['total'];
       
       Desconectar($conn);
   } else {
       echo "❌ Error de conexión. Verifica configuracion.php";
   }
   ?>
   ```
   
   Acceder a: `http://localhost/aniei/test_conexion.php`
   
   **⚠️ ELIMINAR este archivo después de probar.**

---

## 🔑 Credenciales de Acceso

### Usuarios de Administración (Panel de Control)

| Usuario | Contraseña | Tipo | Permisos |
|---------|------------|------|----------|
| `root` | `aniei6` | Admin (1) | Acceso completo |
| `admin` | `aniei2007` | Admin (1) | Acceso completo |
| `user` | `user` | Admin (1) | Acceso completo |
| `asistente` | `asistencia` | Admin (1) | Acceso completo |
| `lector` | `pulsera` | Lector (0) | Solo lectura código barras |

### Acceso al Panel

```
URL: http://localhost/aniei/cpanel/
Usuario: admin
Contraseña: aniei2007
```

---

## 🔧 Solución de Problemas

### Error: "Call to undefined function mysql_connect()"

**Causa:** PHP 7+ deprecó `mysql_*`, PHP 8 lo eliminó completamente.

**Solución 1:** Usar PHP 7.4 o anterior.

**Solución 2:** Instalar extensión mysqli y crear wrapper:

Crear archivo `funciones/mysql_compat.php`:
```php
<?php
// Compatibilidad mysql_* para PHP 7+
if (!function_exists('mysql_connect')) {
    function mysql_connect($server, $user, $password) {
        return mysqli_connect($server, $user, $password);
    }
    function mysql_select_db($database, $link) {
        return mysqli_select_db($link, $database);
    }
    function mysql_query($query, $link = null) {
        global $GLOBALS;
        if ($link === null) $link = $GLOBALS['___mysqli_link'];
        return mysqli_query($link, $query);
    }
    function mysql_fetch_array($result, $type = MYSQLI_BOTH) {
        return mysqli_fetch_array($result, $type);
    }
    function mysql_fetch_assoc($result) {
        return mysqli_fetch_assoc($result);
    }
    function mysql_num_rows($result) {
        return mysqli_num_rows($result);
    }
    function mysql_insert_id($link = null) {
        global $GLOBALS;
        if ($link === null) $link = $GLOBALS['___mysqli_link'];
        return mysqli_insert_id($link);
    }
    function mysql_close($link) {
        return mysqli_close($link);
    }
    define('MYSQL_ASSOC', MYSQLI_ASSOC);
    define('MYSQL_BOTH', MYSQLI_BOTH);
}
?>
```

Incluir al inicio de `basedatos.php`:
```php
<?php
include("mysql_compat.php");
// ... resto del código
?>
```

### Error: "Headers already sent"

**Causa:** Hay espacios o caracteres antes de `<?php` o después de `?>`.

**Solución:** Verificar que no haya espacios en blanco al inicio de los archivos PHP.

### Error: Página en blanco

**Causa:** Error PHP oculto.

**Solución:** Habilitar errores temporalmente en `php.ini`:
```ini
display_errors = On
error_reporting = E_ALL
```

O agregar al inicio del archivo PHP:
```php
<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
?>
```

### Error: "Access denied for user"

**Causa:** Credenciales incorrectas en configuracion.php.

**Solución:**
1. Verificar usuario/contraseña en MySQL
2. Actualizar `funciones/configuracion.php`
3. Verificar que el usuario tenga permisos sobre la base de datos

### Caracteres especiales aparecen mal (ñ, á, é, etc.)

**Causa:** Problema de charset (el proyecto usa `latin1`/`iso-8859-1`).

**Solución:** Verificar que la BD usa `latin1_general_ci`:
```sql
ALTER DATABASE aniei_org_mx_rnd2011 
CHARACTER SET latin1 
COLLATE latin1_general_ci;
```

---

## 📁 Estructura de URLs del Sistema

```
┌─────────────────────────────────────────────────────────────┐
│                    MAPA DE URLs                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  PÚBLICO                                                     │
│  ├── /aniei/                    → Página principal          │
│  ├── /aniei/precios.php         → Info precios y registro   │
│  └── /aniei/precios2.php        → Continuar registro        │
│                                                              │
│  ADMINISTRACIÓN (requiere login)                            │
│  ├── /aniei/cpanel/             → Login                     │
│  ├── /aniei/cpanel/panel_control.php → Dashboard            │
│  │                                                           │
│  │   USUARIOS                                                │
│  ├── /aniei/cpanel/usuarios_gestion.php → Listar            │
│  ├── /aniei/cpanel/usuarios_gestion2.php?accion=agregar     │
│  │                                                           │
│  │   ACTIVIDADES                                             │
│  ├── /aniei/cpanel/actividades_gestion.php → Listar         │
│  ├── /aniei/cpanel/actividades_gestion2.php?accion=agregar  │
│  │                                                           │
│  │   INSCRIPCIONES                                           │
│  ├── /aniei/cpanel/inscripcion.php → Inscribir              │
│  ├── /aniei/cpanel/inscripciones_gestion.php → Gestionar    │
│  │                                                           │
│  │   REPORTES                                                │
│  └── /aniei/cpanel/reportes_gestion.php → Generar           │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎯 Comandos Rápidos

### XAMPP Linux
```bash
# Iniciar todos los servicios
sudo /opt/lampp/lampp start

# Detener todos los servicios
sudo /opt/lampp/lampp stop

# Reiniciar
sudo /opt/lampp/lampp restart

# Estado
sudo /opt/lampp/lampp status
```

### Apache Nativo
```bash
# Iniciar
sudo systemctl start apache2

# Detener
sudo systemctl stop apache2

# Reiniciar
sudo systemctl restart apache2

# Ver estado
sudo systemctl status apache2
```

### MySQL
```bash
# Conectar como root
mysql -u root -p

# Importar SQL
mysql -u root -p nombre_bd < archivo.sql

# Exportar/Backup
mysqldump -u root -p nombre_bd > backup.sql
```

---

## 📞 Soporte

Si encuentras problemas adicionales:

1. Revisar logs de Apache:
   - XAMPP: `/opt/lampp/logs/error_log`
   - Apache nativo: `/var/log/apache2/error.log`

2. Revisar logs de MySQL:
   - XAMPP: `/opt/lampp/var/mysql/*.err`
   - MySQL nativo: `/var/log/mysql/error.log`

---

*Guía creada el 31 de enero de 2026*

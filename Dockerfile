FROM php:5.6-apache

# 1. Instalar la extensión mysql antigua (vital para que funcione mysql_connect)
RUN docker-php-ext-install mysql mysqli

# 2. Configurar la Zona Horaria (esto arregla el Warning: date())
# Crea un archivo de configuración .ini directamente
RUN echo "date.timezone = America/Mexico_City" > /usr/local/etc/php/conf.d/timezone.ini

# 3. Habilitar mod_rewrite (necesario para Apache)
RUN a2enmod rewrite
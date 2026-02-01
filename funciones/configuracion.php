<?php
	session_start();
	
	// Cargar variables de entorno
	require_once(__DIR__ . '/env.php');
	
	// ** Configuración de MySQL ** //
	define('DB_NAME', env('DB_NAME', 'aniei_org_mx_rnd2011'));
	define('DB_USER', env('DB_USER', 'aniei'));
	define('DB_PASSWORD', env('DB_PASSWORD', 'aniei123'));
	define('DB_HOST', env('DB_HOST', 'db'));
	
	// ** Configuración de la aplicación ** //
	define('APP_ENV', env('APP_ENV', 'development'));
	define('APP_DEBUG', env('APP_DEBUG', true));
?>
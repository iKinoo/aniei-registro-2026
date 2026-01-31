<?php
/******************************************************************************************/
/*  NOMBRE: basedatos.php                                                                 */
/*  AUTOR: Rodrigo Alejandro Sevilla Blanco                                               */
/*  DESCRIPCIÓN: Este archivo contiene todas las funciones necesarias para ejecutar       */
/*  procedimientos con la base de datos que son usandos en las distintas páginas del      */
/*  Grupo de Osos Yucatecos                                                               */
/*  CREADO: Lunes, 10 de Abril de 2006                                                    */
/*                                                                                        */
/*  MODIFICACIONES:                                                                       */
/******************************************************************************************/
	session_start();
/****************       FUNIONES PARA CONEXION A BASES DE DATOS     ***********************/
	include ("configuracion.php");
	function Conectar(){
		$conn = mysql_connect(DB_HOST,DB_USER,DB_PASSWORD);
		if (!$conn) return 0;
		$link = mysql_select_db(DB_NAME,$conn);
		return $conn;
	}
	
	function Desconectar($conn){
		mysql_close($conn);
	}
?>
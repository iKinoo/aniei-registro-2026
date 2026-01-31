<?php
	// Fecha en el pasado
	header("Expires: Mon, 26 Jul 1997 05:00:00 GMT");
	
	// siempre modificado
	header("Last-Modified: " . gmdate("D, d M Y H:i:s") . " GMT");
	
	// HTTP/1.1
	header("Cache-Control: no-store, no-cache, must-revalidate");
	header("Cache-Control: post-check=0, pre-check=0", false);
	
	// HTTP/1.0
	header("Pragma: no-cache");
	include("../funciones/basedatos.php");
	$conn = Conectar();
	
	if(isset($_GET['username'])){
		$strSQL = "SELECT id_usuario FROM usuarios WHERE username LIKE '".$_GET['usuario']."'";
		$r = mysql_query($strSQL);
		echo mysql_num_rows($r);
	}
	
	if(isset($_GET['correo'])){
		$strSQL = "SELECT correo FROM usuarios WHERE correo LIKE '".$_GET['correo']."'";
		$r = mysql_query($strSQL);
		echo mysql_num_rows($r);
	}
?>
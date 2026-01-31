<?php
	session_start();
	if(!isset($_SESSION['logginuser']) || $_SESSION['logginuser'] != 1){
		header("Location: index.php");
	}
	
	include ("../funciones/basedatos.php");
	$id = $_GET['id'];
	
	$conn = Conectar();
	mysql_Query("BEGIN;");
	
	$strSQL = "DELETE FROM usuarios WHERE id_asistente='".$id."'";
	mysql_query($strSQL);
	$strSQL = "DELETE FROM facturaciones WHERE id_facturacion='".$id."'";
	mysql_query($strSQL);
	$strSQL = "DELETE FROM depositos WHERE id_deposito='".$id."'";
	mysql_query($strSQL);
	//$strSQL = "DELETE FROM actividades WHERE ponente='".$id."'";
	//mysql_query($strSQL);
	$strSQL = "DELETE FROM inscripciones WHERE id_asistente='".$id."'";
	mysql_query($strSQL);
	mysql_query("COMMIT;");
	header("Location: eliminado.php");
	
?>
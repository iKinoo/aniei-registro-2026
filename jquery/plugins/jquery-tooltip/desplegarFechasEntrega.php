<?
	session_start();
	header("Expires: Mon, 26 Jul 1997 05:00:00 GMT");
	header("Last-Modified: " . gmdate("D, d M Y H:i:s") . " GMT");
	header("Cache-Control: no-store, no-cache, must-revalidate");
	header("Cache-Control: post-check=0, pre-check=0", false);
	header("Pragma: no-cache");
	include("../../../funciones/basedatos.php");
	$conn = Conectar();
	$strSQL = "SELECT fecha_entrega_validacion FROM candidatos_fechas_entrega WHERE id_candidatoopcion = '".$_GET['id_candidatoopcion']."' ORDER BY fecha_entrega_validacion DESC, fecha_creacion DESC";
	$reg = mysql_query($strSQL);
?>
<html>
<head>
<link rel="stylesheet" type="text/css" href="css/global.css">
</head>
<body>
<?
if(mysql_num_rows($reg) > 0){
	while($r = mysql_fetch_array($reg, MYSQL_ASSOC)){ ?><p><? echo $r['fecha_entrega_validacion']; ?></p><? }
} else { ?><p align="center">Este candidato no tiene historial.</p><? } ?>
</body>
</html>

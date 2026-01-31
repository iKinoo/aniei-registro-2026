<?php
	session_start();
	if(!isset($_SESSION['logginuser']) || $_SESSION['logginuser'] != 1){
		header("Location: index.php");
	}
	
	include ("../funciones/basedatos.php");
	$conn = Conectar();
	if($_SERVER['REQUEST_METHOD'] == "POST"){
		$strSQL = "SELECT fecha FROM fecha_eventos WHERE id_fecha='".$_POST['fecha_evento']."'";
		$Fecha = mysql_query($strSQL);
		$Fecha = mysql_fetch_array($Fecha);
		$FechaIni = $Fecha[0]." ".$_POST['horaInicio'].":00";
		$FechaFin = $Fecha[0]." ".$_POST['horaFinaliza'].":00";
		if($_POST['ponente2'] == "0"){ $ponente2="";}
		else{ $ponente2=$_POST['ponente2'];}
		if($_POST['ponente3'] == "0"){ $ponente3="";}
		else{ $ponente3=$_POST['ponente3'];}
		$strSQL = "UPDATE  actividades 
				SET nombre='".$_POST['nombre']."',
				tipo='".$_POST['tipo']."',
				ponente='".$_POST['ponente']."',
				ponente2='".$ponente2."',
				ponente3='".$ponente3."',
				cupo='".$_POST['cupo']."',
				hora_inicio='".$FechaIni."',
				hora_final='".$FechaFin."',
				institucion='".$_POST['institucion']."',
				sala='".$_POST['sala']."',
				fecha='".$_POST['fecha_evento']."' 
				WHERE id_actividad='".$_POST['id']."'";
		mysql_query($strSQL);
	}
	Desconectar($conn);
?>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd"><html><!-- InstanceBegin template="/Templates/aniei.dwt.php" codeOutsideHTMLIsLocked="false" -->
<head>
<title>:: ANIEI <? echo date("Y"); ?>::</title>
<meta http-equiv="Content-Type" content="text/html; charset=iso-8859-1" />
<link rel="stylesheet" type="text/css" href="../css/body.css">
<link rel="stylesheet" type="text/css" href="../css/exclusivo.css">
<!-- InstanceBeginEditable name="head" --><!-- InstanceEndEditable -->
</head>
<body bgcolor=#FFFFFF>
<table border="0" align="center" cellpadding="0" cellspacing="0">
	<?php if(isset($_SESSION['logginuser'])) { ?>
	<tr>
		<td width="21">&nbsp;</td>
		<td width="118"><a href="panel_control.php"><img src="../img/inicio.jpg" width=118 height=25 border="0" /></a></td>
		<td width="456">&nbsp;</td>
		<td width="112" class="derecha"><a href="cerrar_sesion.php"><img src="../img/cerrar_sesion.jpg" width=112 height=25 border="0" /></a></td>
		<td width="10">&nbsp;</td>
	</tr>
	<?php } ?>
	<tr>
		<td><img src="../img/borde_sup_izq.jpg" width=21 height=18 /></td>
		<td style="background-repeat:repeat-x" background="../img/borde_sup.jpg" colspan=3><img src="../img/borde_sup.jpg" width=686 height=18 /></td>
		<td><img src="../img/borde_sup_der.jpg" width=22 height=18 /></td>
	</tr>
	<tr>
		<td><img src="../img/borde_izq1.jpg" width=21 height=165 /></td>
		<td style="background-repeat:repeat-x"  background="../img/linea0.jpg" colspan=3><img src="../img/logo.jpg" width=686 height=165 /></td>
		<td><img src="../img/borde_der1.jpg" width=22 height=165 /></td>
	</tr>
	<tr>
		<td background="../img/borde_izq2.jpg">&nbsp;</td>
		<td height="350" colspan=3 valign="top" bgcolor="#FFFFFF"><!-- InstanceBeginEditable name="ContenidoAniei" -->
		<p align="center" class="centrar">&nbsp;</p>
		<p align="center" class="centrar"><b>XXI Congreso Nacional y VII Congreso Internacional de Inform&aacute;tica y Computaci&oacute;n<br>
			24 al 26 de octubre de 2007</b></p>
		<p align="center" class="centrar"><b>Monterrey, Nuevo Le&oacute;n, M&eacute;xico</b></p>
		<p class="centrar">&nbsp;</p>
<p class="centrar">La actividad se ha actualizado satisfactoriamente.</p>
<p class="centrar">&nbsp;</p>
<p class="centrar"><a href="actividades_gestion.php">Regresar</a></p>
<!-- InstanceEndEditable --></td>
		<td background="../img/borde_der2.jpg">&nbsp;</td>
	</tr>
	<tr>
		<td><img src="../img/borde_inf_izq.jpg" width=21 height=16 /></td>
		<td style="background-repeat:repeat-x" background="../img/borde_inf.jpg" colspan=3><img src="../img/borde_inf.jpg" width=686 height=16 /></td>
		<td><img src="../img/borde_inf_der.jpg" width=22 height=16 /></td>
	</tr>
	<tr>
		<td></td>
		<td colspan=3><p class="PiePagina">ANIEI&reg; <? echo date("Y"); ?> </p></td>
		<td></td>
	</tr>
</table>
</body>
<!-- InstanceEnd --></html>


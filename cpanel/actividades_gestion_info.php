<?php 
	session_start();
	if(!isset($_SESSION['logginuser']) || $_SESSION['logginuser'] != 1){
		header("Location: index.php");
	}
	include("../funciones/funciones.php");
	include ("../funciones/basedatos.php"); $conn = Conectar();
	$strSQL = "SELECT a.nombre, a.cupo, a.hora_inicio, a.hora_final, a.institucion, s.nombre AS 'sala', s.ubicacion, ta.descripcion AS 'tipoactividad', fe.fecha, 
					concat( u.nombre, ' ', u.apellido ) AS 'ponente1', 
					concat( u2.nombre, ' ', u2.apellido ) AS 'ponente2', 
					concat( u3.nombre, ' ', u3.apellido ) AS 'ponente3'
				FROM actividades a
				INNER JOIN salas s ON s.id_sala = a.id_sala
				INNER JOIN tipoactividad ta ON ta.id_tipoactividad = a.id_tipoactividad
				LEFT JOIN usuarios u ON u.id_usuario = a.id_ponente
				LEFT JOIN usuarios u2 ON u2.id_usuario = a.id_ponente2
				LEFT JOIN usuarios u3 ON u3.id_usuario = a.id_ponente3
				INNER JOIN fecha_eventos fe ON fe.id_fechaevento = a.id_fechaevento
				WHERE id_actividad = '".$_GET['id_actividad']."'";
	$reg = mysql_query($strSQL);
	$a = mysql_fetch_array($reg, MYSQL_ASSOC);
?>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd"><html><!-- InstanceBegin template="/Templates/aniei.dwt.php" codeOutsideHTMLIsLocked="false" -->
<head>
<title>:: ANIEI <? echo date("Y"); ?>::</title>
<meta http-equiv="Content-Type" content="text/html; charset=iso-8859-1" />
<link rel="stylesheet" type="text/css" href="../css/body.css">
<link rel="stylesheet" type="text/css" href="../css/exclusivo.css">
<!-- InstanceBeginEditable name="head" -->
<!-- InstanceEndEditable -->
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


<p align="center">&nbsp;</p>
  <table border="0" align="center" cellpadding="2" cellspacing="10"> 
  	<tr><td><b>Informaci&oacute;n de la Actividad</b></td></tr> 
  	<tr> 
  		<td><p><i>Nombre de la actividad:<br></i>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<?php echo $a['nombre']; ?></p></td> 
    </tr> 
  	<tr> 
  		<td><p><i>Tipo:</i><br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<? echo $a['tipoactividad']; ?></p></td> 
	</tr>
  	<tr> 
  		<td><p><i>Ponente(s):</i><br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<?php echo $a['ponente1']; ?></p></td>
    </tr> 
  	<tr> 
  		<td><p><i>Cupo m&aacute;ximo:</i><br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<?php echo $a['cupo']; ?> usuarios </p></td> 
    </tr>
  	<tr>
  		<td><p><i>Instituci&oacute;n:</i><br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; <?php echo $a['institucion']; ?></p></td>
    </tr>
  	<tr>
  		<td><p><i>Sala:</i><br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<?php echo $a['sala']." - ".$a['ubicacion']; ?></p></td>
    </tr>
  	<tr>
  		<td><p><i>D&iacute;a de la actividad:</i><br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<?php echo FormatoFechaFrase2($a['fecha']); ?></p></td>
	</tr>
  	<tr>
  		<td><p><i>Hora de Inicio:</i><br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; <?php echo $a['hora_inicio'];; ?></p></td>
    </tr>
  	<tr>
  		<td><p><i>Hora de Finalizaci&oacute;n:</i><br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; <?php echo $a['hora_final']; ?> </p></td>
    </tr> 
  	</table>
  <p>&nbsp;</p>
  <table border="0" align="center" cellpadding="5" cellspacing="0">
  	<tr>
  		<td colspan="3"><b>Usuarios Inscritos a la Actividad </b></td>
		</tr>
  	<tr>
  		<?php
		$i = 1;
		$strSQL = "SELECT * FROM inscripciones i, usuarios u WHERE i.id_actividad='".$id."' AND i.id_usuario = u.id_usuario";
		$b = mysql_query($strSQL);
		while($c = mysql_fetch_array($b)){?>
  		<td valign="middle"><?php echo $i.". ".$c['nombre']." ".$c['apellido']; $i++; ?></td>		
			<td class="centrar"><a href="usuarios_gestion2.php?id=<?php echo $c['id_usuario']; ?>" title="Editar"><img src="../img/b_usredit.png" width="16" height="16" border="0"></a></td>
			<td class="centrar"><a href="eliminarUsuario.php?id=<?php echo $c['id_usuario']; ?>" title="Eliminar"><img src="../img/b_usrdrop.png" width="16" height="16" border="0"></a></td>
		<?php } ?>
  		</tr>
	</table>
  <p>&nbsp;</p>
  <p align="center" class="centrar"><a href="actividades_gestion.php">Regresar</a></p>
  <input name="id" type="hidden" value="<?php echo $id; ?>">
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
<?php Desconectar($conn); ?>
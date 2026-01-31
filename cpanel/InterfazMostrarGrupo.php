<?php
	session_start();
	if(!isset($_SESSION['logginuser']) || $_SESSION['logginuser'] != 1){
		header("Location: index.php");
	}
	 include ("../funciones/basedatos.php"); $conn = Conectar();
	 $id=$_GET['id'];
	 $strSQL = "SELECT * FROM usuarios WHERE id_asistente='".$id."'";
	 $g = mysql_query($strSQL);
	 $g = mysql_fetch_array($g,MYSQL_ASSOC);
	 if(isset($_GET['eliminar'])){
	 	$strSQL = "DELETE FROM grupos WHERE id='".$_GET['eliminar']."'";
		mysql_query($strSQL);
	 }
?>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd"><html><!-- InstanceBegin template="/Templates/aniei.dwt.php" codeOutsideHTMLIsLocked="false" -->
<head>
<title>:: ANIEI <? echo date("Y"); ?>::</title>
<meta http-equiv="Content-Type" content="text/html; charset=iso-8859-1" />
<link rel="stylesheet" type="text/css" href="../css/body.css">
<link rel="stylesheet" type="text/css" href="../css/exclusivo.css">
<!-- InstanceBeginEditable name="head" -->


<link href="../css/exclusivo.css" rel="stylesheet" type="text/css">
<script language="javascript" src="../js/validaciones.js" type="text/javascript"></script>
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
			<p>&nbsp;</p>
			<table width="400" align="center" cellpadding="2">
		
		<tr>
			<td><b>Informaci&oacute;n del responsable </b></td>
			</tr>
		<tr>
			<td><i>Nombre:</i><br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; <?php echo $g['titulo']; ?> <?php echo $g['nombre']; ?> <?php echo $g['apellido']; ?></td>
			</tr> 


                  

			<td><i>Tipo:</i><br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
				<?php
				$strSQL = "SELECT t.descripcion FROM tipousuario t, usuarios u WHERE t.id_tipo=u.tipo AND u.id_asistente='".$id."'";
				$tipos = mysql_query($strSQL);
				$tipos =  mysql_fetch_array($tipos);
				echo $tipos['descripcion'];?>			</td> 
      	</tr>
		<tr>
			<td><i>Cargo:</i><br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
				<?php
				$strSQL = "SELECT c.descripcion FROM cargos c, usuarios u WHERE u.id_asistente='".$id."' AND c.id_cargo=u.cargo";
				$tipos = mysql_query($strSQL);
				$tipos =  mysql_fetch_array($tipos);
				echo $tipos['descripcion']; ?>			</td>
			</tr>
		<tr>
			<td><i>T&iacute;tulo profesional: </i><br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<?php echo $g['carrera']; ?></td>
			</tr>
		<tr>
			<td><i>Nombre de Instituci&oacute;n: </i><br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<?php echo $g['institucion']; ?></td>
			</tr>
		<tr>
			<td><i>Campus, Facultad o Plantel: </i><br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<?php echo $g['dependencia']; ?></td>
			</tr>
		<tr>
			<td><i>Entidad Federativa:</i> <br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
				<?php
				$strSQL = "SELECT e.nombre FROM estados e, usuarios u WHERE u.id_asistente='".$id."' AND e.id_estado=u.estado";
				$tipos = mysql_query($strSQL);
				$tipos =  mysql_fetch_array($tipos);
				echo $tipos['nombre']; ?></td>
		</tr>
		<tr>
			<td><i>Correo electr&oacute;nico:</i><br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; <?php echo $g['correo']; ?> </td>
				</tr>
		<tr>
			<td><i>N&uacute;mero telef&oacute;nico: </i><br>
				&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<?php if($g['telefono']!="") {echo $g['lada']."-".$g['telefono']." (EXT ".$g['extension'].")";} ?></td>
				</tr>
		<tr>
			<td>&nbsp;</td>
		</tr>
		<tr>
			<td><b> Informaci&oacute;n del grupo</b></td>
				</tr>
		<tr>
			<td><table align="center" cellpadding="3" cellspacing="0">
				
				<?php
			  $strSQL = "SELECT * FROM usuarios WHERE padre='".$id."' ORDER BY apellido, nombre ASC";
			  $g = mysql_query($strSQL);
			  $n = mysql_num_rows($g);
			  $i = 1;
			  // Imprimimos los inscritos
			  while($gg = mysql_fetch_array($g, MYSQL_ASSOC)) { ?>
				<tr>
					<td><?php echo $i; ?></td>
					<td><?php echo $gg['nombre']; ?> <?php echo $gg['apellido']; ?> </td>
					</tr>
				<?php $i++; } ?>
				</table></td>
				</tr>
		<tr>
			<td>&nbsp;</td>
		</tr>
		<tr>
			<td><b>Informaci&oacute;n para facturar (s&oacute;lo si requiere factura, proporcione todos los siguientes datos) </b></td>
				</tr>
		<?php 
				$strSQL = "SELECT * FROM facturaciones WHERE id_facturacion='".$id."'";
				$g = mysql_query($strSQL);
				$g = mysql_fetch_array($g, MYSQL_ASSOC);
			?>
		<tr>
			<td><i>RFC:</i> <i> <?php echo $g['rfc']; ?></i></td>
				</tr>
		<tr>
			<td><i>Raz&oacute;n social: <?php echo $g['razon']; ?></i></td>
				</tr>
		<tr>
			<td><p><b>Direcci&oacute;n Fiscal</b></p></td>
				</tr>
		<tr>
			<td><i>Calle: <?php echo $g['calle']; ?></i></td>
				</tr>
		<tr>
			<td><i>N&uacute;mero exterior:</i> <?php echo $g['exterior']; ?><br>
				<i>N&uacute;mero interior:</i> <?php echo $g['interior']; ?></td>
				</tr>
		<tr>
			<td><i>Colonia: <?php echo $g['colonia']; ?></i></td>
				</tr>
		<tr>
			<td><i>Delegacion / Municipio: <?php echo $g['municipio']; ?></i></td>
				</tr>
		<tr>
			<td><i>Estado:</i> 
				<?php
						$strSQL = "SELECT e.nombre FROM estados e, usuarios u WHERE u.id_asistente='".$id."' AND e.id_estado=u.estado";
						$tipos = mysql_query($strSQL);
						$tipos =  mysql_fetch_array($tipos);
						echo $tipos['nombre']; ?></td>
				</tr>
		<tr>
			<td><i>CP:</i> <?php echo $g['codigo']; ?></td>
		</tr>
		<tr>
			<td>&nbsp;</td>
		</tr>
		<tr>
			<td><b> Informaci&oacute;n de dep&oacute;sito bancario (s&oacute;lo si ha realizado el pago) </b></td>
				</tr>
		<?php 
				$strSQL = "SELECT * FROM depositos WHERE id_deposito='".$id."'";
				$g = mysql_query($strSQL);
				$g = mysql_fetch_array($g, MYSQL_ASSOC);
			?>
		<tr>
			<td><i>Ciudad donde se realiz&oacute; el dep&oacute;sito: <?php echo $g['ciudad']; ?></i></td>
				</tr>
		<tr>
			<td><i>N&uacute;mero de sucursal: <?php echo $g['sucursal']; ?></i></td>
				</tr>
		<tr>
			<td><i>Fecha: <?php echo $g['fecha']; ?> (dd/mm/aa)</i></td>
				</tr>
		<tr>
			<td><i>Hora: <?php echo $g['hora']; ?> (hh:mm horas)</i></td>
				</tr>
		<tr>
			<td><i>N&uacute;mero de referencia: <?php echo $g['referencia']; ?></i></td>
				</tr>
		<tr>
			<td><i>Monto:</i> </td>
			</tr>
	</table>
	<p align="center" class="centrar">
	<input name="regresar" type="button" id="regresar" value="Regresar" onClick="javascript:location.href='InterfazEdicionGrupo.php';">
	</p>
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

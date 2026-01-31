<?php
	session_start();
	if(!isset($_SESSION['logginuser']) || $_SESSION['logginuser'] != 1){
		header("Location: index.php");
	}
	
	include("../funciones/basedatos.php");
	$conn = Conectar();
?><!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd"><html><!-- InstanceBegin template="/Templates/aniei.dwt.php" codeOutsideHTMLIsLocked="false" -->
<head>
<title>:: ANIEI <? echo date("Y"); ?>::</title>
<meta http-equiv="Content-Type" content="text/html; charset=iso-8859-1" />
<link rel="stylesheet" type="text/css" href="../css/body.css">
<link rel="stylesheet" type="text/css" href="../css/exclusivo.css">
<!-- InstanceBeginEditable name="head" -->
<script language="JavaScript" type="text/javascript">	
	function Ventana(){
		// Propiedades para que la ventana se centre y ocupe el 50% del área de la pantalla
		var alto = screen.height/2;
		var ancho = screen.width/2;
		var top = (screen.height - alto)/2;
		var left = (screen.width - ancho)/2;
		
		var cosas = 'fullscreen=no, top='+top+', left='+left+', toolbar=no, menubar=no, status=yes, scrollbars=yes, resizable=yes, height='+alto+', width='+ancho;
		var url = 'reportes_gestion_buscarUser.php';
		var oy=window.open(url,'Buscar',cosas);
	}
	
	function selecciona(opc){
		document.getElementById("opcion" + opc).checked = true;
	}
</script>
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
			<h1>Reportes</h1>
			<form name="form1" method="post" action="pdf.php">
				<table border="0" align="center" cellpadding="10" cellspacing="0">
					<tr>
						<td valign="middle"><p onClick="selecciona(1);" class="manita"><input name="opcion" id="opcion1" type="radio" value="1">
							Imprimir una constancia de
							<input name="nombre" type="text" id="nombre" size="50" maxlength="30" disabled="disabled" />
							<input name="Buscar" type="button" id="Buscar" value="Buscar" onClick="Ventana()" />
							<input name="id_asistente" type="hidden" id="id_asistente" />
							<input name="id_usuario" type="hidden" id="id_usuario" />
							<input name="id_actividadUsuario" type="hidden" id="id_actividadUsuario">
						</p></td>
					</tr>
					<tr>
						<td valign="middle"><p onClick="selecciona(2);" class="manita"><input name="opcion" id="opcion2" type="radio" value="2">
							Imprimir conjunto de constancias de una actividad:<br> 
							<select name="id_actividad" size="6" id="id_actividad" style="border:none; width:700px;" onFocus="selecciona('2');">
							<? $strSQL = "SELECT a.id_actividad, a.nombre, a.id_ponente, u.titulo, u.nombre AS unombre, u.apellido
											FROM actividades a
											LEFT JOIN usuarios u ON a.id_ponente = u.id_usuario
											ORDER BY a.nombre";
								$reg = mysql_query($strSQL);
								if(mysql_num_rows($reg) > 0){
								while($r = mysql_fetch_array($reg, MYSQL_ASSOC)){ ?>
								<option value="<? echo $r['id_actividad']; ?>" title="<? echo $r['nombre']; ?>"><? echo $r['nombre']; ?></option><? echo "\n"; } } ?>
							</select></p></td>
					</tr>
					<tr><td valign="middle"><p onClick="selecciona(3);" class="manita"><input name="opcion" id="opcion3" type="radio" value="3">Cantidad de participantes por actividad</p></td></tr>
					<tr><td valign="middle"><p onClick="selecciona(4);" class="manita"><input name="opcion" type="radio" id="opcion4" value="4" disabled="disabled">
					Cantidad de participantes por d&iacute;a</p></td></tr>
					<tr><td valign="middle"><p onClick="selecciona(5);" class="manita"><input name="opcion" id="opcion5" type="radio" value="5">Cantidad de participantes por estado</p></td></tr>
					<tr><td valign="middle"><p <? // onClick="selecciona(6);" ?> class="manita"><input name="opcion" id="opcion6" type="radio" value="6" disabled="disabled">Cantidad de participantes por instituci&oacute;n</p></td></tr>
					<tr><td valign="middle"><p onClick="selecciona(7);" class="manita"><input name="opcion" id="opcion7" type="radio" value="7">Cantidad de participantes por g&eacute;nero</p></td></tr>
					<tr><td valign="middle"><p <? //onClick="selecciona(8);" ?> class="manita"><input name="opcion" id="opcion8" type="radio" value="8" disabled="disabled">Cantidad de participantes que facturaron<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<input name="detalles" type="checkbox" id="detalles" value="1" disabled="disabled"><span onClick="document.getElementById('detalles').checked = !document.getElementById('detalles').checked; ?>">Impresi&oacute;n detallada de las facturaciones</span></p></td></tr>
				</table>
				<p class="centrar"><input type="submit" name="Submit" value="Generar reporte"></p>
				<p class="centrar">&nbsp;</p>
				<p class="centrar"><a href="panel_control.php">Regresar</a></p>
				<p>&nbsp;</p>
			</form>
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
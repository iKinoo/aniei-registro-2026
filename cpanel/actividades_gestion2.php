<?php 
	session_start();
	if(!isset($_SESSION['logginuser']) || $_SESSION['logginuser'] != 1){
		header("Location: index.php");
	}
	
	include ("../funciones/basedatos.php");
	$conn = Conectar();
	if($_SERVER['REQUEST_METHOD'] == "POST"){
		if($_POST['accion'] == "agregar"){
			$strSQL = "SELECT fecha FROM fecha_eventos WHERE id_fecha='".$_POST['fecha_evento']."'";
			$Fecha = mysql_query($strSQL);
			$Fecha = mysql_fetch_array($Fecha);
			$FechaIni = $Fecha[0]." ".$_POST['horaInicio'].":00";
			$FechaFin = $Fecha[0]." ".$_POST['horaFinaliza'].":00";
			if($_POST['ponente2'] == "0"){ $ponente2 = ""; } else { $ponente2 = $_POST['ponente2']; }
			if($_POST['ponente3'] == "0"){ $ponente3 = ""; } else { $ponente3 = $_POST['ponente3']; }
			$strSQL = "INSERT INTO actividades VALUES(null,'".$_POST['nombre']."','".$_POST['tipo']."','".$_POST['ponente']."','".$ponente2."','".$ponente3."','".$_POST['cupo']."','0','".$FechaIni."','".$FechaFin."','".$_POST['institucion']."','".$_POST['sala']."','".$_POST['fecha_evento']."')";
			mysql_query($strSQL);
		}
		
		if($_POST['accion'] == "modificar"){
			$strSQL = "SELECT fecha FROM fecha_eventos WHERE id_fechaevento='".$_POST['fecha_evento']."'";
			$Fecha = mysql_query($strSQL);
			$Fecha = mysql_fetch_array($Fecha);
			$FechaIni = $Fecha[0]." ".$_POST['horaInicio'].":00";
			$FechaFin = $Fecha[0]." ".$_POST['horaFinaliza'].":00";
			if($_POST['ponente2'] == "0"){ $ponente2="";}
			else{ $ponente2=$_POST['ponente2'];}
			if($_POST['ponente3'] == "0"){ $ponente3="";}
			else{ $ponente3=$_POST['ponente3'];}
			$strSQL = "UPDATE  actividades 
					SET nombre = '".$_POST['nombre']."',
					id_tipoactividad = '".$_POST['tipo']."',
					id_ponente = '".$_POST['ponente']."',
					id_ponente2 = '".$ponente2."',
					id_ponente3 = '".$ponente3."',
					cupo = '".$_POST['cupo']."',
					hora_inicio = '".$FechaIni."',
					hora_final = '".$FechaFin."',
					institucion = '".$_POST['institucion']."',
					id_sala = '".$_POST['sala']."',
					id_fechaevento = '".$_POST['fecha_evento']."' 
					WHERE id_actividad = '".$_POST['id_actividad']."'";
			mysql_query($strSQL);
		}
	}
	
	if($_GET['accion'] == "modificar"){
		$strSQL = "SELECT * FROM actividades WHERE id_actividad='".$_GET['id_actividad']."'";
		$a = mysql_query($strSQL);
		$a = mysql_fetch_array($a);
	}
?>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd"><html><!-- InstanceBegin template="/Templates/aniei.dwt.php" codeOutsideHTMLIsLocked="false" -->
<head>
<title>:: ANIEI <? echo date("Y"); ?>::</title>
<meta http-equiv="Content-Type" content="text/html; charset=iso-8859-1" />
<link rel="stylesheet" type="text/css" href="../css/body.css">
<link rel="stylesheet" type="text/css" href="../css/exclusivo.css">
<!-- InstanceBeginEditable name="head" -->
<link rel="stylesheet" type="text/css" href="../css/formulario.css">
<script language="JavaScript" src="../js/funciones.js" type="text/javascript"></script>
<script language="JavaScript" type="text/javascript">
	function Validar(f){
		if( !ValidaForm(f) ){ return false; }
		
		var cupo = document.getElementById("cupo*");
		if(isNaN(cupo.value)){
			alert("El cupo máximo no es un valor numérico.");
			cupo.select();
			cupo.focus();
			return false;
		} else {
			if(cupo.value.search(/^(?:\+|-)?\d+$/i)){
				alert("El formato de número es incorrecto para el cupo.");
				cupo.select();
				cupo.focus();
				return false;
			}
		}
		
		var horaInicio = document.getElementById("horaInicio*");
		if(horaInicio.value.search(/^(0*[1-9]|1\d|2[0-3]):([0-5]\d)$/i)){
			alert("El formato de hora de inicio es incorrecto.");
			horaInicio.select();
			horaInicio.focus();
			return false;
		}
		
		var horaFinaliza = document.getElementById("horaFinaliza*");
		if(horaFinaliza.value.search(/^(0*[1-9]|1\d|2[0-3]):([0-5]\d)$/i)){
			alert("El formato de hora de finalización es incorrecto.");
			horaFinaliza.select();
			horaFinaliza.focus();
			return false;
		}
		
		if(horaInicio.value != "" && horaFinaliza.value != ""){
		  	var arreglo1 = horaInicio.value.split(":");
			var arreglo2 = horaFinaliza.value.split(":");
			var tiempo1 = parseInt(arreglo1[0])*60+parseInt(arreglo1[1]);
			var tiempo2 = parseInt(arreglo2[0])*60+parseInt(arreglo2[1]);
			if( tiempo1 > tiempo2 ){
				alert("La hora de finalizacion debe ser mayor que la de inicio");
				horaFinaliza.select();
				horaFinaliza.focus();
				return false;
			}
		}
		return ValidaForm(f);
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
<? if($_SERVER['REQUEST_METHOD'] == "POST"){ ?>
<p>&nbsp;</p>
<p align="center" class="centrar"><b>XXI Congreso Nacional y VII Congreso Internacional de Inform&aacute;tica y Computaci&oacute;n<br>24 al 26 de octubre de 2007</b></p>
<p align="center" class="centrar"><b>Monterrey, Nuevo Le&oacute;n, M&eacute;xico</b></p>
<p>&nbsp;</p>
<? if($_POST['accion'] == "agregar"){ ?><h3 class="centrar"><b>Actividad agregada.</b></h3><? } ?>
<? if($_POST['accion'] == "modificar"){ ?><h3 class="centrar">La actividad se ha actualizado satisfactoriamente.</h3><? } ?>
<p>&nbsp;</p>
<p class="centrar"><a href="<? echo $_SERVER['../PHP_SELF']; ?>?accion=agregar">Agregar otra actividad</a> | <a href="actividades_gestion.php">Ver actividades </a></p>
<? } else { ?>
<form action="<? echo $_SERVER['PHP_SELF']; ?>" method="post" name="actividad" id="actividad" onSubmit="return Validar(this);"> 
  <table border="0" align="center" cellpadding="10" cellspacing="0"> 
    <tr>
      <td colspan="3" bgcolor="#F3F3F3"><p class="centrar"><b>Los campos indicados con asterisco (*) son obligatorios.</b><br>
      	<b>Llene el formato utilizando may&uacute;sculas y min&uacute;sculas.</b><br>
      	<b>El d&iacute;a del evento deber&aacute; traer la copia del dep&oacute;sito bancario. </b></p></td>
    </tr>
    <tr> 
      <td colspan="3"><p><b>Informaci&oacute;n de la Actividad </b></p></td> 
    </tr> 
    <tr> 
      <td align="right"><p>Nombre de la actividad*</p></td> 
      <td>&nbsp;</td> 
      <td><table> 
          <tr>
		  	<td> <input name="nombre" id="nombre*" type="text" value="<?php echo $a['nombre']; ?>" size="50" maxlength="200" alt="Olvidaste escribir el nombre de la actividad." /> </td> 
          </tr>
        </table></td> 
    </tr> 
    <tr> 
      <td align="right"><p>Tipo<b>*</b></p></td> 
      <td>&nbsp;</td> 
      <td>
      	<select name="tipo" class="select" id="tipo*" alt="Debes seleccionar un tipo de actividad.">
		<option value="0">[SELECCIONE UNA OPCION]</option>
	<?php
		$strSQL = "SELECT * FROM tipoactividad";
		$tipos = mysql_query($strSQL);
		while($tipo = mysql_fetch_array($tipos, MYSQL_ASSOC)){ ?>
			<option value="<?php echo $tipo['id_tipo'];?>" <?php if($tipo['id_tipo']==$a['tipo']) echo "SELECTED"; ?>><?php echo $tipo['descripcion']; ?></option>
	<?php } ?>
      	</select>      </td> 
    </tr> 
     
    <tr> 
      <td align="right"><p>Ponente* </p></td> 
      <td>&nbsp;</td> 
      <td>
      	<select name="ponente" class="select" id="ponente*" alt="Debes seleccionar al ponente de la actividad.">
		<option value="0">[SELECCIONE UNA OPCION]</option>
	<?php
		$strSQL = "SELECT id_usuario, titulo, nombre, apellido FROM usuarios WHERE id_tipo=5 OR id_tipo=4 ORDER BY apellido, nombre"; // 9 = PONENTE
		$tipos = mysql_query($strSQL);
		while($tipo = mysql_fetch_array($tipos, MYSQL_ASSOC)){ 
			$nombre = $tipo['apellido']." ".$tipo['nombre']." ".$tipo['titulo']; ?>
			<option value="<?php echo $tipo['id_usuario'];?>" <?php if($tipo['id_usuario']==$a['id_ponente']) echo "SELECTED"; ?>><?php echo $nombre; ?></option>
	<?php } ?>
      	</select>      </td>
    </tr>
    <tr>
		<td align="right"><p>Ponente 2 </p></td>
    	<td>&nbsp;</td>
    	<td><select name="ponente2" class="select" id="ponente2">
				<option value="0">[SELECCIONE UNA OPCION]</option>
				<?php
		$strSQL = "SELECT id_usuario, titulo, nombre, apellido FROM usuarios WHERE id_tipo=5 OR id_tipo=4 ORDER BY apellido, nombre"; // 9 = PONENTE
		$tipos = mysql_query($strSQL);
		while($tipo = mysql_fetch_array($tipos, MYSQL_ASSOC)){ 
			$nombre = $tipo['apellido']." ".$tipo['nombre']." ".$tipo['titulo']; ?>
				<option value="<?php echo $tipo['id_usuario'];?>" <?php if($tipo['id_usuario']==$a['id_ponente2']) echo "SELECTED"; ?>><?php echo $nombre; ?></option>
				<?php } ?>
		</select></td>
    	</tr>
    <tr>
		<td align="right"><p>Ponente 3 </p></td>
    	<td>&nbsp;</td>
    	<td><select name="ponente3" class="select" id="ponente3">
				<option value="0">[SELECCIONE UNA OPCION]</option>
				<?php
		$strSQL = "SELECT id_usuario, titulo, nombre, apellido FROM usuarios WHERE id_tipo=5 OR id_tipo=4 ORDER BY apellido, nombre"; // 9 = PONENTE
		$tipos = mysql_query($strSQL);
		while($tipo = mysql_fetch_array($tipos, MYSQL_ASSOC)){ 
			$nombre = $tipo['apellido']." ".$tipo['nombre']." ".$tipo['titulo']; ?>
				<option value="<?php echo $tipo['id_usuario'];?>" <?php if($tipo['id_usuario']==$a['id_ponente3']) echo "SELECTED"; ?>><?php echo $nombre; ?></option>
				<?php } ?>
		</select></td>
    	</tr> 
    <tr> 
      <td align="right"><p>Cupo m&aacute;ximo*<b></b></p></td> 
      <td>&nbsp;</td> 
      <td><input name="cupo" type="text" id="cupo*" alt="Olvidaste especificar el cupo máximo de esta actividad." value="<?php echo $a['cupo']; ?>" size="4" maxlength="3" /></td> 
    </tr>
    <tr>
    	<td align="right"><p>Instituci&oacute;n</p></td>
    	<td>&nbsp;</td>
    	<td><input name="institucion" type="text" id="institucion" value="<?php echo $a['institucion']; ?>" size="50" maxlength="100"></td>
    	</tr>
    <tr>
    	<td align="right"><p>Sala</p></td>
    	<td>&nbsp;</td>
    	<td><select name="sala" class="select" id="sala">
		<option value="0">[SELECCIONE UNA OPCION]</option>
		<?php
		$strSQL = "SELECT * FROM salas"; // 9 = PONENTE
		$salas = mysql_query($strSQL);
		while($sala = mysql_fetch_array($salas, MYSQL_ASSOC)){ ?>
		<option value="<?php echo $sala['id_sala'];?>" <?php if($sala['id_sala']==$a['id_sala']) echo "SELECTED"; ?>><?php echo $sala['nombre']." - ".$sala['ubicacion']; ?></option>
		<?php } ?>
	</select></td>
    </tr>
    <?php 
    	list($fecha,$HoraI) = split(" ",$a['hora_inicio']);
	list($fecha,$HoraF) = split(" ",$a['hora_final']);
	$fecha = split("-",$fecha);
	$fecha = $fecha[2]."/".$fecha[1]."/".$fecha[0];
	$HoraI = substr($HoraI,0,5);
	$HoraF = substr($HoraF,0,5);
	
    ?>
    <tr>
    	<td align="right"><p>D&iacute;a de la actividad* </p></td>
    	<td>&nbsp;</td>
    	<td><select name="fecha_evento" class="select" id="fecha_evento*" alt="Debes especificar la fecha en que se impartirá esta actividad.">
		<option value="0">[SELECCIONE UNA OPCION]</option>
		<?php
		$strSQL = "SELECT * FROM fecha_eventos"; 
		$fechas = mysql_query($strSQL);
		while($fecha = mysql_fetch_array($fechas, MYSQL_ASSOC)){ 
			list($anio, $mes, $dia) = split("-",$fecha['fecha']);
			$ffff = $dia."/".$mes."/".$anio; ?>
		<option value="<?php echo $fecha['id_fechaevento'];?>" <?php if($fecha['id_fechaevento']==$a['id_fechaevento']) echo "SELECTED"; ?>><?php echo $ffff; ?></option>
		<?php } ?>
	</select></td>
    	</tr>
    <tr>
    	<td align="right"><p>Hora de Inicio*</p></td>
    	<td>&nbsp;</td>
    	<td><p>
    		<input name="horaInicio" type="text" id="horaInicio*" alt="Olvidaste especificar la hora de inicia de la actividad." value="<?php echo $HoraI; ?>" size="6" maxlength="5" /> 
    		(hh:mm. Ejemplo 08:00, 15:30)</p></td>
    </tr>
    <tr>
    	<td align="right"><p>Hora de Finalizaci&oacute;n* </p></td>
    	<td>&nbsp;</td>
    	<td><p>
    		<input name="horaFinaliza" type="text" id="horaFinaliza*" alt="Olvidaste especificar la hora de finalización de esta actividad." value="<?php echo $HoraF; ?>" size="6" maxlength="5" /> 
    		(hh:mm. Ejemplo 10:00, 17:07)</p></td>
   	</tr> 
  </table> 
  <p align="center" class="centrar">
  	<input name="Enviar" type="submit" value="Guardar" style="width:150px;" />
  	<input name="id_actividad" type="hidden" value="<?php echo $_GET['id_actividad']; ?>">
	<input name="accion" type="hidden" id="accion" value="<? echo $_GET['accion']; ?>">
  </p>
  <p class="centrar"><a href="actividades_gestion.php" onClick="window.history.back();">Regresar</a></p>
</form> 
<? } ?>
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
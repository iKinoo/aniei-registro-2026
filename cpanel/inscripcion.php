<?php
	session_start();
	if(!isset($_SESSION['logginuser']) || $_SESSION['logginuser'] != 1){
		header("Location: index.php");
	}
	include("../funciones/funciones.php");
	include("../funciones/basedatos.php");
	$conn = Conectar();
	
	function Tiempo($h,$m,$s,$mm,$d,$a){
	  	$t = 0; //mktime(0,0,0,(int)$mm,(int)$d,(int)$a,0);
	  	$t += (int)$h * 3600;
	  	$t += (int)$m * 60;
	  	//$t += (int)$s;
	  	return $t;
	}
	
	if($_SERVER['REQUEST_METHOD'] == "POST"){
		$id_usuario = $_POST['id_usuario'];
		$id_actividad = $_POST['id_actividad'];
		// INICIAMOS UNA TRANSACCION
		mysql_query("BEGIN;");
		// Verificamos si el usuario esta inscrito en este taller
		$strSQL = "SELECT * FROM inscripciones WHERE id_actividad='".$id_actividad."' AND id_asistente='".$id_usuario."'";
		$registros = mysql_query($strSQL);
		if(mysql_num_rows($registros) == 0){ //Al obtener un CERO significa que no està inscrito a la actividad
			// Obtenemos el CUPO máximo para esta actividad	
			$strSQL = "SELECT cupo FROM actividades WHERE id_actividad=".$id_actividad;
			$registros = mysql_query($strSQL);
			$registros = mysql_fetch_array($registros, MYSQL_ASSOC);
			$cupoMAX = $registros['cupo'];
			// Genero marca de tiempo inicial para la actividad
			list($fecha,$tiempo) = explode(" ",$registros['hora_inicio']);
			list($ano,$mes,$dia) = split("-",$fecha);
			list($hora,$min,$seg) = split(":",$tiempo);
			$hhoraIni = Tiempo($hora,$min,$seg,$mes,$dia,$ano);
			//echo $hora.",".$min.",".$seg.",".$mes.",".$dia.",".$ano."<br>";
			// Genero marca de tiempo final para la actividad
			list($fecha,$tiempo) = explode(" ",$registros['hora_final']);
			list($ano,$mes,$dia) = split("-",$fecha);
			list($hora,$min,$seg) = split(":",$tiempo);
			$hhoraFin = Tiempo($hora,$min,$seg,$mes,$dia,$ano);
			//echo $hora.",".$min.",".$seg.",".$mes.",".$dia.",".$ano."<br><br>";
			
			$strSQL = "SELECT id_inscripcion FROM inscripciones WHERE id_actividad=".$id_actividad;
			$registros = mysql_query($strSQL);
			if(mysql_num_rows($registros) < $cupoMAX){ // Verificamos si hay cupo disponible
				// En caso de haber CUPO, entonces verificamos si no choca con otra actividad en la que esté inscrito
				$strSQL = "SELECT a.id_actividad, a.nombre, a.hora_inicio, a.hora_final FROM inscripciones i, actividades a WHERE i.id_asistente='".$id_usuario."' AND a.id_actividad=i.id_actividad";
				$registros = mysql_query($strSQL);
				if(mysql_num_rows($registros) == 0){
					// Como NO está inscrito en ninguna activdad, entonces lo agregamos inmediatamente
					$add = true;
				} else {
					// Como esta inscrito en alguna actividad, entonces vemos que no choque					
					while ($registro = mysql_fetch_array($registros, MYSQL_ASSOC)) {
						// Genero marca de tiempo INICIAL
						list($fecha,$tiempo) = explode(" ",$registro['hora_inicio']);
						list($ano,$mes,$dia) = split("-",$fecha);
						list($hora,$min,$seg) = split(":",$tiempo);
						$horaIni = Tiempo($hora,$min,$seg,$mes,$dia,$ano);
						//echo $hora.",".$min.",".$seg.",".$mes.",".$dia.",".$ano."<br>";
						// Genero marca de tiempo FINAL
						list($fecha,$tiempo) = explode(" ",$registro['hora_final']);
						list($ano,$mes,$dia) = split("-",$fecha);
						list($hora,$min,$seg) = split(":",$tiempo);
						$horaFin = Tiempo($hora,$min,$seg,$mes,$dia,$ano);
						//echo $hora.",".$min.",".$seg.",".$mes.",".$dia.",".$ano."<br>";
						
						// Reviso que la actividad no esté entre las marcas de tiempo
						if(($horaIni <= $hhoraIni && $hhoraIni <= $horaFin) || ($horaIni <= $hhoraFin && $hhoraFin <= $horaFin)){
							$add = false;
							$actividad_no_inscrita = $registro['nombre'];
							//echo "<pre>(".$horaIni." <= ".$hhoraIni." && ".$hhoraIni." >= ".$horaFin.")<br>(".$horaIni." <= ".$hhoraFin." && ".$hhoraFin." >= ".$horaFin.")</pre>";
						} else {
						  	$add = true;
						}						
					}					
				}
				
				if($add == true){
					// En caso de no CHOQUE con otra actividad, lo agregamos
					$strSQL = "INSERT INTO inscripciones VALUES('','".$id_actividad."','".$id_usuario."')";
					mysql_query($strSQL);
					mysql_query("COMMIT;"); // FINALIZAMOS LA TRANSACCION CON EXITO
					$inscrito = 0;
				} else {
					mysql_query("ROLLBACK;");
					$inscrito = 3;
				}
			} else {
				// En caso de no haber cupo, entonces lo rechazamos
				mysql_query("ROLLBACK;"); // FINALIZAMOS LA TRANSACCION SIN HACER CAMBIOS
				$inscrito = 1;
			}
		} else {
			// ya esta inscrito en la actividad
			$inscrito = 2;
		}
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
<script language="javascript" type="text/javascript" src="../js/formulario.js"></script>
<style type="text/css">
	.Estilo { color:#999999; font-family: Tahoma; font-size: 8pt; }
	.mensaje {
		border: 1px solid #1D4D94;
		background-color: #B3E8E8;
	}
</style>
<script language="JavaScript" type="text/javascript">
	function Ventana(){
		// Propiedades para que la ventana se centre y ocupe el 50% del área de la pantalla
		var alto = screen.height/2;
		var ancho = screen.width/2;
		var top = (screen.height - alto)/2;
		var left = (screen.width - ancho)/2;
		
		var cosas = 'fullscreen=no, top='+top+', left='+left+', toolbar=no, menubar=no, status=yes, scrollbars=yes, resizable=yes, height='+alto+', width='+ancho;
		var url = 'buscar_usuario.php?t='+document.getElementById("nombre").value;
		var oy=window.open(url,'Buscar',cosas);
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
<? if($_SERVER['REQUEST_METHOD'] == "POST") {
	$strSQL = "SELECT nombre FROM actividades WHERE id_actividad=".$id_actividad;
	$reg = mysql_query($strSQL);
	$r = mysql_fetch_array($reg, MYSQL_ASSOC);
	$actividad = $r['nombre'];
	
	if($inscrito != 1){
	  	$registro = "";
		$strSQL = "SELECT titulo, nombre, apellido FROM usuarios WHERE id_usuario LIKE '".$id_usuario."'";
		$reg = mysql_query($strSQL);
		$r = mysql_fetch_array($reg, MYSQL_ASSOC);
		$titulo = $r['titulo'];
		$nombre = $r['nombre'];
		$apellido = $r['apellido'];
	}
	?><div class="mensaje"><?
	if($inscrito == 0) { ?><h3 align="center"><?php echo $titulo." ".$nombre." ".$apellido; ?><br>ha sido inscrito a<br><?php echo $actividad; ?></h3><? } 
	if($inscrito == 1) { ?><h3 align="center">Lo sentimos, el cupo para <?php echo $actividad; ?> est&aacute; completo.</h3><? }
	if($inscrito == 2) { ?><h2 align="center"><?php echo $titulo." ".$nombre." ".$apellido; ?></h2><h3 align="center">ya est&aacute; inscrito en esta actividad.</h3><?	} 
	if($inscrito == 3) { ?>
		<h2 align="center"><?php echo $titulo." ".$nombre." ".$apellido; ?></h2>
		<h3 align="center">no se puede inscribir a la actividad</h3>
		<h2 align="center"><?php echo $actividad; ?></h2>
		<h3 align="center">porque el horario interviene con la actividad</h3>
		<h2 align="center"><?php echo $actividad_no_inscrita; ?></h2>
<?	} ?></div><?
} ?>
<form action="<? echo $_SERVER['PHP_SELF']; ?>" method="post" name="form1" id="form1" onSubmit="return ValidaForm(this);">
	<table border="0" align="center" cellpadding="10" cellspacing="0"> 
    <tr>
      <td colspan="2" bgcolor="#F3F3F3"><p class="centrar"><b>Los campos indicados con asterisco (*) son obligatorios.<br>
      	Llene el formato utilizando may&uacute;sculas y min&uacute;sculas.</b><br>
      	<b>El d&iacute;a del evento deber&aacute; traer la copia del dep&oacute;sito bancario. </b></p>		</td>
    </tr>
    <tr> 
      <td colspan="2"><p><b>Informaci&oacute;n de la Actividad</b></p></td> 
    </tr>
    <tr> 
      <td align="right"><p>Actividad*<b></b></p></td> 
      <td><select name="id_actividad" id="id_actividad*" style="width:700px;" alt="Olvidaste seleccionar la actividad a la que se inscribirá el participante.">
          <option value="0">[SELECCIONE UNA OPCION]</option><?php
	    $strSQL = "SELECT a.id_actividad, a.hora_inicio, a.nombre, u.nombre AS unombre, u.apellido
					FROM actividades a
					INNER JOIN usuarios u ON a.id_ponente = u.id_usuario
					ORDER BY a.nombre";
		$tipos = mysql_query($strSQL);
		while($t = mysql_fetch_array($tipos, MYSQL_ASSOC)){ 
			$texto = trim(HTML($t['nombre']));
			$title = $texto."\n".HTML(trim($t['unombre']))." ".HTML(trim($t['apellido']))."\n".FormatoFechaHoraFrase($t['hora_inicio']); ?>
          <option value="<?php echo $t['id_actividad'];?>" title="<? echo $title; ?>"><?php echo $texto; ?></option>
          <?php } ?>
        </select>      </td>
    </tr> 
     
    <tr> 
      <td align="right"><p>Participante*</p></td> 
      <?php if(isset($_GET['id'])){
	  			$strSQL = "SELECT nombre, apellido FROM usuarios WHERE id_asistente='".$_GET['id']."'";			
				$reg = mysql_query($strSQL);
				$reg = mysql_fetch_array($reg);
			} ?>
      <td><p>
      	<input name="nombre" type="text" id="nombre*" alt="Olvidaste seleccionar al participante." value="<?php if(isset($reg[0]) && isset($reg[1])) {echo $reg[0]." ".$reg[1];} ?>" size="30" maxlength="17" />
		<input name="Buscar" type="button" id="Buscar" value="Buscar" onClick="Ventana()" />
	<br>
	<span class="Estilo" id="comentarios"><?php echo $_GET['id']; ?></span></p></td>
    </tr> 
  </table> 
  <p align="center">
  	<input name="id_usuario" type="hidden" id="id_usuario" value="<?php echo $_GET['id_usuario']; ?>">
	<input name="Enviar" type="submit" value="Registrar" />
  </p>
  <p align="center"><a href="#" onClick="window.location='index.php'">Panel de control</a></p>
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
<?php Desconectar($conn);?>
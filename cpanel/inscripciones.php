<?php
	session_start();
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
	
	$strSQL = "SELECT a.id_actividad, a.nombre, ta.descripcion
				FROM actividades a
				INNER JOIN tipoactividad ta ON ta.id_tipoactividad = a.id_tipoactividad
				WHERE ta.id_tipoactividad < 3 
				ORDER BY a.id_tipoactividad ASC, a.nombre ASC";
	$reg = mysql_query($strSQL);
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
<script language="javascript" type="text/javascript" src="../js/funciones.js"></script>
<script language="javascript" type="text/javascript" src="../js/jquery.js"></script>
<script language="javascript" type="text/javascript" src="../js/getElementsBySelector.js"></script>
<style type="text/css">
	.Estilo { color:#999999; font-family: Tahoma; font-size: 8pt; }
	.mensaje {
		border: 1px solid #1D4D94;
		background-color: #B3E8E8;
	}
	.checklist li { background: none; padding-left: 0; font-size:13px; }
	
	.checklist {
		border: 1px solid #000000;
		list-style: none;
		height: 300px;
		overflow: auto;
		width: 700px;
		background: #FFFFFF;
		padding: 5px;
	}
	.checklist, .checklist li { margin-left: 0; padding: 0; }
	.checklist label { display: block; padding: 5px 5px 5px 25px; text-indent: -25px; }
	.checklist label:hover, .checklist label.hover { background-color:#666666; color: #ffffff; }
	.checklist input { vertical-align: middle; }
	
	.taller { background-color:#FFD6D1; }
	.seminario { background-color:#FFD5AA; }
	.conferencia { background-color:#FFFFCC; }
	.ponencia { background-color:#D1F1FF; }
	.tesis {background-color:#DDD1FF;}
	.videoconferencias { background-color:#CF9FFF; }
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
	
	function initChecklist() {
		if (document.all && document.getElementById) {
			var lists = document.getElementsByTagName("ul");
			for (i = 0; i < lists.length; i++) {
				var theList = lists[i];
				if (theList.className.indexOf("checklist") > -1) {
					var labels = theList.getElementsByTagName("label");
					for (var j = 0; j < labels.length; j++) {
						var theLabel = labels[j];
						theLabel.onmouseover = function() { this.className += " hover"; };
						theLabel.onmouseout = function() { this.className = this.className.replace(" hover", ""); };
					}
				}
			}
		}
	}
	
	addLoadEvent(initChecklit);
	
	function CalcularCosto(){
		var taller = 0;
		
		var talleres = document.getElementsBySelector("input[name*=talleres]");
		for(var i=0; i<talleres.length; i++){
			if(talleres[i].checked === true) {
				taller += 100;
			}
		}
		
		var total = parseFloat(taller);
		$("span#costoTotal").text(parseFloat(total)+".00");
		$("#costototal").attr("value", total);
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
<form action="<? echo $_SERVER['../PHP_SELF']; ?>" method="post" name="form1" id="form1" onSubmit="return ValidaForm(this);">
	<table border="0" align="center" cellpadding="5" cellspacing="0"> 
    <tr>
      <td colspan="2" bgcolor="#F3F3F3"><p class="centrar"><b>Los campos indicados con asterisco (*) son obligatorios.<br>
      	Llene el formato utilizando may&uacute;sculas y min&uacute;sculas.</b><br>
      	<b>El d&iacute;a del evento deber&aacute; traer la copia del dep&oacute;sito bancario. </b></p>		</td>
    </tr>
    <tr> 
      <td colspan="2"><p><b>Informaci&oacute;n de la Actividad</b></p>
        <table border="0" align="center" cellpadding="10" cellspacing="0" style="border:1px solid #000000;">
          <tr class="taller">
            <td align="right"><p>Talleres</p></td>
            <td><p>$100.00</p></td>
          </tr>
          <tr class="seminario">
            <td align="right"><p>Seminarios</p></td>
            <td><p>$50.00</p></td>
          </tr>
        </table></td> 
    </tr>
    <tr> 
      <td align="right"><p>N&uacute;mero de Folio*</p></td> 
      <?php if(isset($_GET['id'])){
	  			$strSQL = "SELECT nombre, apellido FROM usuarios WHERE id_asistente='".$_GET['id']."'";			
				$reg = mysql_query($strSQL);
				$reg = mysql_fetch_array($reg);
			} ?>
      <td valign="top"><p>
      	<input name="folio" type="text" id="folio*" alt="Olvidaste proporcionar tu número de folio." size="7" maxlength="6" />
      	<input type="button" name="Submit" value="Validar mi folio">
      	<br>
	<span class="Estilo" id="nombre"><?php echo $_GET['id']; ?></span></p></td>
    </tr>
    <tr>
      <td align="right" valign="top">Actividades*</td>
      <td valign="top">
	  	<ul class="checklist"><? $i=0; while($r = mysql_fetch_array($reg, MYSQL_ASSOC)){ ?>
			<li><label class="<? echo strtolower($r['descripcion']); ?>"><input id="b<? echo $i; ?>" name="talleres[]" type="checkbox" value="<? echo $r['id_actividad']; ?>" class="opcTaller" onClick="CalcularCosto();" />[<? echo strtoupper($r['descripcion']); ?>] <? echo $r['nombre']; ?></label></li>
		<? $i++; } ?></ul>	  </td>
    </tr>
    <tr>
      <td colspan="2" align="right" valign="top"><h3 align="right" style="margin-right:30px;"><span style="margin-right:10px;">Total $</span><span id="costoTotal">0.00</span></h3></td>
      </tr> 
  </table> 
  <p align="center">
    <input name="Enviar" type="submit" value="Inscribirme a las actividades seleccionadas" />
  </p>
  <p align="center"><a href="../index.php">P&aacute;gina de inicio </a></p>
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
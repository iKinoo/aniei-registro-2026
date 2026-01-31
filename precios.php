<?
	session_start();
	include("funciones/funciones.php");
	include("funciones/basedatos.php");
	$conn = Conectar();
	
	if($_SERVER['REQUEST_METHOD'] == "POST" && isset($_POST['accion']) && $_POST['accion'] == "registro"){
		/****************************************************************/
		/********************** R E G I S T R O *************************/
		/****************************************************************/
		if(isset($_POST['grupo_nombre'])){
			$keys = array_keys($_POST['grupo_nombre']);
		}
		list($precio, $idCosto) = split("-",$_POST['precios']);
		$strSQL = "SELECT id_costo, costo, id_tipousuario FROM costos WHERE id_costo = '".$idCosto."'";
		$reg = mysql_query($strSQL);
		$r = mysql_fetch_array($reg, MYSQL_ASSOC);
		$idTipo = $r['id_tipousuario'];
		$strSQL = "INSERT INTO usuarios
					VALUES (null,
					'',
					'".$_POST['titulo']."', 
					'".trim($_POST['nombres'])."', 
					'".trim($_POST['apellidos'])."',
					'".$_POST['id_cargo']."', 
					'".$idTipo."', 
					'".trim($_POST['carrera'])."',
					'".$_POST['id_institucion']."', 
					'".trim($_POST['institucion'])."', 
					'".trim($_POST['dependencia'])."', 
					'".$_POST['id_entidadfederativa']."', 
					'".trim($_POST['correo'])."', 
					'".trim($_POST['lada'])."', 
					'".trim($_POST['telefono'])."', 
					'".trim($_POST['extension'])."', 
					'".trim($_POST['codBarras'])."', 
					'', 
					'',
					'".$_POST['genero']."',
					'',
					NOW(),
					'".$idCosto."')";
		mysql_query($strSQL);
		$idUsuario = mysql_insert_id();
		$folio = "A".str_pad($idUsuario, 5, "0", STR_PAD_LEFT);
		$strSQL = "UPDATE usuarios SET folio_recibo = '".$folio."' WHERE id_usuario = ".$idUsuario;
		mysql_query($strSQL);
		$idFolios["padre"] = $folio;
		// Lo inscribimos en sus actividades correspondientes
		for($i=0; $i<count($_POST['talleres']); $i++){
			$strSQL = "INSERT INTO inscripciones VALUES(null, '".$_POST['talleres'][$i]."', '".$idUsuario."')";
			mysql_query($strSQL);
		}
		
		/*****************************************************************/
		/*  N O M B R E   D E   U S U A R I O   Y   C O N T R A S E Ñ A  */
		/*****************************************************************/
		$contrasena = GeneraPassword();
		$strSQL = "INSERT INTO accesos VALUES(null, '".$folio."', MD5('".$contrasena."'), 0)";
		mysql_query($strSQL);
		
		/****************************************************************/
		/************************* G R U P O ****************************/
		/****************************************************************/
		$t = count($keys);
		$idPadre = $idUsuario;
		for ($i=0; $i<$t; $i++){		  		
			if(trim($_POST['grupo_nombre'][$keys[$i]]) != "" && trim($_POST['grupo_apellido'][$keys[$i]]) != ""){
				$strSQL = "INSERT INTO usuarios
							VALUES (null,
							'',
							'', 
							'".trim($_POST['grupo_nombre'][$keys[$i]])."', 
							'".trim($_POST['grupo_apellido'][$keys[$i]])."',
							'1', 
							'1', 
							'".trim($_POST['carrera'])."',
							'".$_POST['id_institucion']."', 
							'".trim($_POST['institucion'])."', 
							'".trim($_POST['dependencia'])."', 
							'".$_POST['id_entidadfederativa']."', 
							'', 
							'', 
							'', 
							'',
							'',
							'".$idPadre."',
							'', 
							'".$_POST['grupo_genero'][$keys[$i]]."',
							'',
							NOW(),
							'".$idCosto."')";
				mysql_query($strSQL);
				$idUsuarioGrupo = mysql_insert_id();
				$folioHijo = "A".str_pad($idUsuarioGrupo, 5, "0", STR_PAD_LEFT);
				$strSQL = "UPDATE usuarios SET folio_recibo = '".$folioHijo."' WHERE id_usuario = ".$idUsuarioGrupo;
				mysql_query($strSQL);
				$idFolios["hijo"][] = $folioHijo;
				// Lo inscribimos en sus actividades correspondientes
				for($j=0; $j<count($_POST['grupo_talleres'][$keys[$i]]); $j++){
					$strSQL = "INSERT INTO inscripciones VALUES(null, '".$_POST['grupo_talleres'][$keys[$i]][$j]."', '".$idUsuarioGrupo."')";
					mysql_query($strSQL);
				}
			}
		} 
		
		/****************************************************************/
		/********************** D E P O S I T O *************************/
		/****************************************************************/
		if (trim($_POST['monto']) != '') {
			$strSQL = "INSERT INTO depositos 
					VALUES(null, 
					'".$idUsuario."',
					'".trim($_POST['ciudad_dep'])."', 
					'".trim($_POST['sucursal_dep'])."', 
					'".trim($_POST['fecha_dep'])."', 
					'".trim($_POST['hora_dep'])."', 
					'".trim($_POST['referencia_dep'])."', 
					'".trim($_POST['monto'])."')";
			mysql_query($strSQL);
		}
		
		/****************************************************************/
		/*********************** F A C T U R A **************************/
		/****************************************************************/
		if (trim($_POST['rfc']) != '') {
			$strSQL = "INSERT INTO facturaciones 
							VALUES (null, 
							'".$idUsuario."', 
							'".trim($_POST['razon'])."',
							'".trim($_POST['rfc'])."', 
							'".trim($_POST['calle'])."', 
							'".trim($_POST['num_ext'])."', 
							'".trim($_POST['num_int'])."', 
							'".trim($_POST['colonia'])."', 
							'".trim($_POST['municipio'])."', 
							'".$_POST['id_entidadfederativaRFC']."', 
							'".trim($_POST['codigo_postal'])."')";
			
			mysql_query($strSQL);
		}
		
		$txt = "Gracias por queres participar en el Congreso de la ANIEI 2008.\nPara cualquier aclaración a continuación le proporcionamos su número de registro: ".$idFolios["padre"]."\n\n";
		$txt .= "El monto de su registro es de $".$_POST["costototal"].".00\n";
		$txt .= "Su nombre de usuario es su folio: ".$idFolios["padre"]."\n";
		//$txt .= "Su contraseña es: $".$contrasena."\n";
		$txt .= "IMPORTANTE: Guarde esta información en un lugar seguro y/o imprímala.\n";
		if(count($_POST['grupo_nombre']) > 0 ){
			$txt .= "\nLos folios de sus alumnos son:\n";
			for($i=0; $i<$t; $i++){
				if(trim($_POST["grupo_nombre"][$keys[$i]]) != "" && trim($_POST["grupo_apellido"][$keys[$i]]) != ""){
					$txt .= "\t".$idFolios["hijo"][$i]."\t".trim($_POST["grupo_nombre"][$keys[$i]])." ".trim($_POST["grupo_apellido"][$keys[$i]])."\n";
				}
			}
		}
		$txt .= "\nPara que los usuarios proporcionados en su grupo se inscriban a alguna actividad tienen que ingresar en http://www.aniei2008.com/inscripciones.php, proporcionar su folio y seleccionar la actividad al que desean inscribirse. En caso contrario, pueden esperar hasta el día 1 de octubre de 2008 para inscribirse personalmente a una actividad. CONSIDERACION: Esperar hasta la fecha de inauguración puede ocasionar que el cupo para una actividad se agote.\n";
		//$txt .= "El nombre de usuario y contraseña le permitirá ingresar de nuevo a nuestro sistema para poder cambiar su información personal. No podrá cambiar, intercambiar o eliminar actividades en las que se haya inscrito usted o de alguno de sus participantes de su grupo (en caso de haber inscrito un grupo).";
		
		$html = '<p style="font-family: Arial;">Agradecemos su participaci&oacute;n en el Congreso de la ANIEI 2008.</p>
				<p style="font-family: Arial;">Para cualquier aclaraci&oacute;n a continuaci&oacute;n le proporcionamos su n&uacute;mero de registro: <span style="color:#0000FF;">'.$idFolios["padre"].'</span></p>
				<p style="font-family: Arial;">El monto de su registro es de <b>$'.$_POST['costototal'].'.00</b></p>';
		$html .= '<p style="font-family: Arial;">Su nombre de usuario es su folio: <b>'.$idFolios['padre'].'</b></p>';
		//$html .= '<p style="font-family: Arial;">Su contrase&ntilde;a es: <b>'.$contrasena.'</b><p>';
		$html .= '<p style="font-family: Arial; color: #FF0000;">IMPORTANTE: Guarde esta informaci&oacute;n en un lugar seguro y/o impr&iacute;mala.</p>';
		if(count($_POST['grupo_nombre']) > 0 ){
			$html .= '<table align="center" border="0" cellspacing="0" cellpadding="5"><tr><th colspan="3">Los folios para sus alumnos son</th></tr>';
			for($i=0; $i<$t; $i++){
				if(trim($_POST['grupo_nombre'][$keys[$i]]) != "" && trim($_POST['grupo_apellido'][$keys[$i]]) != ""){
					$html .= '<tr><td><p style="font-family: Arial;">'.$idFolios['hijo'][$i].'</p></td><td><p style="font-family: Arial">'.trim($_POST['grupo_nombre'][$keys[$i]]).'</p></td><td><p style="font-family: Arial">'.trim($_POST['grupo_apellido'][$keys[$i]]).'</p></td></tr>';
				}
			}
			$html .= '</table>';
		}
		/* $html .= '<p style="font-family: Arial;">Para que los usuarios proporcionados en su grupo se inscriban a alguna actividad tienen que ingresar en 
					<a href="http://www.aniei2008.com/inscripciones.php">http://www.aniei2008.com/inscripciones.php</a>, 
					proporcionar su folio y seleccionar la actividad al que desean inscribirse. En caso contrario, pueden esperar 
					hasta el d&iacute;a 1 de octubre de 2008 para inscribirse personalmente a una actividad. CONSIDERACION: Esperar hasta 
					la fecha de inauguraci&oacute;n puede ocasionar que el cupo para una actividad se agote.</p>';
		$html .= '<p style="font-family: Arial;">El nombre de usuario y contrase&ntilde;a le permitir&aacute; ingresar de nuevo a nuestro sistema para poder 
					cambiar su informaci&oacute;n personal. No podr&aacute; cambiar, intercambiar o eliminar actividades en las que se haya inscrito usted o 
					de alguno de sus participantes de su grupo (en caso de haber inscrito un grupo).</p>'; */
		$asunto = "Congreso ANIEI - Preinscripci&oacute;n";
		$nombre_destino = $nombre." ".$apellido;
		$correo_destino = $correo;
		$nombre_fuente = "Congreso ANIEI";
		$correo_fuente = "congreso@aniei.org.mx";
		EnviarMail($nombre_destino, $correo_destino, $nombre_fuente, $correo_fuente, $txt, $html, $asunto);
		header("location: precios2.php?folio=".$folio); die();
	}
	
	if(!isset($_GET['reg']) && !isset($_GET['pre'])) { header("Location: index.php"); }
	
	$strSQL = "SELECT a.id_actividad, a.nombre, ta.descripcion
				FROM actividades a
				INNER JOIN tipoactividad ta ON ta.id_tipoactividad = a.id_tipoactividad
				WHERE ta.id_tipoactividad < 3 
				ORDER BY a.id_tipoactividad ASC, a.nombre ASC";
	$reg = mysql_query($strSQL);
	$antesDel_17 = "";
	$despuesDel_17 = "";
	$lim = mktime(0, 0, 0, 3, 15, 2008);
	$hoy = mktime(0, 0, 0, intval(date("m")), intval(date("d")), intval(date("Y")));
	
	if($hoy < $lim) {
		// Significa que aun no es fecha limite, asi que bloqueamos los que son DESPUES
		$despuesDel_17 = 'disabled="disabled"';
	} else {
		// significa que ya es fecha limite, asi que bloqueamos los que son ANTES
		$antesDel_17 = 'disabled="disabled"';
	}
	
	$costos['taller'] = "100";
	$costos['seminario'] = "50";
?>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html><!-- InstanceBegin template="/Templates/aniei.dwt.php" codeOutsideHTMLIsLocked="false" -->
<head>
<title>:: ANIEI <? echo date("Y"); ?>::</title>
<meta http-equiv="Content-Type" content="text/html; charset=iso-8859-1" />
<link rel="stylesheet" type="text/css" href="css/body.css">
<link rel="stylesheet" type="text/css" href="css/exclusivo.css">
<!-- InstanceBeginEditable name="head" -->
<link rel="stylesheet" type="text/css" href="css/jquery.all.css">
<script language="javascript" type="text/javascript" src="js/funciones.js"></script>
<script language="javascript" type="text/javascript" src="js/formulario.js"></script>
<script> window.onload = null; </script>
<script language="javascript" type="text/javascript" src="js/jquery.js"></script>
<script language="javascript" type="text/javascript" src="js/ui.core.js"></script>
<script language="javascript" type="text/javascript" src="js/ui.tabs.js"></script>
<script language="javascript" type="text/javascript" src="js/getElementsBySelector.js"></script>
<script language="javascript" type="text/javascript" src="js/calendarDateInput/calendarDateInput.js"></script>
<script language="javascript" type="text/javascript" src="js/dinamycList.js"></script>
<script language="javascript" type="text/javascript" src="js/validaciones.js"></script>
<script language="javascript" type="text/javascript">
	$(document).ready(function(){
		$("#example > ul").tabs({ fx: { opacity: 'toggle', duration: 'fast' } });;
		ToggleGrupos("remove");
		<? if(isset($_GET['pre'])) { ?>$("#example > ul").data("disabled.tabs", [4, 5, 6]);<? } ?>
		initChecklist();
  	});
	
	function ToggleGrupos(action){
		if(action == "remove"){
			$("#example > ul").data("disabled.tabs", [4]);
		} else {
			$("#example > ul").tabs("enable", 4);
		}
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
	
	function Seleccionar(i){
		var obj = document.getElementById("p"+i);
		if(obj.disabled == false){
			obj.checked = true;
			var grupos = document.getElementsBySelector(".grupo");
			var esGrupo = false;
			for(var i=0; i<grupos.length; i++){ if(grupos[i].checked === true){ esGrupo = true; } }
			if(esGrupo === true) { ToggleGrupos("add"); } else { ToggleGrupos("remove"); }
			CalcularCosto();
		}
	}
	
	function VerificaInstitucion(i){
		if(i.value == "otro"){
			document.getElementById("institucion").style.display = "inline";
		} else {
			document.getElementById("institucion").style.display = "none";
		}
	}
	
	function Validar(f){
		var Select = document.getElementById("id_institucion");
		var Input = document.getElementById("institucion");
		
		var precios = document.getElementsBySelector("input[name=precios]");
		var almenosUno = false;
		for(var i=0; i<precios.length; i++){
			if(precios[i].checked === true) { almenosUno = true; }
		}
		if(almenosUno === false){
			alert("Debes seleccionar un tipo de usuario.");
			$("#example > ul").tabs("select","#precios");
			return false;
		}
		
		/*
		var precios = document.getElementsBySelector("input[name*=talleres]");
		var almenosUno = false;
		for(var i=0; i<precios.length; i++){
			if(precios[i].checked === true) { almenosUno = true; }
		}
		if(almenosUno === false){
			alert("Debes seleccionar al menos un taller o conferencia.");
			$("#example > ul").tabs("select","#talleres");
			return false;
		}*/
		
		if(ValidaForm(f) === false) { return false; }
		
		// verificamos el genero
		var precios = document.getElementsBySelector("input[name*=genero]");
		var almenosUno = false;
		for(var i=0; i<precios.length; i++){
			if(precios[i].checked == true) { almenosUno = true; }
		}
		if(almenosUno == false){
			alert("Debes seleccionar tú género.");
			$("#example > ul").tabs("select","#registro");
			return false;
		}
		
		var Select = document.getElementById("id_institucion*");
		if(Select.value == "0"){
			alert("Debes seleccionar una institución.")
			$("#example > ul").tabs("select","#registro");
			return false;
		} else {
			if(Select.value == "otro" && trim(Input.value) == ""){
				alert("Olvidaste proporciona el nombre de la Institución a la que perteneces.");
				return false;
			}
		}
		
		if(document.getElementById("acepto").checked == false){
			alert("No olvide leer las instrucciones y confirmar que la información proporcionada es real.");
			return false;
		}
		
		return Validar2(f);
	}
	
	function CalcularCosto(){
		var tipoUsuario = 0;
		var taller = 0;
		var usuariosGrupo = 0;
		
		var precios = $("input[name*=precios]");
		for(var i=0; i<precios.length; i++){
			if(precios[i].checked === true) {
				tipoUsuario = precios[i].value.split("-")[0];
			}
		}
		
		var talleres = $("input[name*=talleres]");
		for(var i=0; i<talleres.length; i++){
			if(talleres[i].checked === true) {
				taller += parseFloat($("#"+talleres[i].id).attr("costo"));
			}
		}
		
		var grupos = $(".grupo");
		var esGrupo = false;
		for(var i=0; i<grupos.length; i++){ if(grupos[i].checked === true){ esGrupo = true; } }
		if(esGrupo === true) {
			var usuariosGrupo = $("input[name*=grupo_nombre]").length;
		} else {
			var usuariosGrupo = 0;
		}
		
		var total = parseFloat(tipoUsuario) + parseFloat(taller) + parseFloat(usuariosGrupo * tipoUsuario);
		$("span#costoTotal").fadeOut('slow', function(){
			$("span#costoTotal").text(parseFloat(total)+".00");
			$("input#h_costototal[type*=hidden]").attr("value", total);
			$("#monto*").attr("value", total+".00")
		});
		$("span#costoTotal").fadeIn('slow');
	}
	
	function BorrarFila(obj) {
		tab = document.getElementById('tabla');
		while (obj.tagName != 'TR') { obj = obj.parentNode; }
		for (i=1; ele=tab.getElementsByTagName('tr')[i]; i++) { 
			if(ele==obj) { 
				var num=i;
			}
		}
		tab.deleteRow(num);
		tab.deleteRow(num+1);
		CalcularCosto();
		return false;
	}
	
	function togglearActGrupo(){
		var listas = document.getElementsBySelector("table#grupos_usuarios ul[id*=listaActividades]");
		for(var i=0; i<listas.length; i++){
			if(listas[i].style.display != "none"){
				$("#"+listas[i].id).animate({ height: 'toggle' }, "slow");
			}
		}
	}
	
	function togglearSubmit(){
		$("#submit").animate({  opacity: 'toggle' }, 'slow');
	}
</script>
<style type="text/css">
	table#tablePrice { border: 1px solid #006699; }
	table#tablePrice tr th[valign=middle] { border-bottom: 1px solid #006699; }
	table#tablePrice tr th[align=right] { border-right: 1px solid #006699; }
	table#tablePrice tr td:hover { background-color:#CCFDFF; cursor: pointer; }
	
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
	.checklist, .checlist li { margin-left: 0; padding: 0; }
	.checklist label { display: block; padding: 5px 5px 5px 25px; text-indent: -25px; }
	.checklist label:hover, .checklist label.hover { background-color:#666666; color: #ffffff; }
	.checklist input { vertical-align: middle; }
	
	.taller { background-color:#FFD6D1; }
	.taller_d { background-color:#CCCCCC; } 
	.seminario { background-color:#FFD5AA; }
	.conferencia { background-color:#FFFFCC; }
	.ponencia { background-color:#D1F1FF; }
	.tesis {background-color:#DDD1FF;}
	.videoconferencias { background-color:#CF9FFF; }
	
	.Area {
		/*height:620px;*/
		overflow:auto;
		width:720px;
	}
	
	#costoTotal { font-size: 30px; }
	
	table#tablePrice tr td.disabled:hover { background-color:#EBECED; }
	table#tablePrice tr td.disabled p { color:#CCCCCC; }
	table#tablePrice tr td.disabled { cursor: default; }
	
	div#instrucciones > ul > li { font-size: 16px; font-weight:bold; margin-top: 15px; }
	div#instrucciones > ul > li > ul > li { font-size: 12px; font-weight: normal; }
</style>
<!-- InstanceEndEditable -->
</head>
<body bgcolor=#FFFFFF>
<table border="0" align="center" cellpadding="0" cellspacing="0">
	<?php if(isset($_SESSION['logginuser'])) { ?>
	<tr>
		<td width="21">&nbsp;</td>
		<td width="118"><a href="cpanel/panel_control.php"><img src="img/inicio.jpg" width=118 height=25 border="0" /></a></td>
		<td width="456">&nbsp;</td>
		<td width="112" class="derecha"><a href="cpanel/cerrar_sesion.php"><img src="img/cerrar_sesion.jpg" width=112 height=25 border="0" /></a></td>
		<td width="10">&nbsp;</td>
	</tr>
	<?php } ?>
	<tr>
		<td><img src="img/borde_sup_izq.jpg" width=21 height=18 /></td>
		<td style="background-repeat:repeat-x" background="img/borde_sup.jpg" colspan=3><img src="img/borde_sup.jpg" width=686 height=18 /></td>
		<td><img src="img/borde_sup_der.jpg" width=22 height=18 /></td>
	</tr>
	<tr>
		<td><img src="img/borde_izq1.jpg" width=21 height=165 /></td>
		<td style="background-repeat:repeat-x"  background="img/linea0.jpg" colspan=3><img src="img/logo.jpg" width=686 height=165 /></td>
		<td><img src="img/borde_der1.jpg" width=22 height=165 /></td>
	</tr>
	<tr>
		<td background="img/borde_izq2.jpg">&nbsp;</td>
		<td height="350" colspan=3 valign="top" bgcolor="#FFFFFF"><!-- InstanceBeginEditable name="ContenidoAniei" -->
			<h1 align="center">Congreso ANIEI 2008</h1>
			<h3 align="right" style="margin-right:30px;"><span style="margin-right:10px;">Total $</span><span id="costoTotal">0.00</span></h3>
			<form action="<? echo $_SERVER['PHP_SELF']; ?>" method="post" name="form1" id="form1" onSubmit="return Validar(this);">
			<div id="example" class="flora">
				<ul>
					<li><a href="#instrucciones"><span>Instrucciones</span></a></li>
					<li><a href="#precios"><span>Precios</span></a></li>
					<li><a href="#talleres"><span>Talleres</span></a></li>
					<li><a href="#registro"><span>Registro</span></a></li>
					<li><a href="#grupo"><span>Registrar grupo</span></a></li>
					<li><a href="#deposito"><span>Datos de dep&oacute;sito</span></a></li>
					<li><a href="#factura"><span>Datos de facturaci&oacute;n</span></a></li>
				</ul>
			<div id="instrucciones" class="Area">
				<h3 style="color:#CC3300;">NOTAS IMPORTANTES:</h3>
				<p style="margin-left:30px; margin-right:30px; color:#CC3300; text-align:justify;">Moverse entre las pesta&ntilde;as no genera ning&uacute;n env&iacute;o de informaci&oacute;n. Navegue con toda libertad entre las pesta&ntilde;as<? if (!isset($_GET['reg'])){ echo "."; } else { ?>, al finalizar de ingresar sus datos por favor de clic sobre el bot&oacute;n REGISTRAR para terminar el proceso.<? } ?> Gracias.</p>
				<p style="margin-left:30px; margin-right:30px; color:#CC3300; text-align:justify;"><b>Es indispensable  llevar  la FICHA ORIGINAL del dep&oacute;sito bancario.</b> <b>En caso de equivocaciones con su informaci&oacute;n tendr&aacute; que esperar hasta llegar al congreso para realizar los cambios.</b></p>
				<p style="margin-left:30px; margin-right:30px; color:#CC3300; text-align:justify;"><b>ADVERTENCIA: Antes de registrarse por favor seleccione los talleres a los que se vaya a inscribir. </b></p>
				<h3>Instrucciones para registrarse al CNIIC-<? echo date("Y"); ?>:</h3>
				<ul>
				  <li>Seleccione la Opci&oacute;n Precios.
				    <ul>
				      <li>Consulte los precios vigentes antes de iniciar el registro.</li>
				      <li>Recomendamos calcule el monto de sudep&oacute;sito antes de registrarse. <? if(isset($_GET['reg'])){?><a href="<? echo $_SERVER['PHP_SELF']."?pre"; ?>">Clic aqu&iacute;</a><? } ?></li>
				      <li>Si desea inscribirse en algun taller o seminario, agregue el precio correspondiente al monto a pagar.</li>
			        </ul>
				  </li>
				  <li>Forma Individual:
				    <ul>
				      <li>Elija su categor&iacute;a de usuario (Que no sea de tipo GRUPO) </li>
				      <li>Seleccione los talleres o seminarios a los que desea asistir (Opcional).</li>
				      <li> Llene la secci&oacute;n de registro con su informaci&oacute;n.</li>
				      <li>Seleccione la opci&oacute;n Datos de Dep&oacute;sito.</li>
				      <li>Proporcione la informaci&oacute;n del dep&oacute;sito bancario.</li>
				      <li>Seleccione la opci&oacute;n Datos de facturaci&oacute;n (en caso de requerir factura) </li>
				      <li>Proporcione sus datos y presione el bot&oacute;n REGISTRAR.</li>
			        </ul>
				  </li>
					<li>Forma Grupal:
					  <ul>
					    <li>Elija su categor&iacute;a de usuario de tipo GRUPO.</li>
					    <li>Seleccione los talleres o seminarios a los que desea asistir (Opcional).</li>
					    <li> Llene la secci&oacute;n de registro con su informaci&oacute;n.</li>
					    <li>Ingrese los nombres, apellidos, ge&eacute;nero y talleres en los que asistir&aacute; cada uno de sus integrantes del grupo.</li>
					    <li>Seleccione la opci&oacute;n Datos de Dep&oacute;sito.</li>
					    <li>Proporcione la informaci&oacute;n del dep&oacute;sito bancario.</li>
					    <li>Seleccione la opci&oacute;n Datos de facturaci&oacute;n (en caso de requerir factura) </li>
					    <li>Proporcione sus datos y presione el bot&oacute;n REGISTRAR.</li>
				      </ul>
				  </li>
					<li>El sistema generar&aacute; un n&uacute;mero de folio y le enviar&aacute; un correo electr&oacute;nico con sus datos.
				    <ul>
				      <li>Deber&aacute; presentar la forma impresa de este mensaje cuando asista al CNIIC-2008.</li>
			          <li>Es indispensable  llevar  la FICHA ORIGINAL del dep&oacute;sito bancario.</li>
				      <li>En caso de equivocaciones con su informaci&oacute;n tendr&aacute; que esperar hasta llegar al congreso para realizar los cambios.</li>
				    </ul>
				  </li>
				</ul>
			  </div>
			<div id="precios" class="Area">
				<h3>Elija su categor&iacute;a de usuario:</h3>
				<table width="700" border="0" align="center" cellpadding="5" cellspacing="0" id="tablePrice">
					<tr>
						<th width="110" align="right" valign="middle">&nbsp;</th>
						<th align="center" valign="middle"><p>Cuota hasta el 15 de abril </p></th>
						<th align="center" valign="middle"><p>Cuato desde el 16 de abril </p></th>
					</tr>
					<tr>
						<th align="right"><p>Inscripci&oacute;n</p></th>
						<td align="center" onClick="Seleccionar('2');" <? if($hoy > $lim) { echo 'class="disabled"'; } ?>><p>$ 4000.00 <br><input name="precios" id="p2" type="radio" value="4000-1" <? echo $antesDel_17; ?>></p></td>
						<td align="center" onClick="Seleccionar('3');" <? if($hoy < $lim) { echo 'class="disabled"'; } ?>><p>$ 4200.00 <br><input name="precios" id="p3" type="radio" value="4200-2" <? echo $despuesDel_17; ?>></p></td>
					</tr>
				</table>
			    <p>&nbsp;</p>
			    <p>&nbsp;</p>
			</div>
			<div id="talleres" class="Area">
			  <h3>Seleccione la(s) actividad(es) donde deseas participar: </h3>
			  <table border="0" align="center" cellpadding="10" cellspacing="0" style="border:1px solid #000000;">
				<tr class="taller">
					<td align="right"><p>Talleres</p></td>
					<td><p>$100.00</p></td>
				</tr>
				<tr class="seminario">
					<td align="right"><p>Seminarios</p></td>
					<td><p>$50.00</p></td>
				</tr>
				<!--tr class="ponencia">
					<td align="right">Ponencia</td>
					<td>$100.00</td>
				</tr>
				<tr class="conferencia">
					<td align="right">Conferencia</td>
					<td>$100.00</td>
				</tr>
				<tr class="tesis">
					<td align="right">Tesis</td>
					<td>$100.00</td>
				</tr>
				<tr class="videoconferencias">
					<td align="right">Videoconferencias</td>
					<td>$100.00</td>
				</tr-->
			</table>
			<p>&nbsp;</p>
			<ul class="checklist" id="listaActividades"><? $i=0; while($r = mysql_fetch_array($reg, MYSQL_ASSOC)){ 
				$strSQL = "SELECT count( i.id_actividad ) AS 'cupo_actual', a.cupo
							FROM actividades a
							LEFT JOIN inscripciones i ON a.id_actividad = i.id_actividad
							WHERE a.id_actividad = '".$r['id_actividad']."'
							GROUP BY i.id_actividad";
				$g = mysql_query($strSQL); $g = mysql_fetch_array($g, MYSQL_ASSOC); ?>
				<li><label class="<? echo strtolower($r['descripcion']); if(intval($g['cupo_actual']) > intval($g['cupo'])){ echo "_d"; }?>"><input id="b<? echo $i; ?>" name="talleres[]" type="checkbox" value="<? echo $r['id_actividad']; ?>" class="opcTaller" costo="<? echo $costos[strtolower($r['descripcion'])]; ?>" onClick="CalcularCosto();" <? if(intval($g['cupo_actual']) > intval($g['cupo'])) { echo 'disabled="disabled"'; } ?> />[<? echo strtoupper($r['descripcion']); ?>] <? echo $r['nombre']; if(intval($g['cupo_actual']) > intval($g['cupo'])) { echo " <b>[Cupo lleno]</b>"; } else { echo " <b>Disponibles: ".(intval($g['cupo'])-intval($g['cupo_actual']))."</b>"; } ?></label></li>
			<? $i++; } ?></ul>
			</div>
			<div id="registro" class="Area">
				<h3>Proporcione la siguiente informaci&oacute;n</h3>
				 <table width="100%" border="0" align="center" cellpadding="5" cellspacing="0"> 
					<tr>
					  <td colspan="2" bgcolor="#F3F3F3"><p class="centrar"><b>Los campos indicados con asterisco (*) son obligatorios.<br>
						Llene el formato utilizando may&uacute;sculas y min&uacute;sculas.</b><br>
						<b>El d&iacute;a del evento es indispensable llevar la ficha de dep&oacute;sito bancario.<br>
						Como escriba su nombre aparecer&aacute; en la constancia. </b></p>
				  	  </td>
					</tr>
					<tr> 
					  <td colspan="2"><p><b> Informaci&oacute;n del participante </b></p></td> 
					</tr> 
					<tr> 
					  <td align="right" valign="top"><p>Nombre</p></td> 
					  <td><table> 
						  <tr> 
							<td> <input name="titulo" type="text" size="10" maxlength="30"> </td> 
							<td> <input name="nombres" type="text" id="nombre*" size="20" maxlength="50" alt="Olvidaste escribir tú nombre." tab="registro"> </td> 
							<td align="center"><input name="apellidos" id="apellido*" type="text" size="20" maxlength="50" alt="Olvidaste escribir tú apellido." tab="registro"></td> 
						  </tr> 
						  <tr align="center"> 
							<td><p>T&iacute;tulo&nbsp;</p></td> 
							<td><p>Nombre<b>*</b></p></td> 
							<td><p>Apellidos<b>*</b></p></td>
						  </tr> 
						   
						</table>					  </td> 
					</tr>
					<tr>
						<td align="right" valign="top"><p>G&eacute;nero</p></td>
						<td><p>	<input name="genero" type="radio" value="M"> Masculino<br>
								<input name="genero" type="radio" value="F"> Femenino</p>
						</td>
					</tr>
					<tr> 
					  <td align="right"><p>Cargo</p></td> 
					  <td><select name="id_cargo" id="id_cargo"> 
						  <option value="0">Selecciona..</option>
						  <?php
						$strSQL = "SELECT * FROM cargos WHERE id_cargo < 3";
						$cargos = mysql_query($strSQL);
						while($cargo = mysql_fetch_array($cargos, MYSQL_ASSOC)){ ?>
							<option value="<?php echo $cargo['id_cargo'];?>"><?php echo $cargo['descripcion']; ?></option>
					<?php 	} ?>
					</select>	</td>
					</tr> 
					<tr> 
					  <td align="right"><p>T&iacute;tulo profesional </p></td> 
					  <td><input name="carrera" type="text" id="carrera" size="50" maxlength="50"></td> 
					</tr> 
					
					<tr> 
					  <td align="right" valign="top"><p>Nombre de Instituci&oacute;n<b>*</b></p></td> 
					  <td><select name="id_institucion" id="id_institucion*" onChange="VerificaInstitucion(this);" style="width:500px;" tab="registro" alt="Olvidaste seleccionar la institución a la que perteneces">
							  <option value="0">Selecciona...</option><?
						$strSQL = "SELECT * FROM instituciones";
						$reg = mysql_query($strSQL);
						while($r = mysql_fetch_array($reg, MYSQL_ASSOC)){ ?>
							<option value="<?php echo $r['id_institucion'];?>" title="<? echo HTML($r['nombre']); ?>"><?php echo $r['nombre']; ?></option>
						<? } ?>
							<option value="otro">Otro</option>
						   </select><br><input name="institucion" type="text" size="50" maxlength="100" style="display:none;" value="<? echo $u['institucion']; ?>" tab="registro"></td> 
					</tr> 
					<tr> 
					  <td align="right"><p>Campus, Facultad o Plantel</p></td> 
					  <td><input name="dependencia" type="text" id="dependencia" size="50" maxlength="100"></td>
					</tr> 
					<tr> 
					  <td align="right"><p>Entidad Federativa<b>*</b></p></td> 
					  <td><select name="id_entidadfederativa" id="estado*" alt="Olvidaste seleccionar tú entidad federativa." tab="registro">
						<option value="0">Selecciona..</option>
						<?php
						$strSQL = "SELECT * FROM estados";
						$estados = mysql_query($strSQL);
						while($estado = mysql_fetch_array($estados, MYSQL_ASSOC)){ ?>
							<option value="<?php echo $estado['id_entidadfederativa'];?>"><?php echo $estado['nombre']; ?></option>
					<?php } ?>
					  </select></td>
					</tr> 
					<tr> 
					  <td align="right"><p>Correo electr&oacute;nico*</p></td> 
					  <td><input name="correo" id="correo*" alt="Olvidaste proporcionar tu correo electrónico. Este campo es muy importante para que podamos comunicarnos contigo." type="text" size="50" maxlength="100" tab="registro"></td> 
					</tr> 
					<tr> 
					  <td align="right"><p>N&uacute;mero telef&oacute;nico</p></td> 
					  <td> <table> 
						  <tr> 
							<td> <input name="lada" type="text" size="10" maxlength="3"> </td> 
							<td> <input name="telefono" type="text" size="15" maxlength="10"> </td> 
							<td> <input name="extension" type="text" size="10" maxlength="6"> </td> 
						  </tr> 
						  <tr align="center"> 
							<td><p>Lada</p></td> 
							<td><p>Tel&eacute;fono&nbsp;</p></td> 
							<td><p>Extensi&oacute;n</p></td> 
						  </tr> 
						</table></td> 
					</tr>
			  </table>
			  </div>
				<div id="grupo" class="Area">
					<h3><b>Informaci&oacute;n del grupo (s&oacute;lo en caso de que registre a un grupo)</b></h3>
					<p>Cada participante de t&uacute; grupo inscrito  antes del 29 de Septiembre podr&aacute;s tener acceso a un seminario sin costo.</p>
					<table width="100%" border="0" align="center" cellpadding="0" cellspacing="0" id="grupos_usuarios">
						<tr> 
						  <td colspan="2">
							<table width="100%" border="0" align="center" cellpadding="3" cellspacing="0">
								<tr>
								  <th width="200"><p>Nombre</p></th> 
									<th width="200"><p>Apellidos</p></th> 
									<th width="200"><p>G&eacute;nero</p></th>
									<th width="200"></th>
									<th width="20"></th>
							  </tr>
							  <tbody id="tabla"></tbody>
							</table>
							<div class="centrar"><a href="#" onClick="togglearActGrupo(); AgregarFila(); CalcularCosto(); return false;"><img src="img/add.png" width="16" height="16" border="0">Agregar participante</a></div></td> 
						</tr>
				  </table>
				</div>
				<div id="deposito" class="Area">
					<? $strSQL = "SELECT * FROM depositos WHERE id_usuario = '".$u['id_usuario']."'";
					$reg = mysql_query($strSQL);
					$r = mysql_fetch_array($reg, MYSQL_ASSOC);
					$idDeposito = $r['id_deposito'];
					?>
					<h3><b>Informaci&oacute;n de dep&oacute;sito bancario (s&oacute;lo si ha realizado el pago)</b></h3>
					<table width="100%" border="0" align="center" cellpadding="5" cellspacing="0">
						<tr>
						  <td colspan="2" bgcolor="#F3F3F3"><p class="centrar"><b>Los campos indicados con asterisco (*) son obligatorios.<br>
Llene el formato utilizando may&uacute;sculas y min&uacute;sculas.</b><br>
<b>El d&iacute;a del evento es indispensable llevar la ficha de dep&oacute;sito bancario.<br>
Como escriba su nombre aparecer&aacute; en la constancia. </b><br>
						  </p></td>
						</tr>
						<tr>
							<td align="right" ><p>Ciudad donde se realiz&oacute; el dep&oacute;sito*</p></td>
							<td><input name="ciudad_dep" id="ciudad_dep*" type="text" size="30" maxlength="30" alt="Olvidaste especificar la ciudad donde se realizó el depósito." tab="deposito"></td>
						</tr>
						<tr>
							<td align="right"><p>N&uacute;mero de sucursal*</p></td>
							<td><input name="sucursal_dep" id="sucursal_dep*" type="text" size="30" maxlength="30" alt="Olvidaste especificar el número de la sucursal donde se realizó el depósito." tab="deposito"></td>
						</tr>
						<tr>
							<td align="right"><p>Fecha*</p></td>
							<td><script>DateInput('fecha_dep', true, 'YYYY-MM-DD'<? if($r['fecha'] != "") { echo ", '".$r['fecha']."'"; }?>)</script></td>
						</tr>
						<tr>
							<td align="right"><p>Hora*</p></td>
							<td><p><input name="hora_dep" id="hora_dep*" type="text" size="10" maxlength="5" alt="Olvidaste especificar la hora den se realizó el depósito." tab="deposito">
							(hh:mm) </p></td>
						</tr>
						<tr>
							<td align="right"><p>N&uacute;mero de referencia*</p></td>
							<td><input name="referencia_dep" id="referencia_dep*" type="text" size="10" maxlength="10" alt="Olvidaste especificar el número de referencia del depósito." tab="deposito"></td>
						</tr>
						<tr>
							<td align="right"><p>Monto*</p></td>
							<td><p>$<input name="monto" type="text" id="monto*" size="7" maxlength="7" alt="Olvidaste especificar el monto del depósito." tab="deposito">
							M.N. </p></td>
						</tr> 
				  </table>
				</div>
				<div id="factura" class="Area">
					<? $strSQL = "SELECT * FROM facturaciones WHERE id_usuario = '".$u['id_usuario']."'";
					$reg = mysql_query($strSQL);
					$r = mysql_fetch_array($reg, MYSQL_ASSOC);
					$idFacturacion = $r['id_facturacion']?>
					<h3><b>Informaci&oacute;n de facturaci&oacute;n (s&oacute;lo si requiere factura) </b></h3>
					<table border="0" align="center" cellpadding="5" cellspacing="0" width="100%">
						<tr>
						  <td colspan="2" bgcolor="#F3F3F3"><p class="centrar"><b>Los campos indicados con asterisco (*) son obligatorios.<br>
Llene el formato utilizando may&uacute;sculas y min&uacute;sculas.</b><br>
<b>El d&iacute;a del evento es indispensable llevar la ficha de dep&oacute;sito bancario.<br>
Como escriba su nombre aparecer&aacute; en la constancia. </b><br>
						  </p></td>
						</tr>
						<tr> 
						  <td align="right"><p>R.F.C.</p></td> 
						  <td><input name="rfc" id="rfc" type="text" size="30" maxlength="30" tab="factura"></td> 
						</tr>
						<tr> 
						  <td align="right" ><p>Raz&oacute;n social</p></td> 
						  <td><input name="razon" id="razon" type="text" size="50" maxlength="50" tab="factura"></td> 
						</tr> 
						<tr> 
						  <td><blockquote><p><b>Direcci&oacute;n Fiscal</b></p></blockquote></td> 
						  <td>&nbsp;</td> 
						</tr> 
						<tr> 
						  <td align="right"><p>Calle</p></td> 
						  <td><input name="calle" type="text" id="calle" size="50" maxlength="50" tab="factura"></td> 
						</tr> 
						<tr> 
						  <td align="right"><p>N&uacute;mero exterior</p></td> 
						  <td> <table> 
							  <tr> 
								<td><input name="num_ext" type="text" size="20" maxlength="10" tab="factura"></td> 
								<td>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</td> 
								<td align="center"><p>N&uacute;mero interior</p></td> 
								<td> <input name="num_int" type="text" size="20" maxlength="10" tab="factura"> </td> 
							  </tr> 
							</table></td> 
						</tr> 
						<tr> 
						  <td align="right"><p>Colonia</p></td> 
						  <td><input name="colonia" id="colonia" type="text" size="50" maxlength="50" tab="factura"></td> 
						</tr> 
						<tr> 
						  <td align="right"><p>Delegacion / Municipio</p></td> 
						  <td><input name="municipio" id="municipio" type="text" size="30" maxlength="30" tab="factura"></td> 
						</tr> 
						<tr> 
						  <td align="right"><p>Estado</p></td> 
						  <td><table border="0" cellspacing="0"> 
							  <tr> 
									<td><select name="id_entidadfederativaRFC" id="id_entidadfederativaRFC"  tab="factura">
									<option value="0">Selecciona..</option>
								<?php
							$strSQL = "SELECT * FROM estados ORDER BY nombre ASC";
							$tipos = mysql_query($strSQL);
							while($tipo = mysql_fetch_array($tipos, MYSQL_ASSOC)){ ?>
								<option value="<?php echo $tipo['id_entidadfederativa'];?>" <?php if($tipo['id_entidadfederativa']==$r['id_entidadfederativaRFC']) echo "SELECTED"; ?>><?php echo $tipo['nombre']; ?></option>
								<?php } ?>
							</select></td>
									<td><p style="margin-left:50px;">&nbsp;</p></td> 
								<td align="center"><p>C.P.</p></td> 
								<td><input name="codigo_postal" id="codigo_postal" type="text" size="20" maxlength="10" tab="factura"> </td> 
							  </tr> 
							</table></td> 
						</tr>
				  </table>
			  </div>
			</div>
		<p align="center">
			<? if(isset($_GET['reg'])) { ?>
			<input type="checkbox" name="acepto" id="acepto" value="1">He le&iacute;do las instrucciones y confirmo que la informaci&oacute;n proporcionada es real.<br>
		    <input name="ready" type="checkbox" id="ready" value="1" onClick="togglearSubmit();">Estoy listo para registrarme.</p>
		<p align="center" style="height:30px;">
			<input type="submit" value="Registrar" style="display:none;" id="submit">
			<input type="hidden" name="accion" value="registro" />
			<? } ?>
			<input name="costototal" id="h_costototal" type="hidden">
		</p>
		<p align="center"><a href="index.php">Regresar a las opciones </a></p>
		</form>
		<!-- InstanceEndEditable --></td>
		<td background="img/borde_der2.jpg">&nbsp;</td>
	</tr>
	<tr>
		<td><img src="img/borde_inf_izq.jpg" width=21 height=16 /></td>
		<td style="background-repeat:repeat-x" background="img/borde_inf.jpg" colspan=3><img src="img/borde_inf.jpg" width=686 height=16 /></td>
		<td><img src="img/borde_inf_der.jpg" width=22 height=16 /></td>
	</tr>
	<tr>
		<td></td>
		<td colspan=3><p class="PiePagina">ANIEI&reg; <? echo date("Y"); ?> </p></td>
		<td></td>
	</tr>
</table>
</body>
<!-- InstanceEnd --></html>
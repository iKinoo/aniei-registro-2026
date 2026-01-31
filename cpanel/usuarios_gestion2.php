<?php
	session_start();
	if(!isset($_SESSION['logginuser']) || $_SESSION['logginuser'] != 1){ header("Location: index.php"); }
	include("../funciones/basedatos.php");
	include("../funciones/funciones.php");
	$conn = Conectar();
	 
	if($_SERVER['REQUEST_METHOD'] == "POST"){
	 	if($_POST['accion'] == "agregar"){
			//echo nl2br(print_r($_POST, true)); die();
			$strSQL = "INSERT INTO usuarios
						VALUES (null,
						'',
						'".$_POST['titulo']."', 
						'".trim($_POST['nombres'])."', 
						'".trim($_POST['apellidos'])."',
						'".$_POST['id_cargo']."', 
						'".$_POST['id_tipo']."', 
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
						'')";
			mysql_query($strSQL);
			$idUsuario = mysql_insert_id();
			$folio = "A".str_pad($idUsuario, 5, "0", STR_PAD_LEFT);
			$strSQL = "UPDATE usuarios SET folio_recibo = '".$folio."' WHERE id_usuario = ".$idUsuario;
			mysql_query($strSQL);
			
			/****************************************************************/
			/************************* G R U P O ****************************/
			/****************************************************************/
			$t = count($_POST['grupo_nombre']);
			for ($i=0; $i<$t; $i++){				  		
				if (trim($_POST['grupo_nombre'][$i]) != "" && trim($_POST['grupo_apellido'][$i]) != ""){
					$strSQL = "INSERT INTO usuarios
								VALUES (null,
								'',
								'', 
								'".trim($_POST['grupo_nombre'][$i])."', 
								'".trim($_POST['grupo_apellido'][$i])."',
								'0', 
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
								'".$idUsuario."',
								'', 
								'".$_POST['grupo_genero'][$i]."',
								'')";
					mysql_query($strSQL);
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
			
			$txt = "Gracias por participar en el Congreso de la ANIEI. Los datos proporcionados han sido procesados. Para cualquier aclaración a continuación le proporcionamos su número de registro.";
			$html = "<p>racias por participar en el Congreso de la ANIEI. Los datos proporcionados han sido procesados. Para cualquier aclaraci&oacute;n a continuaci&oacute;n le proporcionamos su n&uacute;mero de registro.</p>";
			$asunto = "Congreso ANIEI - Preinscripción";
			$mensaje = "Tu clave de preinscripción es: ".$id."\nGuárdala para cualquier aclaración.";
			$nombre_destino = $nombre." ".$apellido;
			$correo_destino = $correo;
			$nombre_fuente = "Congreso ANIEI";
			$correo_fuente = "congreso@aniei.org.mx";
			EnviarMail($nombre_destino, $correo_destino, $nombre_fuente, $correo_fuente, $txt, $html, $asunto); 
			header("location: ".$_SERVER['PHP_SELF']."?accion=agregar");
		}
		
		if($_POST['accion'] == "modificar"){
			$strSQL = "UPDATE usuarios 
						SET titulo = '".trim($_POST['titulo'])."', 
							nombre = '".trim($_POST['nombres'])."', 
							apellido = '".trim($_POST['apellidos'])."',
							id_cargo = '".$_POST['id_cargo']."', 
							id_tipo = '".$_POST['id_tipo']."', 
							carrera = '".trim($_POST['carrera'])."',
							id_institucion = '".$_POST['id_institucion']."', 
							institucion = '".trim($_POST['institucion'])."', 
							dependencia = '".trim($_POST['dependencia'])."', 
							id_entidadfederativa = '".$_POST['id_entidadfederativa']."', 
							correo = '".trim($_POST['correo'])."', 
							lada = '".trim($_POST['lada'])."', 
							telefono = '".trim($_POST['telefono'])."', 
							extension = '".trim($_POST['extension'])."', 
							codigo_barras = '".trim($_POST['codBarras'])."', 
							genero = '".$_POST['genero']."' 
						WHERE id_usuario = '".$_POST['id_usuario']."'";
			mysql_query($strSQL);
		
			/****************************************************************/
			/************************* G R U P O ****************************/
			/****************************************************************/		
			$hijos = count($_POST['grupoA']);
			for($i=0; $i<$hijos; $i++){
				if (trim($_POST['grupoA_nombre'][$i]) != "" && trim($_POST['grupoA_apellido'][$i]) != ""){
					$strSQL = "UPDATE usuarios
								SET nombre = '".trim($_POST['grupoA_nombre'][$i])."', 
									apellido = '".trim($_POST['grupoA_apellido'][$i])."', 
									carrera = '".trim($_POST['carrera'])."',
									id_institucion = '".$_POST['id_institucion']."', 
									institucion = '".trim($_POST['institucion'])."', 
									dependencia = '".trim($_POST['dependencia'])."', 
									id_entidadfederativa = '".$_POST['id_entidadfederativa']."', 
									genero = '".$_POST['grupoA_genero'][$i]."' 
								WHERE id_usuario = '".$_POST['grupoA'][$i]."'";
					mysql_query($strSQL);
				}
			}
			/****************************************************************/
			/*********************** F A C T U R A **************************/
			/****************************************************************/
			if($_POST['id_facturacion'] != "") {
				$strSQL="UPDATE facturaciones 
							SET razon  =  '".$_POST['razon']."',
								rfc = '".$_POST['rfc']."', 
								calle = '".$_POST['calle']."', 
								exterior = '".$_POST['num_ext']."', 
								interior = '".$_POST['num_int']."', 
								colonia = '".$_POST['colonia']."', 
								municipio = '".$_POST['municipio']."', 
								id_entidadfederativaRFC = '".$_POST['id_entidadfederativaRFC']."', 
								codigo_postal = '".$_POST['codigo_postal']."' 
							WHERE id_facturacion = '".$_POST['id_facturacion']."'";
				mysql_query($strSQL);
			} else {
				if ($_POST['rfc'] != ""){
					$strSQL = "INSERT INTO facturaciones 
								VALUES(null,
								'".$_POST['id_usuario']."',
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
			}
		
			/****************************************************************/
			/********************** D E P O S I T O *************************/
			/****************************************************************/
			if($_POST['id_deposito'] != "") {
				$strSQL="UPDATE depositos 
							SET ciudad = '".trim($_POST['ciudad_dep'])."', 
								sucursal = '".trim($_POST['sucursal_dep'])."', 
								fecha = '".trim($_POST['fecha_dep'])."', 
								hora = '".trim($_POST['hora_dep'])."', 
								referencia = '".trim($_POST['referencia_dep'])."', 
								monto = '".trim($_POST['monto'])."' 
							WHERE id_deposito = '".$_POST['id_deposito']."'";
				mysql_query($strSQL);
			} else {
				if ($_POST['monto'] != ""){
					$strSQL = "INSERT INTO depositos 
								VALUES(null, 
								'".$_POST['id_usuario']."',
								'".trim($_POST['ciudad_dep'])."', 
								'".trim($_POST['sucursal_dep'])."', 
								'".trim($_POST['fecha_dep'])."', 
								'".trim($_POST['hora_dep'])."', 
								'".trim($_POST['referencia_dep'])."', 
								'".trim($_POST['monto'])."')";
					mysql_query($strSQL);
				}
			}
			header("location: usuarios_gestion.php");
		}
	 }

	if($_GET['accion'] == "modificar"){
		$strSQL = "SELECT * FROM usuarios WHERE id_usuario='".$_GET['id_usuario']."'";
		$usuario = mysql_query($strSQL);
		$u = mysql_fetch_array($usuario, MYSQL_ASSOC);
		//echo nl2br(print_r($u, true));
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
<script language="javascript" type="text/javascript" src="../js/funciones.js"></script>
<script language="javascript" type="text/javascript" src="../js/formulario.js"></script>
<script language="javascript" type="text/javascript" src="../js/jquery.js"></script>
<script language="javascript" type="text/javascript" src="../js/getElementsBySelector.js"></script>
<script language="javascript" type="text/javascript" src="../js/calendarDateInput/calendarDateInput.js"></script>
<script language="javascript" type="text/javascript" src="../js/dinamycList.js"></script>
<script language="javascript" type="text/javascript" src="../js/validaciones.js"></script>
<script language="javascript" type="text/javascript">
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
	
		if(ValidaForm(f)){
			if(Select.value == "0"){
				alert("Debes seleccionar una institución.")
				Select.focus();
				return false;
			} else {
				if(Select.value == "otro" && trim(Input.value) == ""){
					alert("Olvidaste proporciona el nombre de la Institución a la que pertenece el usuario.");
					Input.focus();
					return false;
				}
			}
			return Validar2(f);
		} else {
			return false;
		}
	}
	
	function Togglear(id){
		$("#"+id).toggle('slow');
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
<form action="<? echo $_SERVER['../PHP_SELF']; ?>" method="post" name="form1" id="form1" onSubmit="return Validar(this);"> 
  <table border="0" align="center" cellpadding="5" cellspacing="0"> 
    <tr>
      <td colspan="2" bgcolor="#F3F3F3"><p class="centrar"><b>Los campos indicados con asterisco (*) son obligatorios.<br>
      	Llene el formato utilizando may&uacute;sculas y min&uacute;sculas.</b><br>
      	<b>El d&iacute;a del evento deber&aacute; traer la copia del dep&oacute;sito bancario. </b></p></td>
    </tr>
    <tr> 
      <td colspan="2"><p><b> Informaci&oacute;n del participante </b></p></td> 
    </tr> 
    <tr> 
      <td align="right" valign="top"><p>Nombre</p></td> 
      <td><table> 
          <tr> 
            <td> <input name="titulo" type="text" value="<?php echo $u['titulo']; ?>" size="10" maxlength="30"> </td> 
            <td> <input name="nombres" type="text" id="nombre*" value="<?php echo $u['nombre']; ?>" size="20" maxlength="50" alt="Olvidaste escribir el nombre del participante."> </td> 
            <td align="center"><input name="apellidos" id="apellido*" type="text" value="<?php echo $u['apellido']; ?>" size="20" maxlength="50" alt="Olvidaste escribir el apellido del participante."></td> 
          </tr> 
          <tr align="center"> 
            <td><p>T&iacute;tulo&nbsp;</p></td> 
            <td><p>Nombre<b>*</b></p></td> 
            <td><p>Apellidos<b>*</b></p></td>
          </tr> 
           
        </table>
			<p style="margin-top:0px;"><? if($_GET['accion'] == "modificar"){?>
			<br>Identificador: <?php echo $id; ?><br>
				Folio: <?php echo str_pad($u['iFolioRecibo'],5,"0", STR_PAD_LEFT); ?><br>
				Código de barra: <?php echo $u['codigo_barras']; ?></p>
			<? } ?>		</td> 
    </tr>
    <?php if($u['grupo']!="1" && $_GET['accion'] == "modificar"){?>
    <tr>
    	<td align="right" valign="top"><p>Titular</p></td>
    	<td><p>Editar 
    		<input name="check_editar" type="checkbox" id="check_editar" value="checkbox" onMouseUp="ActivaTitular(document.individual);">
    			<select name="titular" id="titular" disabled="disabled">
    				<option value="ninguno" selected="selected">NINGUNO</option>			
    					<?php $strSQL = "SELECT * FROM usuarios WHERE grupo='1' AND id_asistente!='".$id."'";
			$y = mysql_query($strSQL);
			while ($yy = mysql_fetch_array($y, MYSQL_ASSOC)){ ?>
    				<option value="<?php echo $yy['id_asistente']; ?>" <?php if($u['padre']==$yy['id_asistente']) {echo "SELECTED"; $nnnn=$yy['nombre']." ".$yy['apellido']; } ?>><?php echo $yy['nombre']." ".$yy['apellido']; ?></option>
    					<?php } ?>
				</select>
    			<br>
    			Default: 
    			<span class="Estilo"><?php if($nnnn!="") echo $nnnn; else echo "Ninguno"; ?></span></p>    		</td>
    	</tr>
	<?php } ?>
    <tr>
		<td align="right" valign="top"><p>G&eacute;nero</p></td>
    	<td><p>
				<input name="genero" type="radio" value="M" <?php if($u['genero'] == "M") echo "checked" ?>> Masculino<br>
				<input name="genero" type="radio" value="F" <?php if($u['genero'] == "F") echo "checked" ?>> Femenino</p></td>
    	</tr> 
    <tr> 
      <td align="right"><p>Tipo<b>*</b></p></td> 
      <td>
      <select name="id_tipo" id="tipo*" alt="Olvidaste seleccionar el tipo de participante.">
	  <option value="0">Selecciona..</option>
	<?php
		$strSQL = "SELECT * FROM tipousuario";
		$tipos = mysql_query($strSQL);
		while($tipo = mysql_fetch_array($tipos, MYSQL_ASSOC)){ ?>
			<option value="<?php echo $tipo['id_tipo'];?>" <?php if($tipo['id_tipo'] == $u['id_tipo']) echo "selected"; ?>><?php echo $tipo['descripcion']; ?></option>
	<?php } ?>
      	</select>      </td> 
    </tr> 
    <tr> 
      <td align="right"><p>Cargo</p></td> 
      <td><select name="id_cargo" id="id_cargo"> 
	      <option value="0">Selecciona..</option>
          <?php
		$strSQL = "SELECT * FROM cargos";
		$cargos = mysql_query($strSQL);
		while($cargo = mysql_fetch_array($cargos, MYSQL_ASSOC)){ ?>
			<option value="<?php echo $cargo['id_cargo'];?>" <?php if($cargo['id_cargo'] == $u['id_cargo']) echo "SELECTED"; ?>><?php echo $cargo['descripcion']; ?></option>
	<?php 	} ?>
	</select>	</td>
    </tr> 
    <tr> 
      <td align="right"><p>T&iacute;tulo profesional </p></td> 
      <td><input name="carrera" type="text" id="carrera" value="<?php echo $u['carrera']; ?>" size="50" maxlength="50"></td> 
    </tr> 
    
    <tr> 
      <td align="right" valign="top"><p>Nombre de Instituci&oacute;n<b>*</b></p></td> 
      <td><select name="id_institucion" id="id_institucion" onChange="VerificaInstitucion(this);" style="width:500px;">
			  <option value="0">Selecciona...</option><?
	    $strSQL = "SELECT * FROM instituciones";
		$reg = mysql_query($strSQL);
		while($r = mysql_fetch_array($reg, MYSQL_ASSOC)){ ?>
			<option value="<?php echo $r['id_institucion'];?>" <?php if($r['id_institucion'] == $u['id_institucion']) echo "selected "; ?> title="<? echo HTML($r['nombre']); ?>"><?php echo $r['nombre']; ?></option>
	    <? } ?>
			<option value="otro">Otro</option>
	       </select><br><input name="institucion" type="text" size="50" maxlength="100" style="display:none;" value="<? echo $u['institucion']; ?>"></td> 
    </tr> 
    <tr> 
      <td align="right"><p>Campus, Facultad o Plantel</p></td> 
      <td><input name="dependencia" type="text" id="dependencia" value="<?php echo $u['dependencia'];?>" size="50" maxlength="100"></td>
    </tr> 
    <tr> 
      <td align="right"><p>Entidad Federativa<b>*</b></p></td> 
      <td><select name="id_entidadfederativa" id="estado*" alt="Olvidaste seleccionar la entidad federativa del participante.">
	    <option value="0">Selecciona..</option>
        <?php
		$strSQL = "SELECT * FROM estados";
		$estados = mysql_query($strSQL);
		while($estado = mysql_fetch_array($estados, MYSQL_ASSOC)){ ?>
			<option value="<?php echo $estado['id_entidadfederativa'];?>" <?php if($estado['id_entidadfederativa'] == $u['id_entidadfederativa']) echo "SELECTED"; ?>><?php echo $estado['nombre']; ?></option>
	<?php } ?>
      </select></td>
    </tr> 
    <tr> 
      <td align="right"><p>Correo electr&oacute;nico</p></td> 
      <td><input name="correo" type="text" value="<?php echo $u['correo'];?>" size="50" maxlength="100"></td> 
    </tr> 
    <tr> 
      <td align="right"><p>N&uacute;mero telef&oacute;nico</p></td> 
      <td> <table> 
          <tr> 
            <td> <input name="lada" type="text" value="<?php echo $u['lada'];?>" size="10" maxlength="3"> </td> 
            <td> <input name="telefono" type="text" value="<?php echo $u['telefono'];?>" size="15" maxlength="10"> </td> 
            <td> <input name="extension" type="text" value="<?php echo $u['extension'];?>" size="10" maxlength="6"> </td> 
          </tr> 
          <tr align="center"> 
            <td><p>Lada</p></td> 
            <td><p>Tel&eacute;fono&nbsp;</p></td> 
            <td><p>Extensi&oacute;n</p></td> 
          </tr> 
        </table></td> 
    </tr>
	</table>
	<p onClick="Togglear('tGrupo');" class="manita" title="Clic para mostrar u ocultar"><img src="../img/flecha_abajo.gif" width="16" height="11">&nbsp;&nbsp;<b>Informaci&oacute;n del grupo (s&oacute;lo en caso de que registre a un grupo)</b></p>
<table border="0" align="center" cellpadding="5" cellspacing="0" id="tGrupo" style="display:none1;">
		<tr> 
		  <td colspan="2">
			<table border="0" align="center" cellpadding="3" cellspacing="0">
				<tr>
					<th><p>Nombre</p></th> 
					<th><p>Apellidos</p></th> 
					<th>G&eacute;nero</th>
					<th></th>
			  </tr>
			  <tbody id="tabla"><? if($_GET['accion'] == "modificar"){
			  $strSQL = "SELECT id_usuario, nombre, apellido, genero FROM usuarios WHERE grupo_padre = '".$_GET['id_usuario']."'";
			  $reg = mysql_query($strSQL); $i = 0;
			  if(mysql_num_rows($reg) > 0){ 
			  	while($r = mysql_fetch_array($reg, MYSQL_ASSOC)){?>
			  <tr>
			  	<td><input type="text" name="grupoA_nombre[]" id="grupoA_nombre<? echo $i; ?>*" value="<? echo $r['nombre']; ?>" alt="Olvidaste escribir un NOMBRE de un elemento del grupo."></td>
				<td><input type="text" name="grupoA_apellido[]" id="grupoA_apellido<? echo $i; ?>*" value="<? echo $r['apellido']; ?>" alt="Olvidaste escribir un APELLIDO de un elemento del grupo."></td>
				<td><select name="grupoA_genero[]" id="grupoA_genero[]*" alt="Olvidaste seleccionar el GÉNERO de un elemento del grupo.">
					  <option value="0" selected="selected">Elija</option>
					  <option value="M" <? if($r['genero'] == "M"){ echo 'selected="selected"'; } ?>>Masculino</option>
					  <option value="F" <? if($r['genero'] == "F"){ echo 'selected="selected"'; } ?>>Femenino</option>
				  </select>
				  <input type="hidden" value="<? echo $r['id_usuario']; ?>" name="grupoA[]" />
				</td>
				<td><a href="#" onClick="return BorrarFila(this);" title="Eliminar usuario"><img src="../img/eliminar.png" width="16" height="16" border="0"></a></td>
			  </tr>
			  <? } } } ?></tbody>
			</table>
			<div class="centrar"><a href="javascript:AgregarFila()"><img src="../img/add.png" width="16" height="16" border="0">Agregar participante</a></div></td> 
		</tr>
	</table>
    <? $strSQL = "SELECT * FROM depositos WHERE id_usuario = '".$u['id_usuario']."'";
	$reg = mysql_query($strSQL);
	$r = mysql_fetch_array($reg, MYSQL_ASSOC);
	$idDeposito = $r['id_deposito'];
    ?>
	<p onClick="Togglear('tDeposito');" class="manita" title="Clic para mostrar u ocultar"><img src="../img/flecha_abajo.gif" width="16" height="11">&nbsp;&nbsp;<b>Informaci&oacute;n de dep&oacute;sito bancario (s&oacute;lo si ha realizado el pago) </b></p>
	<table border="0" cellpadding="5" cellspacing="0" id="tDeposito" style="display:none;">
    <tr>
		<td align="right" ><p>Ciudad donde se realiz&oacute; el dep&oacute;sito</p></td>
    	<td><input name="ciudad_dep" id="ciudad_dep" type="text" value="<?php echo $r['ciudad']; ?>" size="30" maxlength="30"></td>
    </tr>
    <tr>
		<td align="right"><p>N&uacute;mero de sucursal</p></td>
    	<td><input name="sucursal_dep" id="sucursal_dep" type="text" value="<?php echo $r['sucursal']; ?>" size="30" maxlength="30"></td>
    </tr>
    <tr>
		<td align="right"><p>Fecha</p></td>
    	<td><script>DateInput('fecha_dep', true, 'YYYY-MM-DD'<? if($r['fecha'] != "") { echo ", '".$r['fecha']."'"; }?>)</script></td>
    </tr>
    <tr>
		<td align="right"><p>Hora</p></td>
    	<td><p><input name="hora_dep" id="hora_dep" type="text" value="<?php if($r['hora']!="00:00:00") echo substr($r['hora'],0,5); ?>" size="10" maxlength="5"> (hh:mm) </p></td>
    </tr>
    <tr>
		<td align="right"><p>N&uacute;mero de referencia </p></td>
    	<td><input name="referencia_dep" id="referencia_dep" type="text" value="<?php echo $r['referencia']; ?>" size="10" maxlength="10"></td>
    </tr>
    <tr>
		<td align="right"><p>Monto</p></td>
    	<td><p>$<input name="monto" type="text" id="monto" value="<?php if($r['monto'] != "") echo vsprintf("%.2f", $r['monto']); ?>" size="7" maxlength="7">M.N. </p></td>
    </tr> 
	</table>
	<? $strSQL = "SELECT * FROM facturaciones WHERE id_usuario = '".$u['id_usuario']."'";
	$reg = mysql_query($strSQL);
	$r = mysql_fetch_array($reg, MYSQL_ASSOC);
	$idFacturacion = $r['id_facturacion']?>
	<p onClick="Togglear('tRFC');" class="manita" title="Clic para mostrar u ocultar"><img src="../img/flecha_abajo.gif" width="16" height="11">&nbsp;&nbsp;<b>Informaci&oacute;n para facturar (s&oacute;lo si requiere factura, proporcione todos los siguientes datos) </b></p>
	<table border="0" cellpadding="5" cellspacing="0" id="tRFC" style="display:none;">
		<tr> 
		  <td align="right"><p>R.F.C.</p></td> 
		  <td><input name="rfc" id="rfc" type="text" value="<?php echo $r['rfc'];?>" size="30" maxlength="30"></td> 
		</tr>
		<tr> 
		  <td align="right" ><p>Raz&oacute;n social</p></td> 
		  <td><input name="razon" id="razon" type="text" value="<?php echo $r['razon']; ?>" size="50" maxlength="50"></td> 
		</tr> 
		<tr> 
		  <td><blockquote><p><b>Direcci&oacute;n Fiscal</b></p></blockquote></td> 
		  <td>&nbsp;</td> 
		</tr> 
		<tr> 
		  <td align="right"><p>Calle</p></td> 
		  <td><input name="calle" type="text" id="calle" value="<?php echo $r['calle']; ?>" size="50" maxlength="50"></td> 
		</tr> 
		<tr> 
		  <td align="right"><p>N&uacute;mero exterior</p></td> 
		  <td> <table> 
			  <tr> 
				<td><input name="num_ext" id="*" type="text" value="<?php echo $r['exterior']; ?>" size="20" maxlength="10"></td> 
				<td>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</td> 
				<td align="center"><p>N&uacute;mero interior</p></td> 
				<td> <input name="num_int" type="text" value="<?php echo $r['interior']; ?>" size="20" maxlength="10"> </td> 
			  </tr> 
			</table></td> 
		</tr> 
		<tr> 
		  <td align="right"><p>Colonia</p></td> 
		  <td><input name="colonia" id="colonia" type="text" value="<?php echo $r['colonia']; ?>" size="50" maxlength="50"></td> 
		</tr> 
		<tr> 
		  <td align="right"><p>Delegacion / Municipio</p></td> 
		  <td><input name="municipio" id="municipio" type="text" value="<?php echo $r['municipio']; ?>" size="30" maxlength="30"></td> 
		</tr> 
		<tr> 
		  <td align="right"><p>Estado</p></td> 
		  <td><table border="0" cellspacing="0"> 
			  <tr> 
					<td><select name="id_entidadfederativaRFC" id="id_entidadfederativaRFC">
					<option value="0">Selecciona..</option>
				<?php
			$strSQL = "SELECT * FROM estados ORDER BY nombre ASC";
			$tipos = mysql_query($strSQL);
			while($tipo = mysql_fetch_array($tipos, MYSQL_ASSOC)){ ?>
				<option value="<?php echo $tipo['id_entidadfederativa'];?>" <?php if($tipo['id_entidadfederativa']==$r['id_entidadfederativaRFC']) echo "SELECTED"; ?>><?php echo $tipo['nombre']; ?></option>
				<?php } ?>
			</select></td>
					<td>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</td> 
				<td align="center"><p>C.P.</p></td> 
				<td><input name="codigo_postal" id="codigo_postal" type="text" value="<?php echo $r['codigo_postal']; ?>" size="20" maxlength="10"> </td> 
			  </tr> 
			</table></td> 
		</tr>
  </table> 
  <p align="center" class="centrar">
    <input name="padre" type="hidden" id="padre" value="<? echo $u['grupo_padre']; ?>">
    <input name="accion" type="hidden" id="accion" value="<? echo $_GET['accion']; ?>">
  	<input name="id_usuario" type="hidden" id="id_usuario" value="<?php echo $_GET['id_usuario']; ?>">
  	<input name="id_deposito" type="hidden" id="id_deposito" value="<? echo $idDeposito; ?>">
  	<input name="id_facturacion" type="hidden" id="id_facturacion" value="<? echo $idFacturacion; ?>">
	<input name="Enviar" type="submit" value="Guardar" style="width:150px;"></p>
  <p align="center" class="centrar"><a href="panel_control.php">Panel de Control </a></p>
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
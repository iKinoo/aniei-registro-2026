<?php
	session_start();
	if(!isset($_SESSION['logginuser']) ){ header("Location: index.php"); }	
	include("../funciones/basedatos.php");
	include("../funciones/funciones.php");
	$conn = Conectar();
?>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd"><html><!-- InstanceBegin template="/Templates/aniei.dwt.php" codeOutsideHTMLIsLocked="false" -->
<head>
<title>:: ANIEI <? echo date("Y"); ?>::</title>
<meta http-equiv="Content-Type" content="text/html; charset=iso-8859-1" />
<link rel="stylesheet" type="text/css" href="../css/body.css">
<link rel="stylesheet" type="text/css" href="../css/exclusivo.css">
<!-- InstanceBeginEditable name="head" -->
<link href="../css/exclusivo.css" rel="stylesheet" type="text/css">
<script language="javascript" type="text/javascript" src="../js/funciones.js"></script>
<script language="javascript" type="text/javascript" src="../js/formulario.js"></script>
<script language="javascript" type="text/javascript" src="../js/validaciones.js"></script>
<script language="javascript" type="text/javascript" src="../js/calendarDateInput/calendarDateInput.js"></script>
<script language="javascript" type="text/javascript">
	function VerificaInstitucion(i){
		if(i.value == "otro"){
			document.getElementById("institucion").style.display = "inline";
		} else {
			document.getElementById("institucion").style.display = "none";
		}
	}
	
	function Validar(f){
		var instSelect = document.getElementById("iidinstitucion");
		var instInput = document.getElementById("institucion");
		
		if(instSelect.value == "0"){
			alert("Debes seleccionar una institución.")
			instSelect.focus();
			return false;
		} else {
			if(instSelect.value == "otro" && trim(instInput.value) == ""){
				alert("Olvidaste proporciona el nombre de la Institución a la que pertenece el usuario.");
				instInput.focus();
				return false;
			}
		}
		
		if(validarIndividual(f)){
			return ValidaForm(f);
		} else {
			return false;
		}
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
<p align="center"><b>Inscripci&oacute;n individual </b></p>
<form action="agregarUsuario.php" method="post" name="form1" id="form1" onSubmit="return Validar(this);"> 
  <table border="0" align="center" cellpadding="5" cellspacing="0"> 
    <tr>
      <td colspan="2" bgcolor="#F3F3F3"><p class="centrar"><b>Los campos indicados con asterisco (*) son obligatorios.<br>
      	Llene el formato utilizando may&uacute;sculas y min&uacute;sculas.</b><br>
      	<b>El d&iacute;a del evento deber&aacute; traer la copia del dep&oacute;sito bancario. </b></p></td>
    </tr>
    <tr> 
      <td colspan="2"><b>A) Informaci&oacute;n del participante </b></td> 
    </tr> 
    <tr>
    	<td align="right">C&oacute;digo de barras </td>
    	<td><input name="codBarras" type="text" id="codBarras" size="20" maxlength="30"></td>
    	</tr>
    <tr> 
      <td align="right" valign="top">Nombre</td> 
      <td><table> 
          <tr> 
            <td><input name="titulo" type="text" size="10" maxlength="30"></td> 
            <td><input name="nombre" type="text" id="nombre*" size="20" maxlength="50" alt="Olvidaste escribir el nombre del usuario."></td> 
            <td><input name="apellido" id="apellido*" type="text" size="20" maxlength="50" alt="Olvidaste escribir el apellido del usuario"></td> 
          </tr> 
          <tr align="center"> 
            <td>&nbsp;&nbsp;&nbsp;T&iacute;tulo&nbsp;</td> 
            <td> Nombre<b>*</b></td> 
            <td>Apellidos<b>*</b></td> 
          </tr> 
           <!--
              <tr><b>
			<input name="verifico" type="checkbox" id="verifico" value="1">
			Verific&oacute;</b></tr> --> 
        </table></td> 
    </tr><!--
    </tr>
     <td align="right">Folio</td><td>&nbsp;</td><td> <input name="folio" type="text" size="4" maxlength="4"> </td></tr>
  -->

    <tr>
		<td align="right" valign="top">G&eacute;nero</td>
    	<td>
    		<input name="genero" type="radio" value="1" checked> Masculino<br>
    		<input name="genero" type="radio" value="0"> Femenino
		</td>
    </tr> 
    <tr> 
      <td align="right">Tipo<b>*</b></td> 
      <td>
		<select name="tipo" id="tipo*" alt="Debes seleccionar el tipo de usuario.">
		<option value="0">Selecciona..</option>
		<?php
		$strSQL = "SELECT * FROM tipousuario";
		$tipos = mysql_query($strSQL);
		while($tipo = mysql_fetch_array($tipos, MYSQL_ASSOC)){ ?>
			<option value="<?php echo $tipo['id_tipo'];?>"><?php echo $tipo['descripcion']; ?></option>
		<?php } ?>
		</select></td> 
    </tr> 
    <tr> 
      <td align="right">Cargo*</td> 
      <td><select name="cargo" id="cargo*" alt="Debes seleccionar el cargo para este usuario."> 
	      <option value="">Selecciona..</option>
          <?php
		$strSQL = "SELECT * FROM cargos";
		$tipos = mysql_query($strSQL);
		while($tipo = mysql_fetch_array($tipos, MYSQL_ASSOC)){ ?>
			<option value="<?php echo $tipo['id_cargo'];?>"><?php echo $tipo['descripcion']; ?></option>
	<?php } ?>
	</select>	</td>
    </tr> 
    <tr> 
      <td align="right">T&iacute;tulo profesional </td> 
      <td><input name="carrera" type="text" size="50" maxlength="50"></td> 
    </tr> 
    <tr> 
      <td align="right">Tipo de Instituci&oacute;n</td> 
      <td><b><input name="tipins" type="checkbox" id="tipins"  value="1" onClick="javascript:verificaSocio(this.checked)">Socio Aniei</b></td> 
    </tr> 
    <tr> 
      <td align="right" valign="top">Nombre de Instituci&oacute;n<b>*</b></td> 
      <td><select name="iidinstitucion" id="iidinstitucion" onChange="VerificaInstitucion(this);" style="width:500px;">
			<option value="0" selected="selected">Selecciona...</option> 
			<? $strSQL = "SELECT * FROM instituciones";
			$tipos = mysql_query($strSQL);
			while($tipo = mysql_fetch_array($tipos, MYSQL_ASSOC)){ ?>
			<option value="<?php echo $tipo['id_institucion'];?>" title="<? echo HTML($tipo['nombre']); ?>"><? echo HTML($tipo['nombre']); ?></option>
			<? } ?>
			<option value="otro">Otro</option>
		</select><br>
		<input name="institucion" id="institucion" type="text" size="50" maxlength="100" style="display:none;"></td> 
    </tr> 
    <tr> 
      <td align="right">Campus, Facultad o Plantel</td> 
      <td><input name="facultad" type="text" size="50" maxlength="100"></td> 
    </tr> 
    <tr> 
      <td align="right">Entidad Federativa*</td> 
      <td><select name="estado" id="estado*" alt="Debes seleccionar la entidad federativa del usuario.">
	      <option value="">Selecciona..</option>
        <?php
		$strSQL = "SELECT * FROM estados";
		$tipos = mysql_query($strSQL);
		while($tipo = mysql_fetch_array($tipos, MYSQL_ASSOC)){ ?>
			<option value="<?php echo $tipo['id_estado'];?>"><?php echo $tipo['nombre']; ?></option>
	<?php } ?>
      </select></td>
    </tr> 
    <tr> 
      <td align="right">Correo electr&oacute;nico</td> 
      <td><input name="correo" type="text" size="50" maxlength="100"></td> 
    </tr> 
    <tr> 
      <td align="right">N&uacute;mero telef&oacute;nico</td> 
      <td> <table> 
          <tr> 
            <td> <input name="lada" type="text" size="10" maxlength="3"> </td> 
            <td> <input name="telefono" type="text" size="15" maxlength="7"> </td> 
            <td> <input name="extension" type="text" size="10" maxlength="6"> </td> 
          </tr> 
          <tr align="center"> 
            <td>&nbsp;Lada</td> 
            <td>&nbsp;Tel&eacute;fono&nbsp;</td> 
            <td>Extensi&oacute;n</td> 
          </tr> 
        </table></td> 
    </tr> 
    <tr> 
      <td colspan="2"><b>B) Informaci&oacute;n de dep&oacute;sito bancario (s&oacute;lo si ha realizado el pago) </b></td> 
    </tr> 
    <tr> 
      <td align="right" >Ciudad donde se realiz&oacute; el dep&oacute;sito</td> 
      <td><input name="ciudad_dep" type="text" size="30" maxlength="30"></td> 
    </tr> 
    <tr> 
      <td align="right">N&uacute;mero de sucursal</td> 
      <td><input name="sucursal_dep" type="text" size="30" maxlength="30"></td> 
    </tr> 
    <tr> 
      <td align="right">Fecha</td> 
      <td><script>DateInput('fecha_dep', true, 'YYYY-MM-DD')</script></td> 
    </tr> 
    <tr> 
      <td align="right">Hora</td> 
      <td><input name="hora_dep" type="text" size="10" maxlength="5"> 
        (hh:mm) </td> 
    </tr> 
    <tr> 
      <td align="right">N&uacute;mero de referencia </td> 
      <td><input name="referencia_dep" type="text" id="referencia_dep" size="10" maxlength="10"></td> 
    </tr>
    <tr>
    	<td align="right">Monto</td>
    	<td>$
    		<input name="monto" type="text" id="monto" size="7" maxlength="7"> 
    		M.N.</td>
    	</tr>
    <tr>
		<td colspan="2"><b>C) Informaci&oacute;n para facturar (s&oacute;lo si requiere factura, proporcione todos los siguientes datos) </b></td>
    	</tr>
    <tr>
		<td align="right">R.F.C.</td>
    	<td><input name="rfc" type="text" size="30" maxlength="30"></td>
    	</tr>
    <tr>
		<td align="right" >Raz&oacute;n social</td>
    	<td><input name="razon" type="text" size="50" maxlength="50"></td>
    	</tr>
    <tr>
		<td><blockquote>
			<p><b>Direcci&oacute;n Fiscal</b></p>
		</blockquote></td>
    	<td>&nbsp;</td>
    	</tr>
    <tr>
		<td align="right">Calle</td>
    	<td><input name="calle" type="text" size="50" maxlength="50"></td>
    	</tr>
    <tr>
		<td align="right">N&uacute;mero exterior</td>
    	<td><table>
				<tr>
					<td><input name="num_ext" type="text" size="20" maxlength="10"></td>
					<td>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</td>
					<td align="center">N&uacute;mero interior</td>
					<td><input name="num_int" type="text" size="20" maxlength="10">					</td>
				</tr>
		</table></td>
    	</tr>
    <tr>
		<td align="right">Colonia</td>
    	<td><input name="colonia" type="text" size="50" maxlength="50"></td>
    	</tr>
    <tr>
		<td align="right">Delegacion / Municipio</td>
    	<td><input name="municipio" type="text" size="30" maxlength="30"></td>
    	</tr>
    <tr>
		<td align="right">Estado</td>
    	<td><table border="0" cellspacing="0">
				<tr>
					<td><select name="select" id="select">
					    <option value="">Selecciona..</option>
							<?php
		$strSQL = "SELECT * FROM estados";
		$tipos = mysql_query($strSQL);
		while($tipo = mysql_fetch_array($tipos, MYSQL_ASSOC)){ ?>
							<option value="<?php echo $tipo['id_estado'];?>"><?php echo $tipo['nombre']; ?></option>
							<?php } ?>
					</select></td>
					<td>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</td>
					<td align="center">C.P.</td>
					<td><input name="postal" type="text" size="20" maxlength="5">					</td>
				</tr>
		</table></td>
    	</tr>
   <!--
    <tr>
    	<td colspan="3"><b>

    		<input name="asistio" type="checkbox" id="asistio" value="1" checked>
    		Asisti&oacute;</b></td>
    	</tr> -->
  </table> 
  <p align="center" class="centrar">
    <input name="facturacion" type="hidden" id="facturacion" value="0"> 
  	<input name="grupo" type="hidden" value="0"> 
    <input name="Enviar" type="submit" value="Registrar"> 
  <input type="button" name="Submit" value="Cancelar" onClick="javascript:location.href='index.php'">
  </p> 
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
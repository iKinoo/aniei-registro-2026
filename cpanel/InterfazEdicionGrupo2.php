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
	 //$gasistio = $g['asistio'];
         //$gverifico = $g['verifico'];
	 if(isset($_GET['eliminar'])){
	 	$strSQL = "DELETE FROM usuarios WHERE id_asistente='".$_GET['eliminar']."'";
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
<script language="javascript" src="../js/validaciones.js" type="text/javascript"></script>
<script language="javascript" src="../js/funciones.js" type="text/javascript"></script>
<script language="javascript" src="../js/calendarDateInput/calendarDateInput.js"></script>
<script language="javascript" type="text/javascript">
	function VerificaInstitucion(i){
		if(i.value == "otro"){
			document.getElementById("institucion").style.display = "inline";
		} else {
			document.getElementById("institucion").style.display = "none";
		}
	}
</script>
<style type="text/css">
<!--
.Estilo {color:#999999; font-family: Tahoma; font-size: 8pt; }
-->
</style>
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
<p align="center"><b>Inscripci&oacute;n grupal </b></p>
<form action="editarUsuario.php" method="post" name="grupo" onSubmit="return validarGrupo(document.grupo)">
	<table border="0" align="center" cellpadding="5" cellspacing="0">
	<tr>
		<td colspan="2" bgcolor="#F3F3F3"><p class="centrar"><b>Los campos indicados con asterisco (*) son obligatorios.<br>
			Llene el formato utilizando may&uacute;sculas y min&uacute;sculas.</b><br>
			<b>El d&iacute;a del evento deber&aacute; traer la copia del dep&oacute;sito bancario. </b></p></td>
	</tr>
	<tr>
		<td colspan="2"><b>A) Informaci&oacute;n del responsable </b></td>
	</tr>
	<tr>
		<td align="right" valign="top">Nombre</td>
		<td valign="top"><table>
				<tr>
					<td><input name="titulo" type="text" value="<?php echo $g['titulo']; ?>" size="10" maxlength="30"> </td> 
            <td> <input name="nombre" type="text" value="<?php echo $g['nombre']; ?>" size="20" maxlength="50"> </td> 
            <td align="center"><input name="apellido" type="text" value="<?php echo $g['apellido']; ?>" size="20" maxlength="50"></td> 
          </tr> 
          <tr align="center"> 
            <td>&nbsp;&nbsp;&nbsp;T&iacute;tulo&nbsp;</td> 
            <td> Nombre<b>*</b></td> 
            <td>Apellidos<b>*</b></td> 
          </tr> 
		   
        </table>
			<br>
			  <span class="Estilo">Identificador: <?php echo $id; ?><br>
		Folio: <?php echo str_pad($g['iFolioRecibo'],5,"0", STR_PAD_LEFT); ?><br>
		Código de barra: <?php echo $g['codigo_barras']; ?>		</span></td> 
    </tr>

	<tr>
		<td align="right" valign="top">G&eacute;nero</td>
		<td><label>
			<input name="genero" type="radio" value="1" <?php if($g['genero']=="1") echo "checked"; ?>>
			Masculino<br>
			<input name="genero" type="radio" value="0" <?php if($g['genero']=="0") echo "checked"; ?>>
			Femenino</label></td>
	</tr> 
    <tr> 
      <td align="right">Tipo<b>*</b></td> 
      <td>
      	<select name="tipo" id="tipo">
		<option value="">Selecciona..</option>
	<?php
		$strSQL = "SELECT * FROM tipousuario";
		$tipos = mysql_query($strSQL);
		while($tipo = mysql_fetch_array($tipos, MYSQL_ASSOC)){ ?>
		<option value="<?php echo $tipo['id_tipo'];?>" <?php if($tipo['id_tipo']==$g['tipo']) echo "SELECTED"; ?>><?php echo $tipo['descripcion']; ?></option>
		<?php } ?>
	</select>		</td>
	</tr>
	<tr>
		<td align="right">Cargo</td>
		<option value="">Selecciona..</option>
		<td><select name="cargo">
		<?php
		$strSQL = "SELECT * FROM cargos";
		$tipos = mysql_query($strSQL);
		while($tipo = mysql_fetch_array($tipos, MYSQL_ASSOC)){ ?>
			<option value="<?php echo $tipo['id_cargo'];?>" <?php if($tipo['id_cargo']==$g['cargo']) echo "SELECTED"; ?>><?php echo $tipo['descripcion']; ?></option>
		<?php } ?>
		</select>			</td>
	</tr>
	<tr>
		<td align="right">T&iacute;tulo profesional </td>
		<td><input name="carrera" type="text" value="<?php echo $g['carrera']; ?>" size="50" maxlength="50"></td>
	</tr>
   
     <tr> 
      <td align="right">Tipo de Instituci&oacute;n<b>*</b></td> 
      <td><b>
	    <input name="tipins" type="checkbox" id="tipins" value="1" onClick="javascript:verificaSocio(this.checked)" <?php if($g['id_institucion'] > 0) echo "checked";?>  >Socio Aniei</b></td> 
    </tr> 
    <tr> 
      <td align="right" valign="top">Nombre de Instituci&oacute;n<b>*</b></td> 
      <td><select name="iidinstitucion" id="iidinstitucion" onChange="VerificaInstitucion(this);">
			  <option value="">Selecciona...</option> 
              <?
	    $strSQL = "SELECT * FROM instituciones";
		$tipos = mysql_query($strSQL);
		while($tipo = mysql_fetch_array($tipos, MYSQL_ASSOC)){ ?>
			<option value="<?php echo $tipo['id_institucion'];?>" <?php if($tipo['id_institucion'] == $u['id_institucion']) echo "SELECTED"; ?>><?php echo $tipo['nombre']; ?></option>
	    <? } ?>
			<option value="otro">Otro</option>
	       </select><br><input name="institucion" type="text" size="50" maxlength="100" style="display:none;">
      </td> 
    </tr> 
	<tr>
		<td align="right">Campus, Facultad o Plantel</td>
		<td><input name="facultad" type="text" value="<?php echo $g['dependencia']; ?>" size="50" maxlength="50"></td>
	</tr>
	<tr>
		<td align="right">Entidad Federativa<b>*</b></td>
		<td><select name="estado">
		<option value="">Selecciona..</option>
				<?php
	$strSQL = "SELECT * FROM estados";
	$tipos = mysql_query($strSQL);
	while($tipo = mysql_fetch_array($tipos, MYSQL_ASSOC)){ ?>
		<option value="<?php echo $tipo['id_estado'];?>" <?php if($tipo['id_estado']==$g['estado']) echo "SELECTED"; ?>><?php echo $tipo['nombre']; ?></option>
	<?php } ?>
	</select></td>
			</tr>
			<tr>
				<td align="right">Correo electr&oacute;nico</td>
				<td><input name="correo" type="text" value="<?php echo $g['correo']; ?>" size="50" maxlength="30"></td>
			</tr>
			<tr>
				<td align="right">N&uacute;mero telef&oacute;nico</td>
				<td><table>
					<tr>
						<td><input name="lada" type="text" value="<?php echo $g['lada']; ?>" size="10" maxlength="10"></td>
						<td><input name="telefono" type="text" value="<?php echo $g['telefono']; ?>" size="15" maxlength="10"></td>
						<td><input name="extension" type="text" value="<?php echo $g['extension']; ?>" size="10" maxlength="10"></td>
					</tr>
					<tr align="center">
						<td>&nbsp;Lada</td>
						<td>&nbsp;Tel&eacute;fono&nbsp;</td>
						<td>Extensi&oacute;n</td>
					</tr>
				</table></td>
			</tr>
			<tr>
    	<td align="right">Costo total del grupo:</td>
    	<td>$<input name="grupocosto" type="text"  size="9" maxlength="9" value="<?php if($g['costoins'] != "") echo vsprintf("%.2f", $g['costoins']);  ?>"> 
    		M.N.</td>
    	</tr>		
			
			<tr>
				<td colspan="2"><b>B) Informaci&oacute;n del grupo </b></td>
			</tr>
			<tr>
				<td colspan="2"><table align="center" >
			<tr>
				<th>&nbsp;</th>
				<th>Nombre</th>
				<th>Apellidos</th>
				<th>&nbsp;</th>
				</tr>
			<?php
			  $strSQL = "SELECT * FROM usuarios WHERE padre='".$id."' ORDER BY apellido, nombre ASC";
			  $g = mysql_query($strSQL);
			  $n = mysql_num_rows($g);
			  $total_participantes = 100;
			  $i = 1;
			  // Imprimimos los inscritos
			  while($gg = mysql_fetch_array($g, MYSQL_ASSOC)) { ?>
			<tr>
				<td><?php echo $i; ?></td>
				<td><input name="nombre<?php echo $i; ?>" type="text" id="nombre<?php echo $i; ?>" value="<?php echo $gg['nombre']; ?>" size="30" maxlength="50"><input name="n<?php echo $i; ?>" type="hidden" value="<?php echo $gg['id_asistente']; ?>"></td>
				<td><input name="apellido<?php echo $i; ?>" type="text" id="apellido<?php echo $i; ?>" value="<?php echo $gg['apellido']; ?>" size="30" maxlength="50"></td>
				<td><a href="InterfazEdicionGrupo2.php?id=<?php echo $id; ?>&eliminar=<?php echo $gg['id_asistente']; ?>"><img src="../img/b_usrdrop.png" width="16" height="16" border="0"></a></td>
				</tr>
			<?php $i++; } $j=$i-1;
			  while($i<=$total_participantes) { ?>
			<tr>
				<td><?php echo $i; ?></td>
				<td><input name="nombre<?php echo $i; ?>" type="text" id="nombre<?php echo $i; ?>" size="30" maxlength="50"></td>
				<td><input name="apellido<?php echo $i; ?>" type="text" id="apellido<?php echo $i; ?>" size="30" maxlength="50"></td>
				<td>&nbsp;</td>
				</tr>
			<?php $i++;} ?>
				</table></td>
			</tr>
			<?php 
				$strSQL = "SELECT * FROM depositos WHERE id_deposito='".$id."'";
				$g = mysql_query($strSQL);
				$g = mysql_fetch_array($g, MYSQL_ASSOC);
			?>
			<tr>
				<td colspan="2"><b>C) Informaci&oacute;n de dep&oacute;sito bancario (s&oacute;lo si ha realizado el pago) </b></td>
			</tr>
			<tr>
				<td align="right" >Ciudad donde se realiz&oacute; el dep&oacute;sito</td>
				<td><input name="ciudad_dep" type="text" value="<?php echo $g['ciudad']; ?>" size="30" maxlength="30"></td>
			</tr>
			<tr>
				<td align="right">N&uacute;mero de sucursal</td>
				<td><input name="sucursal_dep" type="text" value="<?php echo $g['sucursal']; ?>" size="30" maxlength="30"></td>
			</tr>
			<tr>
				<td align="right">Fecha</td>
				<td><script>DateInput('fecha_dep', true, 'YYYY-MM-DD'<? if($u['fecha'] != "") { echo ", '".$u['fecha']."'"; }?>)</script></td>
			</tr>


			<tr>
				<td align="right">Hora</td>
				<td><input name="hora_dep" type="text" value="<?php if($g['hora']!="00:00:00") echo substr($g['hora'],0,5); ?>" size="10" maxlength="5">
					(hh:mm horas) </td>
			</tr>
			<tr>
				<td align="right">N&uacute;mero de referencia </td>
				<td><input name="referencia_dep" type="text" id="referencia_dep" value="<?php echo $g['referencia']; ?>" size="10" maxlength="10"></td>
			</tr>
			<tr>
				<td align="right">Monto</td>
				<td>$
					<input name="monto" type="text" id="monto" value="<?php if($g['monto'] != "") echo vsprintf("%.2f", $g['monto']);  ?>" size="9" maxlength="9">
					M.N. </td>
			</tr>
			<tr>
				<td colspan="2"><b>D) Informaci&oacute;n para facturar (s&oacute;lo si requiere factura, proporcione todos los siguientes datos) </b></td>
			</tr>
			<?php 
				$strSQL = "SELECT * FROM facturaciones WHERE id_facturacion='".$id."'";
				$g = mysql_query($strSQL);
				$g = mysql_fetch_array($g, MYSQL_ASSOC);
			?>
			<tr>
				<td align="right">R.F.C.</td>
				<td><input name="rfc" type="text" value="<?php echo $g['rfc']; ?>" size="30" maxlength="30"></td>
			</tr>
			<tr>
				<td align="right" >Raz&oacute;n social</td>
				<td><input name="razon" type="text" value="<?php echo $g['razon']; ?>" size="50" maxlength="50"></td>
			</tr>
			<tr>
				<td><blockquote>
					<p><b>Direcci&oacute;n Fiscal</b></p>
				</blockquote></td>
				<td>&nbsp;</td>
			</tr>
			<tr>
				<td align="right">Calle</td>
				<td><input name="calle" type="text" id="calle" value="<?php echo $g['calle']; ?>" size="50" maxlength="50"></td>
			</tr>
			<tr>
				<td align="right">N&uacute;mero exterior</td>
				<td><table>
					<tr>
						<td><input name="num_ext" type="text" value="<?php echo $g['exterior']; ?>" size="11" maxlength="10"></td>
						<td>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</td>
						<td align="center">N&uacute;mero interior</td>
						<td><input name="num_int" type="text" value="<?php echo $g['interior']; ?>" size="11" maxlength="10">						</td>
					</tr>
				</table></td>
			</tr>
			<tr>
				<td align="right">Colonia</td>
				<td><input name="colonia" type="text" value="<?php echo $g['colonia']; ?>" size="50" maxlength="50"></td>
			</tr>
			<tr>
				<td align="right">Delegacion / Municipio</td>
				<td><input name="municipio" type="text" value="<?php echo $g['municipio']; ?>" size="30" maxlength="30"></td>
			</tr>
			<tr>
				<td align="right">Estado</td>
				<td><table border="0" cellspacing="0">
					<tr>
						<td><select name="select">
						<option value="">Selecciona..</option>
						<?php
						$strSQL = "SELECT * FROM estados";
						$tipos = mysql_query($strSQL);
						while($tipo = mysql_fetch_array($tipos, MYSQL_ASSOC)){ ?>
							<option value="<?php echo $tipo['id_estado'];?>" <?php if($tipo['id_estado']==$g['estado']) echo "SELECTED"; ?>><?php echo $tipo['nombre']; ?></option>
						<?php } ?>
						</select></td>
						<td>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</td>
						<td align="center">C.P.</td>
						<td><input name="postal" type="text" value="<?php echo $g['codigo']; ?>" size="20" maxlength="10">						</td>
					</tr>
				</table></td>
			</tr>
		</table>
			<p align="center" class="centrar">
				<input name="facturacion" type="hidden" id="facturacion" value="0"> 
				<input name="grupo" type="hidden" value="1">
				<input name="Enviar" type="submit" value="Actualizar">
				<input name="total_a_actualizar" type="hidden" value="<?php echo $j; ?>">
				<input name="total_participantes" type="hidden" value="<?php echo $total_participantes; ?>">
				<input name="id" type="hidden" value="<?php echo $id; ?>">
				<input name="regresar" type="button" id="regresar" value="Regresar" onClick="javascript:location.href='InterfazEdicionGrupo.php';">
				<?php $strSQL="SELECT MAX(id_asistente) as 'maximo' FROM usuarios WHERE padre='".$id."' ORDER BY id_asistente";
					$max = mysql_query($strSQL);
					$max = mysql_fetch_array($max); ?>
				<input name="maximo" type="hidden" value="<?php echo substr($max['maximo'],13,3); ?>">
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
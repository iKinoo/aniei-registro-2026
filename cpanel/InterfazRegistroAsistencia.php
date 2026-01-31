<?php
	session_start();
	if(!isset($_SESSION['logginuser']) || $_SESSION['logginuser'] != 1){
		header("Location: index.php");
	}
?>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd"><html><!-- InstanceBegin template="/Templates/aniei.dwt.php" codeOutsideHTMLIsLocked="false" -->
<head>
<title>:: ANIEI <? echo date("Y"); ?>::</title>
<meta http-equiv="Content-Type" content="text/html; charset=iso-8859-1" />
<link rel="stylesheet" type="text/css" href="../css/body.css">
<link rel="stylesheet" type="text/css" href="../css/exclusivo.css">
<!-- InstanceBeginEditable name="head" -->
<link rel="stylesheet" type="text/css" href="../css/exclusivo.css" />
<style type="text/css">
	.Estilo { color:#999999; font-family: Tahoma; font-size: 8pt; }
</style>
<script language="JavaScript" type="text/javascript">
	function ValidaForma(forma){
		if(forma.actividad.value == 0){
			alert("Debes seleccionar una actividad.");
			forma.actividad.focus();
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


<link href="../css/exclusivo.css" rel="stylesheet" type="text/css" />

<p align="center"><b>Registro de asistencia</b></p>
<form action="registrarasistencia.php" method="post" name="form1" id="form1" onSubmit="return ValidaForma(document.form1);"> 
  <table border="0" align="center" cellpadding="10" cellspacing="0"> 
    <tr>
      <td colspan="3" bgcolor="#F3F3F3"><p class="centrar"><b>
      	Seleccione la actividad en la cual desea registrar la asistencia de los participantes.</b><br>
      	</b></p>
      	</td>
    </tr>
    <tr> 
      <td colspan="3"><b>Informaci&oacute;n de la Actividad</b></td> 
    </tr> 
     
    <tr> 
      <td align="right">Actividad*<b></b></td> 
      <td>&nbsp;</td> 
      <td> <label>
      	<select name="actividad" id="actividad">
		<option value="0">[SELECCIONE UNA OPCION]</option>
	<?php
		include("../funciones/basedatos.php");
		$conn = Conectar();
	    $strSQL = "SELECT a.id_actividad, a.nombre, u.nombre AS unombre, u.apellido as uapellido FROM actividades a, usuarios u WHERE a.ponente=u.id_asistente  ORDER BY a.nombre";
		$tipos = mysql_query($strSQL);		
		while($tipo = mysql_fetch_array($tipos, MYSQL_ASSOC)){ ?>
			<option value="<?php echo $tipo['id_actividad'];?>"><?php echo $tipo['nombre']." - ".$tipo['unombre']." ".$tipo['uapellido']; ?></option>
	<?php } ?>
      	</select>
      </label></td> 
    </tr> 
   
  </table>  
  
  <p align="center" class="centrar">
    <input name="Enviar" type="submit" value="Registrar" /> 
  	<input type="button" name="Submit" value="Regresar" onClick="javascript:location.href='index.php'">
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
<?php Desconectar($conn);?>
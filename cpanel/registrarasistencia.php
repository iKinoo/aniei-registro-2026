<?php
	session_start();
	if(!isset($_SESSION['logginuser'])){
		header("Location: index.php");
	}
	
   include ("../funciones/basedatos.php");
   $conn = Conectar();
   $actividad = $_POST['actividad'];
   $leyendanombre = "";
   if( isset($_POST['codigo'])){
   
       $participante = $_POST['codigo'];
	   $strSQL = "select nombre , apellido, iFolioRecibo  from usuarios where codigo_barras ='".$participante."'";
	   $resultado = mysql_query($strSQL);	
	   if(mysql_num_rows($resultado) > 0){        
	      $datos = mysql_fetch_row($resultado);
		  $strSQL = "update usuarios set asistio = '1' where iFolioRecibo=".$datos[2];
		  $resultado = mysql_query($strSQL);		  
		  $leyendanombre = "<p style='color: blue;font-weight: bold;'>".$datos[0]." ".$datos[1].", has sido registrado.</p>";
	   } 
	   else{
	       $leyendanombre = "! Error ! el c&oacute;digo  ".$participante."  es incorrecto, intente de nuevo.";
		   $leyendanombre = "<p style='color: #FF0000;font-weight: bold;'>".$leyendanombre."</p>";
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
<form action="../registrarasistencia.php" method="post" name="form1" id="form1" onSubmit="return ValidaForma(document.form1);"> 
  <table border="0" align="center" cellpadding="10" cellspacing="0"> 
    <tr>
        <td colspan="3" bgcolor="#F3F3F3"><p class="centrar"><b>
		<?php
		   $strSQL = "SELECT  a.nombre, u.nombre AS unombre, u.apellido as uapellido FROM actividades a, usuarios u WHERE a.ponente=u.id_asistente and a.id_actividad = ".$actividad;		   
		  $miactividad = mysql_query($strSQL);		
		  $minombreactividad = mysql_fetch_row($miactividad);
		  echo $minombreactividad[0]." Instructor: ".$minombreactividad[1]."-".$minombreactividad[2]; ?>	
		  </b></p>
      	 </td>
    </tr>
    <tr> 
      <td colspan="3"><b> Coloque su c&oacute;digo de barra en el lector.</b></td> 
    </tr>      
    <tr> 
      <td align="right">C&oacute;digo de barra*<b></b></td> 
      <td>&nbsp;</td> 
	  <td><p>
      	<input name="codigo" type="text" id="codigo" value="" size="30" maxlength="30" onBlur="this.form.submit()" />        
    </tr>    
	<tr>
	     <td colspan="3" bgcolor="#F3F3F3"><p class="centrar"><b>Espere a que aparezca su nombre.</b>
		 <?php echo $leyendanombre; ?></p>
	  </p></td> 	    
	</tr>
  </table>  
  <input name="actividad" type="hidden" id="actividad" value="<?php echo $actividad; ?>"> 
  <p align="center" class="centrar">
    <input name="Enviar" type="submit" value="Registrar" /> 
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
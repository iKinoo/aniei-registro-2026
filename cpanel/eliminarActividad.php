<?php
	session_start();
	if(!isset($_SESSION['logginuser']) || $_SESSION['logginuser'] != 1){
		header("Location: index.php");
	}
	
	include ("../funciones/basedatos.php");
	extract($_POST, EXTR_OVERWRITE);
	
	$conn = Conectar();
        if(isset($_GET['id'])) $id = $_GET['id']; 
	if($_SERVER['REQUEST_METHOD'] == "POST" && isset($_POST['Si'])){

		mysql_query("BEGIN;");
		$id = $_POST['id'];
		$strSQL = "DELETE FROM actividades WHERE id_actividad='".$id."'";
		mysql_query($strSQL);
		$strSQL = "DELETE FROM inscripciones WHERE id_actividad='".$id."'";
		mysql_query($strSQL);
		mysql_query("COMMIT;");
		header("Location: interfazEdicionActividad.php");
	}
        else {
	if($_SERVER['REQUEST_METHOD'] == "POST" && isset($_POST['No'])){
		header("Location: interfazEdicionActividad.php");
	}}
	 ?>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd"><html><!-- InstanceBegin template="/Templates/aniei.dwt.php" codeOutsideHTMLIsLocked="false" -->
<head>
<title>:: ANIEI <? echo date("Y"); ?>::</title>
<meta http-equiv="Content-Type" content="text/html; charset=iso-8859-1" />
<link rel="stylesheet" type="text/css" href="../css/body.css">
<link rel="stylesheet" type="text/css" href="../css/exclusivo.css">
<!-- InstanceBeginEditable name="head" --><!-- InstanceEndEditable -->
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
	
	
		<p>&nbsp;</p>
		
		<p class="centrar"><b>&iquest;Est&aacute; seguro de eliminar esta actividad y los usuarios inscritos?</b></p>
	<form id="form1" name="form1" method="post" action="eliminarActividad.php">
		<table width="200" border="0" align="center">
			<tr>
				<td class="centrar"><input name="Si" type="submit" id="Si" value="Si" /></td>
				<td class="centrar"><input name="No" type="submit" id="No" value="No" /></td>
			</tr>
		</table>
		<input name="id" type="hidden" value="<?php echo $id; ?>" />
	</form>
	<p class="centrar">&nbsp;</p>
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
<?php
	session_start();
	if(!isset($_SESSION['logginuser']) || $_SESSION['logginuser'] != 1){
		header("Location: index.php");
	}
	include("../funciones/basedatos.php");
	$conn = Conectar();
	if(isset($_GET['id'])) $id = $_GET['id'];           
	if($_SERVER['REQUEST_METHOD'] == "POST" && isset($_POST['delete'])){
                
		$id = $_POST['id'];
		mysql_query("BEGIN;");
		$strSQL = "DELETE FROM usuarios WHERE id_asistente='".$id."'";
		mysql_query($strSQL);
		$strSQL = "DELETE FROM facturaciones WHERE id_facturacion='".$id."'";
		mysql_query($strSQL);
		$strSQL = "DELETE FROM depositos WHERE id_deposito='".$id."'";
		mysql_query($strSQL);
		//$strSQL = "DELETE FROM actividades WHERE ponente='".$id."'";
		//mysql_query($strSQL);
		$strSQL = "DELETE FROM inscripciones WHERE id_asistente='".$id."'";
		mysql_query($strSQL);
		$strSQL = "SELECT id_asistente FROM usuarios WHERE padre='".$id."' ORDER BY id_asistente ASC";
		$usuarios = mysql_query($strSQL);
		while($usuario = mysql_fetch_array($usuarios, MYSQL_ASSOC)){
			$strSQL = "DELETE FROM usuarios WHERE id_asistente='".$usuario['id_asistente']."'";
			mysql_query($strSQL);
			$strSQL = "DELETE FROM facturaciones WHERE id_facturacion='".$usuario['id_asistente']."'";
			mysql_query($strSQL);
			$strSQL = "DELETE FROM depositos WHERE id_deposito='".$usuario['id_asistente']."'";
			mysql_query($strSQL);			
			$strSQL = "DELETE FROM inscripciones WHERE id_asistente='".$usuario['id_asistente']."'";
			mysql_query($strSQL);
                        
		}
		mysql_query("COMMIT;");
                 
		header("Location: eliminadoGrupo.php");
	} else {
		if($_SERVER['REQUEST_METHOD'] == "POST" && isset($_POST['no'])) 
                    header("Location: InterfazEdicionGrupo.php");
	}
?>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd"><html><!-- InstanceBegin template="/Templates/aniei.dwt.php" codeOutsideHTMLIsLocked="false" -->
<head>
<title>:: ANIEI <? echo date("Y"); ?>::</title>
<meta http-equiv="Content-Type" content="text/html; charset=iso-8859-1" />
<link rel="stylesheet" type="text/css" href="../css/body.css">
<link rel="stylesheet" type="text/css" href="../css/exclusivo.css">
<!-- InstanceBeginEditable name="head" -->


<link href="../css/exclusivo.css" rel="stylesheet" type="text/css">
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
		    <p>&nbsp;</p>
			<p align="center" class="centrar"><b>XXI Congreso Nacional y VII Congreso Internacional de Inform&aacute;tica y Computaci&oacute;n<br>
			24 al 26 de octubre de 2007</b></p>
			<p align="center" class="centrar"><b>Monterrey, Nuevo Le&oacute;n, M&eacute;xico</b></p>
			<table align="center">
				<tr>
					<td align="center">
					<p class="centrar">Existen usuarios  asociados a este titular.<br>
					    &iquest;Est&aacute; seguro que desea eliminar al titular?</p>
					<p class="centrar"> NOTA: Se eliminar&aacute;n todos los usuarios asociados al titular,<br>
						as&iacute; como su informaci&oacute;n de dep&oacute;sitos y facturaciones. </p>
					<form name="form1" method="post" action="falloEliminarGrupo.php">
					    <table width="200" cellspacing="3">
                            <tr class="centrar">
                                <td><input name="delete" type="submit" id="delete" value="&nbsp;&nbsp;Si&nbsp;&nbsp;"></td>
                                <td><input name="no" type="submit" id="no" value="&nbsp;&nbsp;No&nbsp;&nbsp;"></td>
                            </tr>
                        </table><input type="hidden" value="<?php echo $_GET['id']; ?>" name="id">
					    </form>
					<p class="centrar">
					<?php
					$_SESSION["temp_id"] = "";
					$_SESSION['temp_nombre'] = "";
					$_SESSION['temp_apellido'] = "";
					?>
				    </p>
					</td>
		    	</tr>
			</table>
			<p class="centrar"><a href="InterfazEdicionGrupo.php">Regresar</a></p>
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

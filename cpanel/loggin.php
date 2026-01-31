<?php
	session_start();
	
	if(isset($_POST['txtUsername']) && isset($_POST['txtPassword'])) {
		include ("../funciones/basedatos.php");
		$conn = Conectar();
		extract($_POST);
		$strSQL = "SELECT * FROM accesos WHERE username LIKE '".$txtUsername."' AND contrasena LIKE MD5('".$txtPassword."')";
		$registro = mysql_query($strSQL);
		if(mysql_num_rows($registro) == 1){
			$registro2 = mysql_fetch_array($registro, MYSQL_ASSOC);
		  	$loggin = $registro2['tipo'];
		    $_SESSION['logginuser'] = $loggin;
			$_SESSION['usuarioANIEI'] =  $registro2['username'];  
			header("location: panel_control.php");          
		} else {
			$msg = "Nombre de usuario o contrase&ntilde;a incorrectos";
		}
	}
?>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html><!-- InstanceBegin template="/Templates/aniei.dwt.php" codeOutsideHTMLIsLocked="false" -->
<head>
<title>:: ANIEI <? echo date("Y"); ?>::</title>
<meta http-equiv="Content-Type" content="text/html; charset=iso-8859-1" />
<link rel="stylesheet" type="text/css" href="../css/body.css">
<link rel="stylesheet" type="text/css" href="../css/exclusivo.css">
<!-- InstanceBeginEditable name="head" -->
<link rel="stylesheet" type="text/css" href="../css/formulario.css">
<script language="javascript" type="text/javascript" src="../js/funciones.js"></script>
<script language="javascript" type="text/javascript" src="../js/formulario.js"></script>
<script language="javascript" type="text/javascript">
	function Ocultar(){
		document.getElementById("msg").style.visibility = "hidden";
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
		  <form name="form1" id="form1" method="post" action="<? echo $_SERVER['PHP_SELF']; ?>" onSubmit="return ValidaForm(this);">
				<table border="0" align="center" cellpadding="10" cellspacing="0">
					<tr>
						<td colspan="2" align="center"><h4>AUTENTIFICACI&Oacute;N</h4></td>
					</tr>
					<tr>
						<td align="right"><p>Nombre de usuario</p></td>
						<td><input name="txtUsername" type="text" id="txtUsername*" maxlength="30" onKeyPress="Ocultar();" onClick="Ocultar();" alt="Olvidó escribir su nombre de usuario."/></td>
					</tr>
					<tr>
						<td align="right"><p>Contrase&ntilde;a</p></td>
						<td><input name="txtPassword" type="password" id="txtPassword*" maxlength="30" onKeyPress="Ocultar();" onClick="Ocultar();" alt="Olvidó escribir su contraseña" /></td>
					</tr>
					<tr>
						<td colspan="2" align="center"><input type="submit" name="Submit" value="Ingresar" /></td>
					</tr>
				</table>
		</form>		
			<?php if(isset($msg)){ ?><div align="center"><span class="alerta" id="msg"><?php echo "<br>".$msg; ?></span></div>
			<?php } else { ?><div align="center"><span id="msg"></span></div><?php } ?>

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
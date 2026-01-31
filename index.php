<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html><!-- InstanceBegin template="/Templates/aniei.dwt.php" codeOutsideHTMLIsLocked="false" -->
<head>
<title>:: ANIEI <? echo date("Y"); ?>::</title>
<meta http-equiv="Content-Type" content="text/html; charset=iso-8859-1" />
<link rel="stylesheet" type="text/css" href="css/body.css">
<link rel="stylesheet" type="text/css" href="css/exclusivo.css">
<!-- InstanceBeginEditable name="head" -->
<style type="text/css">
#cpaneldeluxe td div { 
	display: block;
	vertical-align: middle;
	text-decoration : none;
	font-size:14px;
	padding: 1px;
	text-align:left;
	cursor:pointer;
	color: #808080;
} 

#cpaneldeluxe td img { margin-right: 10px; }
#cpaneldeluxe td div:hover   { 
	color : #333; 
	background-color: #DDFBFA;
	border: 1px solid #4872D2;
	padding: 0px;
}
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
		  <p>&nbsp;</p>
		  <h2 align="center">Bienvenido al sistema de registro<br>
        e inscripci&oacute;n de la ANIEI <? echo date("Y"); ?></h2>
		  <table width="400" border="0" align="center" cellpadding="5" cellspacing="0" id="cpaneldeluxe">
            <tr>
              <td valign="middle"><div onclick="window.location = 'precios.php?pre';">
                <table border="0" cellspacing="0" cellpadding="0">
                  <tr>
                    <td><img src="img/step1.png" width="80" height="80" align="absmiddle"></td>
                    <td>Es la primera vez que visito este sitio y deseo conocer los costos de mi participaci&oacute;n al Congreso de la ANIEI <? echo date("Y"); ?></td>
                  </tr>
                </table>
                </div>
                  </p></td>
            </tr>
            <tr>
              <td valign="middle"><div onclick="window.location = 'precios.php?reg';">
                <table border="0" align="center" cellpadding="0" cellspacing="0">
                <tr>
                  <td><img src="img/step2.png" width="80" height="80" align="absmiddle"></td>
                  <td>He realizado mi dep&oacute;sito y deseo  registrarme al Congreso de ANIEI <? echo date("Y"); ?></td>
                </tr>
              </table></div></p></td>
            </tr>
        </table>
		  <h4 align="center">Por favor  detengase a leer cuidadosamente las<br>
	  	instrucciones para poder registrarse sin problemas.</h4>
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
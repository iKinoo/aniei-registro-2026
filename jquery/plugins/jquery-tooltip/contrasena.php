<?
	// Fecha en el pasado
	header("Expires: Mon, 26 Jul 1997 05:00:00 GMT");
	
	// siempre modificado
	header("Last-Modified: " . gmdate("D, d M Y H:i:s") . " GMT");
	
	// HTTP/1.1
	header("Cache-Control: no-store, no-cache, must-revalidate");
	header("Cache-Control: post-check=0, pre-check=0", false);
	
	// HTTP/1.0
	header("Pragma: no-cache");
?>
<html>
<head>
<link rel="stylesheet" type="text/css" href="css/global.css">
</head>
<body>
<ul style="margin-left:15px;">
	<li>La contrase&ntilde;a debe tener una longitud de <strong>entre 6 - 50 caracteres</strong></li>
	<li>La contrase&ntilde;a es <b>sensible a may&uacute;sculas</b></li>
	<li>Se recomienda que la contrase&ntilde;a no sea igual al nombre de usuario. </li>
</ul>
</body>
</html>
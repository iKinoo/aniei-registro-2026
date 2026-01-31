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
 <p>Suba una foto para poder darse a conocer ante los dem&aacute;s.
</p>
</body>
</html>
<?php
	session_start();
	if(!isset($_SESSION['logginuser'])){
		header("Location: index.php");
	}

	if($_SERVER['REQUEST_METHOD'] == "POST" || isset($_GET['t'])){
		include("../funciones/basedatos.php");
		$conn = Conectar();
		if(isset($_GET['t'])){
			$nombre = $_GET['t'];
		} else {
			$nombre = trim($_POST['nombre']);
		}
		$nombres = explode(" ",$nombre);
		foreach ($nombres as $name) {
			$cadena .= " u.nombre LIKE '%".$name."%' OR u.apellido LIKE '%".$name."%' OR";
		}
		$strSQL = "SELECT u.id_usuario, u.folio_recibo, u.nombre, u.apellido, u.codigo_barras, r.ifolio as recibo  
					FROM usuarios u 
					LEFT JOIN recibos r ON u.folio_recibo = r.idFolioAsistente
					WHERE".$cadena." u.folio_recibo LIKE '%".$nombre."%' 
					ORDER BY u.apellido, u.nombre";
		$usuarios = mysql_query($strSQL);
		Desconectar($conn);
	}
?>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=iso-8859-1" />
<title>Buscar Usuario</title>
<link rel="stylesheet" type="text/css" href="../css/exclusivo.css">
<link rel="stylesheet" type="text/css" href="../css/formulario.css">
<script language="javascript" type="text/javascript" src="../js/funciones.js"></script>
<script language="javascript" type="text/javascript" src="../js/formulario.js"></script>
<script language="javascript" type="text/javascript">
	function Seleccionar(cadena){
		var a = new Array();
		a = cadena.split("-");
		var nombre = trim(a[1])+ " " + trim(a[2]);
		var codBar = "";
		if(trim(a[4]) == ""){
			codBar = "[ SIN CODIGO DE BARRAS ]";
		} else {
			codBar = "Código de barras: " + trim(a[4]);
		}
		
		window.opener.document.getElementById("nombre").value = nombre;
		window.opener.document.getElementById("id_usuario").value = a[0];
		window.opener.document.getElementById("folio_recibo").innerText = codBar;
		window.close();
	}
	
	function CambiaColor(ncolor, id){
	  	document.getElementById(id).style.background = "#"+ncolor;
	}
</script>
</head>

<body>
<form id="form1" name="form1" method="post" action="buscar_usuario.php">
	<table border="0" align="center">
		<tr>
			<td><p>Nombre y/o Apellido </p></td>
			<td><input name="nombre" type="text" id="nombre" value="<?php echo $nombre; ?>" size="30" maxlength="50" /></td>
		</tr>
		<tr>
			<td colspan="2"><div align="center">
				<input type="submit" name="Submit" value="Buscar" />
			</div></td>
		</tr>
	</table>	
	<?php if(mysql_num_rows($usuarios) > 0) { ?>
	<p align="center" class="Estilo1">Haga clic sobre el usuario que est&aacute; buscando. </p>
	<table border="1" align="center" cellpadding="3" cellspacing="0">
		<tr>
			<th><p>Folio</p></th>			
			<th><p>Nombre</p></th>
			<th><p>Apellidos</p></th>
		</tr>
		<? 	$i=0;
			while($usuario = mysql_fetch_array($usuarios, MYSQL_ASSOC)){ if($i%2 == 0) { $color = 'EEEEEE'; } else {	$color = 'E0E0E0'; } ?>
		<tr id="<?php echo $usuario['id_usuario']."-".$usuario['nombre']."-".$usuario['apellido']."-".str_pad( $usuario['folio_recibo'], 5,"0", STR_PAD_LEFT)."-".$usuario['codigo_barras']; ?>" onClick="Seleccionar(id);" bgcolor="#<?php echo $color; ?>" onMouseOver="CambiaColor('f8e8a0',id);" onMouseOut="CambiaColor('<?php echo $color; ?>',id);" style="cursor:pointer;">
			<td><p><?php echo str_pad( $usuario['folio_recibo'], 5,"0", STR_PAD_LEFT); ?></p></td>		   
			<td><p><?php echo $usuario['nombre']; ?></p></td>
			<td><p><?php echo $usuario['apellido']; ?></p></td>
		</tr>
		<?php $i++; } ?>
	</table>
	<? } else { ?>
	<p>&nbsp;</p>
	<p align="center">No se encontraron elementos con esos caracteres</p>
	<? } ?>
</form>
</body>
</html>

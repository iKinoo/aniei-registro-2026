<?php
	session_start();
	if(!isset($_SESSION['logginuser'])){
		header("Location: index.php");
	}
	include("../funciones/basedatos.php");
		$conn = Conectar();

	if($_GET['t'] != ""){
		$nombres = explode(" ",$_GET['t']);
		foreach ($nombres as $name) {
			$cadena .= " u.nombre LIKE '%".$name."%' OR u.apellido LIKE '%".$name."%' OR";
		}
		$otros = "AND (".$cadena." 0)";
	} else {
		$otros = "";
	} 
	$strSQL = "SELECT u.id_usuario, u.folio_recibo, u.nombre, u.apellido, u.codigo_barras, a.nombre AS 'actividad', a.id_actividad
				FROM inscripciones i
				INNER JOIN usuarios u ON u.id_usuario = i.id_usuario ".$otros." 
				INNER JOIN actividades a ON a.id_actividad = i.id_actividad
				GROUP BY u.id_usuario
				ORDER BY u.apellido, u.nombre";
	$usuarios = mysql_query($strSQL);
	Desconectar($conn);
	
?>
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
			codBar = "[ SIN CODIGO ]";
		} else {
			codBar = trim(a[4]);
		}
		window.opener.document.getElementById("nombre").value = nombre;
		window.opener.document.getElementById("id_usuario").value = a[0];
		window.opener.document.getElementById("id_asistente").innerText = nombre + " Código de barra: " + codBar;
		window.opener.document.getElementById("id_actividadUsuario").value = a[5];
		window.close();
	}
	
	function CambiaColor(ncolor, id){
	  	document.getElementById(id).style.background = "#"+ncolor;
	}
</script>
<style type="text/css">
	.manita{ cursor:pointer; }
</style>
</head>

<body>
<form id="form1" name="form1" method="get" action="<? echo $_SERVER['../PHP_SELF']; ?>">
	<p>&nbsp;</p>
	<table border="0" align="center" cellpadding="5" cellspacing="0">
		<tr>
			<td><p>Nombre y/o Apellido </p></td>
			<td><input name="t" type="text" id="t" value="<?php echo $_GET['t']; ?>" size="30" maxlength="50" /></td>
			<td><input type="submit" value="Buscar" /></td>
		</tr>
	</table>	
	<?php if(isset($usuarios) && mysql_num_rows($usuarios) > 0) { ?>
	<p align="center">Haga clic sobre el usuario que est&aacute; buscando. </p>
	<table border="0" align="center" cellpadding="3" cellspacing="0" class="bordear_tabla">
		<tr>
			<th><p>Folio</p></th>			
			<th><p>Nombre</p></th>
			<th><p>Apellidos</p></th>
			<th><p>Actividad</p></th>
		</tr>
		<?php $i=0; while($usuario = mysql_fetch_array($usuarios, MYSQL_ASSOC)){ if($i%2 == 0) $color = 'EEEEEE'; else $color = 'E0E0E0'; ?>
		<tr id="<?php echo $usuario['id_usuario']."-".$usuario['nombre']."-".$usuario['apellido']."-".str_pad( $usuario['folio_recibo'], 5,"0", STR_PAD_LEFT)."-".$usuario['codigo_barras']."-".$usuario['id_actividad']; ?>" onClick="Seleccionar(id);" bgcolor="#<?php echo $color; ?>" onMouseOver="CambiaColor('f8e8a0',id);" onMouseOut="CambiaColor('<?php echo $color; ?>',id);" class="manita">
			<td><p><?php echo str_pad( $usuario['folio_recibo'], 5,"0", STR_PAD_LEFT); ?></p>
		    </td>		   
			<td><p><?php echo $usuario['nombre']; ?></p>
		    </td>
			<td><p><?php echo $usuario['apellido']; ?></p>
		    </td>
			<td width="300"><p><?php echo $usuario['actividad']; ?></p>
		    </td>
		</tr>
		<?php $i++; } ?>
	</table>
	<?php } else {
		?><p>&nbsp;</p><p>&nbsp;</p><p align="center">No se encontraron resultados con los criterios de b&uacute;squeda escritos.</p><?
	}?>
</form>
</body>
</html>
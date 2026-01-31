<?php
	session_start();
	if(!isset($_SESSION['logginuser']) || $_SESSION['logginuser'] != 1){
		header("Location: index.php");
	}
	include ("../funciones/basedatos.php");
	$conn = Conectar();
	
	if(isset($_GET['accion']) && $_GET['accion'] == "eliminar" && isset($_GET['id_usuario'])){
		$id = $_GET['id_usuario'];
		$strSQL = "DELETE FROM usuarios WHERE id_usuario='".$id."'";
		mysql_query($strSQL);
		$strSQL = "DELETE FROM facturaciones WHERE id_facturacion='".$id."'";
		mysql_query($strSQL);
		$strSQL = "DELETE FROM depositos WHERE id_deposito='".$id."'";
		mysql_query($strSQL);
		//$strSQL = "DELETE FROM actividades WHERE ponente='".$id."'";
		//mysql_query($strSQL);
		$strSQL = "DELETE FROM inscripciones WHERE id_usuario = '".$id."'";
		mysql_query($strSQL);
	}
	
	$registros = 20; // número de registros por pantalla
	$pagina = intval($_GET['_pagi_pg']);
	if (!$pagina) { 
	    $inicio = 0; 
	    $pagina = 1; 
	} 
	else { 
	    $inicio = ($pagina - 1) * $registros; 
	}
	
	$where = "WHERE ";
	if(isset($_GET['asistieron']) && $_GET['asistieron'] != "*") { $where .= "u.asistio = '".$_GET['asistieron']."'"; }
	if(isset($_GET['titular']) && $_GET['titular']!="*") { ($where != "WHERE ") ? $where .= " AND " : ""; $where .= "u.grupo_padre = '".$_GET['titular']."'"; }
	if(isset($_GET['id_entidadfederativa']) && $_GET['id_entidadfederativa']!="*") { ($where != "WHERE ") ? $where = "AND " : ""; $where .= " e.id_entidadfederativa = '".$_GET['id_entidadfederativa']."'";}
	if(isset($_GET['ordenamiento']) && $_GET['ordenamiento']!="*") { $q4 = "u.".$_GET['ordenamiento'].","; } else { $q4 = 'id_usuario, ';}
	if(isset($_GET['participante']) && $_GET['participante'] != "") {
		($where != "WHERE ") ? $where .= " AND " : "";
		$palabras =  $_GET['participante'];
		$q5 = " replace(replace(replace(replace(replace(lower(concat(u.nombre,' ',u.apellido)),'á','a'),'é','e'),'í','i'),'ó','o'),'ú','u') like '%".$palabras."%' ";
	}
	($where == "WHERE ") ? $where = "" : true;
	$strSQL = "SELECT u.*, e.nombre AS 'enombre' 
				FROM usuarios u 
				INNER JOIN estados e ON e.id_entidadfederativa = u.id_entidadfederativa ".$where.$q5." 
				ORDER BY ".$q4." u.nombre";
	$alt["F"] = "Femenino";
	$alt["M"] = "Masculino";
	$alt[""] = "Sin especificar";
?>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd"><html><!-- InstanceBegin template="/Templates/aniei.dwt.php" codeOutsideHTMLIsLocked="false" -->
<head>
<title>:: ANIEI <? echo date("Y"); ?>::</title>
<meta http-equiv="Content-Type" content="text/html; charset=iso-8859-1" />
<link rel="stylesheet" type="text/css" href="../css/body.css">
<link rel="stylesheet" type="text/css" href="../css/exclusivo.css">
<!-- InstanceBeginEditable name="head" -->
<link rel="stylesheet" type="text/css" href="../css/formulario.css">
<script language="javascript" type="text/javascript" src="../js/funciones.js"></script>
<script language="javascript" type="text/javascript" src="../js/formulario.js"></script>
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
			<form name="form1" method="get" action="usuarios_gestion.php">
			<p align="center">Buscar por 
				<select name="asistieron" class="select" id="asistieron" title="Asistencia al congreso de ANIEI">
					<option value="*" selected="selected">Todos</option>
					<option value="1" <?php if($_GET['asistieron']=="1") echo "selected='selected'"; ?>>Asistieron</option>
					<option value="0" <?php if($_GET['asistieron']=="0") echo "selected='selected'"; ?>>No asistieron</option>
				</select> 
			 	y
				 <select name="titular" class="select" id="titular" title="Titular de algún grupo">
				 	<option value="*" selected="selected">Todos</option>
				 	<option value="1" <?php if($_GET['titular']=="1") echo "selected='selected'"; ?>>Titular</option>
			 	</select>
				y 
				<select name="id_entidadfederativa" class="select" title="Estado de la república">
					<option value="*" selected="selected">Todos</option>
					<?php
				$strSQL1 = "SELECT * FROM estados";
				$tipos = mysql_query($strSQL1);
				while($tipo = mysql_fetch_array($tipos, MYSQL_ASSOC)){ ?>
					<option value="<?php echo $tipo['id_entidadfederativa'];?>" <?php if($tipo['id_entidadfederativa']==$_GET['id_entidadfederativa']) echo "selected='selected'"; ?>><?php echo $tipo['nombre']; ?></option>
					<?php } ?>
				</select>
				Ordenados 
				<select name="ordenamiento" class="select" id="ordenamiento" title="Orden en que se mostrarán los datos">
					<option value="folio_recibo" selected>Folio</option>
					<option value="apellido" <?php if($ordenamiento=="apellido") echo "selected='selected'"; ?>>Apellido</option>
				</select>
			</p>
				<p class="centrar">
					Nombre y/o apellido del participante: <input type="text" name="participante" id="participante" value="<?php echo $_GET['participante']; ?>" />
					<input name="Buscar" type="submit" id="Buscar" value="Buscar">
				</p>
			</form>
			<?php	$strSQL1 = $strSQL." LIMIT ".$inicio.",".$registros;
				$rs = mysql_query($strSQL1);
				if(mysql_num_rows($rs) > 0){ ?>
			<table border="0" align="center" cellpadding="5" cellspacing="0" class="bordear_tabla">
				<tr>
					<th align="center">&nbsp;</th>
					<th align="center">&nbsp;</th>
					<th align="center"><p>Folio</p></th>
					<th align="center"><p>Nombre</p></th>
					<!-- <th>Instituci&oacute;n</th>  -->
				  <th align="center"><p>Estado</p></th>
					<th align="center"><p>C&oacute;digo</p></th>
					<th align="center"><p>&nbsp;</p></th>
					<th align="center"><p>&nbsp;</p></th>
					<th align="center"><p>&nbsp;</p></th>
				</tr>
			<?php
				$i=0;
				while($r = mysql_fetch_array($rs)){ 
					if($i%2 == 0) $color = 'EEEEEE'; else $color = 'E0E0E0';
				?>
				<tr id="<?php echo $r['id_usuario']; ?>" bgcolor="#<?php echo $color; ?>" onMouseOver="CambiaColor('f8e8a0',id);" onMouseOut="CambiaColor('<?php echo $color; ?>',id);" class="manita">
					<td class="Estilo1"><? if($r['grupo_padre'] == "0"){?><img src="../img/icon_grupo.png" alt="Jefe de grupo" border="0"><? } ?></td>
					<td class="Estilo1"><img src="../img/sexo<? echo $r['genero']; ?>.png" width="16" height="16" alt="<? echo $alt[$r['genero']]?>"></td>
					<td class="Estilo1"><p><?php echo $r['folio_recibo']; ?></p></td>
					<td class="Estilo1"><p><?php echo trim($r['apellido'])." ".trim($r['nombre']); ?></p></td>					
					<td class="centrar"><p><?php echo $r['enombre']?></p></td>
					<td class="centrar"><p><?php echo $r['codigo_barras']?></p></td>
					<td class="centrar"><a href="usuarios_gestion2.php?accion=modificar&id_usuario=<?php echo $r['id_usuario']; ?>"><img src="../img/usuarios_modificar.gif" alt="Editar" width="16" height="16" border="0"></a></td>
			        <td class="centrar"><a href="pdf2.php?xkyyx=<?php echo $r['id_usuario']; ?>" onClick="return confirm('Este proceso incrementa el contador de Folios, \n ¿Está seguro que desea imprimir el recibo ?')"><img src="../img/recibo.png" alt="Recibo" width="16" height="16" border="0"></a></td>
					<td class="centrar"><a href="#" onClick="ValidaDeleteUsuario('<? echo $_SERVER['PHP_SELF']; ?>?accion=eliminar&id_usuario=<? echo $r['id_usuario']; ?>');"><img src='../img/usuarios_eliminar.gif' alt="Eliminar"  width='16' height='16' border='0'></a></td>
				</tr>
				<?php $i++; } ?>
		</table>
			 <p align="center" class="paginador"><?
			 	$parametros = "";
				if(isset($_GET['asistieron']) && $_GET['asistieron']!="*") {$parametros.="&asistieron=".$_GET['asistieron'];}
				if(isset($_GET['titular']) && $_GET['titular']!="*") {$parametros.="&titular=".$_GET['titular'];}
				if(isset($_GET['estado']) && $_GET['estado']!="*") {$parametros.="&estado=".$_GET['estado'];}
				if(isset($_GET['ordenamiento']) && $_GET['ordenamiento']!="*") {$parametros.="&ordenamiento=".$_GET['ordenamiento'];} else {$parametros.='&ordenamiento=id_usuario';}
				if(isset($_GET['participante']) && $_GET['participante']!="") {$parametros.="&participante=".$_GET['participante'];}
			 	$_pagi_sql = $strSQL; 
				$_pagi_nav_num_enlaces = 10;
				$_pagi_cuantos =  $registros;
				//$_pagi_propagar = split("&", $parametros);
				$_pagi_separador = "";
				$_pagi_nav_anterior = '&nbsp;&nbsp;&nbsp;';
				$_pagi_nav_siguiente = '&nbsp;&nbsp;&nbsp;';
				$_pagi_nav_primera = '&nbsp;&nbsp;&nbsp;';
				$_pagi_nav_ultima = '&nbsp;&nbsp;&nbsp;';
				include("../funciones/paginator.inc.php"); 
				echo $_pagi_navegacion."</p><p align=\"center\">(".$_pagi_info.")"; ?>
			</p>
			<?php } else { ?>
			<p>&nbsp;</p>
			<h4 class="centrar">No se encontraron participantes con los criterios seleccionados.</h4>
			<?php } ?>
			<p class="centrar">&nbsp;</p>
			<p class="centrar"><a href="panel_control.php">Panel de control </a></p>
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
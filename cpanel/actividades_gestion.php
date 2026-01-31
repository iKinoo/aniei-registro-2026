<?php
	session_start();
	if(!isset($_SESSION['logginuser']) || $_SESSION['logginuser'] != 1){
		header("Location: index.php");
	}
	
	include ("../funciones/basedatos.php"); $conn = Conectar();
	 
	$registros = 10;
	$pagina = intval($_GET['pagina']);

	if (!$pagina) { 
	    $inicio = 0; 
	    $pagina = 1; 
	} 
	else { 
	    $inicio = ($pagina - 1) * $registros; 
	} 
	
	$strSQL = "SELECT a.*, u.titulo, u.nombre AS unombre, u.apellido
				FROM actividades a
				LEFT JOIN usuarios u ON u.id_usuario = a.id_ponente
				ORDER BY a.nombre";
	$strSQL1 = $strSQL." LIMIT ".$inicio.",".$registros; 
	$reg = mysql_query($strSQL1);        
?>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd"><html><!-- InstanceBegin template="/Templates/aniei.dwt.php" codeOutsideHTMLIsLocked="false" -->
<head>
<title>:: ANIEI <? echo date("Y"); ?>::</title>
<meta http-equiv="Content-Type" content="text/html; charset=iso-8859-1" />
<link rel="stylesheet" type="text/css" href="../css/body.css">
<link rel="stylesheet" type="text/css" href="../css/exclusivo.css">
<!-- InstanceBeginEditable name="head" -->
<script language="javascript" type="text/javascript" src="../js/funciones.js"></script>
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
			<? if(mysql_num_rows($reg) > 0){ ?>
			<table border="0" align="center" cellpadding="4" cellspacing="0" class="bordear_tabla">
				<tr>
				  <th align="center"><p>Actividad</p></th>
					<th align="center"><p>Horario</p></th>
					<th align="center"><p>Sala</p></th>
					<th align="center"><p>Tipo</p></th>
					<th align="center"><p>Inscritos</p></th>
					<th align="center"><p>Editar</p></th>
					<th align="center"><p>Eliminar</p></th>
				</tr>
			<?php
				$i=0;
				$strSQL1 = "SELECT * FROM tipoactividad";
				$tipos = mysql_query($strSQL1);

                                
				while ($tipo = mysql_fetch_array($tipos, MYSQL_ASSOC)){
					$actividad[$tipo['id_tipo']] = $tipo['descripcion'];
				}
				$strSQL1 = "SELECT * FROM salas";
				$tipos = mysql_query($strSQL1);
				while ($tipo = mysql_fetch_array($tipos, MYSQL_ASSOC)){
					$salas[$tipo['id_sala']] = $tipo['nombre']."<br><span class='Estilo'>".$tipo['ubicacion']."</span>";
				}
								
				while($r = mysql_fetch_array($reg)){ 
					if($i%2 == 0) $color = 'EEEEEE'; else $color = 'E0E0E0';
				?>
				<tr id="<?php echo $r['id_actividad']; ?>" bgcolor="#<?php echo $color; ?>" onMouseOver="CambiaColor('f8e8a0',id);" onMouseOut="CambiaColor('<?php echo $color; ?>',id);" class="manita">
					<td width="300" align="left" class="manita"><p><a href="actividades_gestion_info.php?id_actividad=<?php echo $r['id_actividad']; ?>" title="Clic para ver a los usuarios inscritos"><?php echo $r['nombre']; ?></a><br>
				  <span><?php echo $r['unombre']." ".$r['apellido'];?></span></p></td>
					<td align="center"><p><?php echo substr($r['hora_inicio'],11,5)." a ".substr($r['hora_final'],11,5); ?></p></td>
					<td align="center"><p><?php echo $salas[$r['sala']]; ?></p></td>
					<td align="center"><p><?php echo $actividad[$r['tipo']]; ?></p></td><?php $strSQL1 = "SELECT * FROM inscripciones WHERE id_actividad=".$r['id_actividad'].""; $nnn = mysql_query($strSQL1); $total = mysql_num_rows($nnn); ?>
					<td align="center"><p><?php echo $total."/".$r['cupo']; ?></p></td>
					<td class="centrar"><a href="actividades_gestion2.php?accion=modificar&id_actividad=<?php echo $r['id_actividad']; ?>" title="Editar"><img src="../img/modificar.png" width="16" height="16" border="0"></a></td>
					<td class="centrar"><a href="eliminarActividad.php?id=<?php echo $r['id_actividad']; ?>" title="Eliminar"><img src="../img/eliminar.png" width="16" height="16" border="0"></a></td>
				</tr>
				<?php $i++; } ?>
		</table>
			<p align="center" class="paginador"><?php
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
			<h4 class="centrar">No se existen actualmente actividades.</h4>
			<?php } ?>
			<p class="centrar">&nbsp;</p>
			<p class="centrar"><a href="panel_control.php">Panel de Control </a></p>
			
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
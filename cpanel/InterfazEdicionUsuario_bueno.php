<?php
	session_start();
	if(!isset($_SESSION['logginuser']) || $_SESSION['logginuser'] != 1){
		header("Location: index.php");
	}
	 include ("../funciones/basedatos.php"); $conn = Conectar();
	 $registros = 20; // número de registros por pantalla

	if (!$pagina) { 
	    $inicio = 0; 
	    $pagina = 1; 
	} 
	else { 
	    $inicio = ($pagina - 1) * $registros; 
	}

	if(isset($_GET['asistieron']) && $_GET['asistieron']!="*") {$q1 = "AND u.asistio='".$_GET['asistieron']."'";}
	if(isset($_GET['titular']) && $_GET['titular']!="*") {$q2 = " AND u.grupo='".$_GET['titular']."'";}
	if(isset($_GET['estado']) && $_GET['estado']!="*") {$q3 =" AND estado='".$_GET['estado']."'";}
	if(isset($_GET['ordenamiento']) && $_GET['ordenamiento']!="*") {$q4 = $_GET['ordenamiento'];} else {$q4='id_asistente';}
	$strSQL = "SELECT u.*, e.nombre AS 'enombre' FROM usuarios u, estados e WHERE e.id_estado=u.estado ".$q1.$q2.$q3." ORDER BY u.".$q4.", u.nombre";
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
			<p><b>Indique qu&eacute; usuario desea modificar:</b></p>
			<form name="form1" method="get" action="usuarios_gestion.php">
				<p class="centrar">Buscar por 
				<select name="asistieron" id="asistieron" title="Asistencia al congreso de ANIEI">
					<option value="*" selected="selected">Todos</option>
					<option value="1" <?php if($asistieron=="1") echo "selected='selected'"; ?>>Asistieron</option>
					<option value="0" <?php if($asistieron=="0") echo "selected='selected'"; ?>>No asistieron</option>
				</select> 
				 y
				 <select name="titular" id="titular" title="Titular de algún grupo">
					<option value="*" selected="selected">Todos</option>
					<option value="1" <?php if($titular=="1") echo "selected='selected'"; ?>>Titular</option>
				</select>
				y 
				<select name="estado" title="Estado de la república">
					<option value="*" selected="selected">Todos</option>
				<?php
				$strSQL1 = "SELECT * FROM estados";
				$tipos = mysql_query($strSQL1);
				while($tipo = mysql_fetch_array($tipos, MYSQL_ASSOC)){ ?>
					<option value="<?php echo $tipo['id_estado'];?>" <?php if($tipo['id_estado']==$_GET['estado']) echo "selected='selected'"; ?>><?php echo $tipo['nombre']; ?></option>
				<?php } ?>
				</select>
				Ordenados 
				<select name="ordenamiento" id="ordenamiento" title="Orden en que se mostrarán los datos">
					<option value="id_asistente" selected>Folio</option>
					<option value="apellido" <?php if($ordenamiento=="apellido") echo "selected='selected'"; ?>>Apellido</option>
				</select>
				</p>
				<p class="centrar">
					<input name="Buscar" type="submit" id="Buscar" value="Buscar">
				</p>
			</form>
			<?php	$strSQL1 = $strSQL." LIMIT ".$inicio.",".$registros;
				$usuarios = mysql_query($strSQL1);
				if(mysql_num_rows($usuarios) > 0){ ?>
			<table border="0" align="center" cellpadding="2" cellspacing="0">
				<tr>
					<th>Folio</th>
					<th>Nombre</th>
					<th>Instituci&oacute;n</th>
					<th>Estado</th>
					<th>Editar</th>
					<th>Elimiar</th>
				</tr>
			<?php
				$i=0;
				while($usuario = mysql_fetch_array($usuarios)){ 
					if($i%2 == 0) $color = 'EEEEEE'; else $color = 'E0E0E0';
				?>
				<tr id="u<?php echo $usuario['id_asistente']; ?>" bgcolor="#<?php echo $color; ?>" onMouseOver="CambiaColor('f8e8a0',id);" onMouseOut="CambiaColor('<?php echo $color; ?>',id);" class="manita">
					<td class="Estilo1"><?php echo $usuario['id_asistente'];?></td>
					<td class="Estilo1"><?php echo $usuario['apellido']." ".$usuario['nombre']; ?></td>
					<td class="centrar Estilo1"><?php echo $usuario['institucion']; ?></td>	
					<td class="centrar"><?php echo $usuario['enombre']?></td>
					<td class="centrar"><a href="usuarios_gestion2.php?id=<?php echo $usuario['id_asistente']; ?>"><img src="../img/b_usredit.png" width="16" height="16" border="0"></a></td>
					<td class="centrar">

                 <?php	$sqlPonente = "SELECT id_actividad FROM actividades where ponente = '".$usuario['id_asistente']."' or ponente2 = '".$usuario['id_asistente']."' or ponente3 = '".$usuario['id_asistente']."'";
        $vponente = mysql_query($sqlPonente);
        if(mysql_num_rows($vponente) < 1){ 
           if( $usuario['grupo']!="1") {               
              echo "<a href='falloeliminarUsuarioX.php?id=".$usuario['id_asistente']."'><img src='img/b_usrdrop.png'  width='16' height='16' border='0'>"; }} ?> 

</a></td>
				</tr>
				<?php $i++; } ?>
			</table>
			<p class="centrar">
			<?php
			$resultados = mysql_query($strSQL);
			$total_registros = mysql_num_rows($resultados);
			$strSQL1 .= $strSQL." LIMIT ".$inicio.",".$registros;
			//$strSQL = "SELECT * FROM usuarios WHERE padre='' ORDER BY nombre DESC LIMIT ".$inicio.",".$registros;
			//echo $strSQL;
			$resultados = mysql_query($strSQL1);
			$total_paginas = ceil($total_registros / $registros);		
			
			if($total_registros) {
				$parametros = "";
				if(isset($_GET['asistieron']) && $_GET['asistieron']!="*") {$parametros.="&asistieron=".$_GET['asistieron'];}
				if(isset($_GET['titular']) && $_GET['titular']!="*") {$parametros.="&titular=".$_GET['titular'];}
				if(isset($_GET['estado']) && $_GET['estado']!="*") {$parametros.="&estado=".$_GET['estado'];}
				if(isset($_GET['ordenamiento']) && $_GET['ordenamiento']!="*") {$parametros.="&ordenamiento=".$_GET['ordenamiento'];} else {$parametros.='&ordenamiento=id_asistente';}
				if(($pagina - 1) > 0) { echo "<a href='".$_SERVER['PHP_SELF']."?pagina=".($pagina-1).$parametros."'>< Anterior</a> ";}
				for ($i=1; $i<=$total_paginas; $i++){ 
					if ($pagina == $i) {echo "<b>".$pagina."</b> "; }else{ echo "<a href='".$_SERVER['PHP_SELF']."?pagina=$i".$parametros."'>$i</a> "; }
				}			  
				if(($pagina + 1)<=$total_paginas) { echo " <a href='".$_SERVER['PHP_SELF']."?pagina=".($pagina+1).$parametros."'>Siguiente ></a>"; }
			}
			?>
			</p>
			<p class="centrar"><a href="panel_control.php">Regresar</a></p>
			<?php } else { ?>
			<p class="centrar">No se existen actualmente registros de usuarios.</p>
			<p class="centrar">&nbsp;</p>
			<p class="centrar"><a href="panel_control.php">Regresar</a></p>
			<?php } ?>
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
<?php
	session_start();
	if(!isset($_SESSION['logginuser']) || $_SESSION['logginuser'] != 1){
		header("Location: index.php");
	}
	 include ("../funciones/basedatos.php"); $conn = Conectar(); 
	 $registros = 20;

	if (!$pagina) { 
	    $inicio = 0; 
	    $pagina = 1; 
	} 
	else { 
	    $inicio = ($pagina - 1) * $registros; 
	} 
?>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd"><html><!-- InstanceBegin template="/Templates/aniei.dwt.php" codeOutsideHTMLIsLocked="false" -->
<head>
<title>:: ANIEI <? echo date("Y"); ?>::</title>
<meta http-equiv="Content-Type" content="text/html; charset=iso-8859-1" />
<link rel="stylesheet" type="text/css" href="../css/body.css">
<link rel="stylesheet" type="text/css" href="../css/exclusivo.css">
<!-- InstanceBeginEditable name="head" --><!-- InstanceEndEditable -->
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
			<p><b>Indique qu&eacute; grupo desea modificar:</b></p>
			<?php	$strSQL = "SELECT * FROM usuarios WHERE grupo='1'";
				$usuarios = mysql_query($strSQL);
				if(mysql_num_rows($usuarios) > 0){ ?>
			<table border="0" align="center" cellpadding="4" cellspacing="0">
				<tr>
					<th>Titular</th>
					<th>Instituci&oacute;n</th>
					<th>Editar</th>
					<th>Imprimir</th>
					<th>Eliminar</th>
				</tr>
			<?php
				$i=0;
				while($usuario = mysql_fetch_array($usuarios)){ 
					if($i%2 == 0) $color = 'EEEEEE'; else $color = 'E0E0E0';
				?>
				<tr id="<?php echo $usuario['id_asistente']; ?>" bgcolor="#<?php echo $color; ?>" onMouseOver="CambiaColor('f8e8a0',id);" onMouseOut="CambiaColor('<?php echo $color; ?>',id);" class="manita">
					<td class="Estilo1"><a href="InterfazMostrarGrupo.php?id=<?php echo $usuario['id_asistente']; ?>" title="Mostrar a su grupo"><?php echo $usuario['nombre']." ".$usuario['apellido']; ?></a></td>
					<td class="centrar"><?php
					 if( $usuario['id_institucion'] > 0 ){					 
  					    $strSQL = "SELECT nombre FROM instituciones where id_institucion = ".$usuario['id_institucion'];
		                $strSQL23 = mysql_query($strSQL);
    		            $strSQL34= mysql_fetch_row($strSQL23);
			           echo $strSQL34[0]; 
					 
					 }
					 else{ 
  					   echo $usuario['institucion']; 
					 }
					?></td>
					<td class="centrar"><a href="InterfazEdicionGrupo2.php?id=<?php echo $usuario['id_asistente']; ?>" title="Editar"><img src="../img/b_usredit.png" width="16" height="16" border="0"></a></td>
					<td class="centrar"><a href="pdf2.php?xkyyx=<?php echo $usuario['iFolioRecibo']; ?>" onClick="return confirm('Este proceso incrementa el contador de Folios, \n ¿Está seguro que desea imprimir el recibo ?')"><img src="../img/recibo.png" width="16" height="16" border="0"></a></td>
					<td class="centrar">

                                         <?php	$sqlPonente = "SELECT id_actividad FROM actividades where ponente = '".$usuario['id_asistente']."' or ponente2 = '".$usuario['id_asistente']."' or ponente3 = '".$usuario['id_asistente']."'";
        $vponente = mysql_query($sqlPonente);
        if(mysql_num_rows($vponente) < 1){             
              echo "<a href='falloeliminarGrupo.php?id=".$usuario['id_asistente']."'><img src='img/b_usrdrop.png'  width='16' height='16' border='0'>";} ?> 







</a></td>
				</tr>
				<?php $i++; } ?>
			</table>
			<p class="centrar">
			<?php
			$resultados = mysql_query($strSQL);
			$strSQL = $strSQL." ORDER BY nombre DESC LIMIT ".$inicio.",".$registros;
			$total_registros = mysql_num_rows($resultados); 
			$resultados = mysql_query($strSQL);
			$total_paginas = ceil($total_registros / $registros);		
			
			if($total_registros) {
				if(($pagina - 1) > 0) { echo "<a href='InterfazEdicionGrupo.php.php?pagina=".($pagina-1)."'>< Anterior</a> ";}				
				for ($i=1; $i<=$total_paginas; $i++){ 
					if ($pagina == $i) {echo "<b>".$pagina."</b> "; }else{ echo "<a href='InterfazEdicionGrupo.php.php?pagina=$i'>$i</a> "; }
				}			  
				if(($pagina + 1)<=$total_paginas) { echo " <a href='InterfazEdicionGrupo.php.php?pagina=".($pagina+1)."'>Siguiente ></a>"; }
			}
			?>
			</p>
			<p class="centrar"><a href="panel_control.php">Panel de Control </a></p>
			<?php } else { ?>
			<p class="centrar">No  existen actualmente registros de grupos.</p>
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
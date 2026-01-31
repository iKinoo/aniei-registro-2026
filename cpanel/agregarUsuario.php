<?php
	session_start();
	if(!isset($_SESSION['logginuser']) ){
		header("Location: index.php");
	}
	include("../funciones/funciones.php");
	include("../funciones/basedatos.php");
	
	extract($_POST, EXTR_OVERWRITE);
	
	$conn = Conectar();
	mysql_query("BEGIN;");

	// Generación de ID de usuario
	$fecha = getdate();
	
	/*
	$archivo = "c:/rqt/maquina.txt";
	
	
	echo file_exists($archivo);
	
	if (file_exists($archivo)) {
	    $gestor = fopen($archivo,"r");
	    $id = fgets($gestor);
	} else {
	    //$id = $fecha["year"];
		header("Location: index.php");
	}

	//if ($fecha["mon"]<10){ $id = $id."0".$fecha["mon"]; } else { $id = $id.$fecha["mon"]; }	
	if ($fecha['mday']<10){ $id = $id."0".$fecha["mday"]; } else { $id = $id.$fecha["mday"]; }	
	if ($fecha['hours']<10){ $id = $id."0".$fecha["hours"]; } else { $id = $id.$fecha["hours"]; }	
	if ($fecha['minutes']<10){ $id = $id."0".$fecha["minutes"]; } else { $id = $id.$fecha["minutes"]; }	
	if ($fecha['seconds']<10){ $id = $id."0".$fecha["seconds"]; } else { $id = $id.$fecha["seconds"]; }
	
	
	$sql = "SELECT * FROM usuarios WHERE id_asistente='".$id."'";
	$result = mysql_query($sql);
	if (mysql_num_rows($result) == 1) {
		echo "<script language='JavaScript' type='text/javascript'>alert('Intente de nuevo.');history.back();</script>";
	} else { */	
			//if ($rfc != '') { $id_rfc = $id; }
			
	$padre = "";
	//$_SESSION["temp_id"] = $id;
	$_SESSION['temp_nombre'] = strtoupper($apellido." ".$nombre); 
	
	if ($tipins) {
		$institucion="";
	} else{
		$iidinstitucion=0;
	}
	
	
	if ($monto != '') {  // si realizo deposito el total será el deposito que hizo.
		//$id_deposito = $id; 
		$costototal = $monto;
	} else{
		if(!isset($grupocosto)){
			// Hallar la clave del costo y obtenerlo de la tabla.
			$costototal = costoregistro( $tipins , $tipo);
			$sql = "SELECT costo FROM costos where id_costo = ".$costototal;
			$result = mysql_query($sql);
			$costototal2 = mysql_fetch_row($result);
			$costototal = $costototal2[0];
		}
		else {
			   $costototal = $grupocosto;
		}
	}
	
	// Nos conectamos a la Base de Datos y luego generamos el Query.
	$sql="INSERT INTO usuarios (nombre, apellido,id_institucion, institucion, dependencia, estado, correo, telefono, titulo, lada, extension, tipo, rfc, id_asistente, cargo, grupo, carrera, facturacion, padre, asistio, genero, verifico,folio,costoins, codigo_barras) 
	VALUES ('$nombre', '$apellido','$iidinstitucion', '$institucion', '$facultad', '$estado', '$correo', '$telefono', '$titulo', '$lada', '$extension', '$tipo', '', '','$cargo', '$grupo', '$carrera','$facturacion','','','$genero','','','$costototal', $codBarras)";
	
	$result = mysql_query($sql);
	$_SESSION['temp_recibo'] = mysql_insert_id($conn);
	$id = "A".str_pad( $_SESSION['temp_recibo'], 5,"0", STR_PAD_LEFT);
	if ($rfc != '') { $id_rfc = $id; };
	if ($monto != '') { $id_deposito = $id; };
	$_SESSION["temp_id"] = $id;

	$sql="update usuarios set id_asistente = '".$id."' , rfc = '".$id_rfc."' where iFolioRecibo = ".$_SESSION['temp_recibo'];
	 $result = mysql_query($sql);
	
	
	//Si hay factura
	if ($rfc != '') {
		 $rsql="SELECT * FROM facturaciones WHERE id_facturacion ='".$id_rfc."'";
		 $rresult = mysql_query($rsql);
		 if (!mysql_fetch_array($rresult)) {
			  $nsql="INSERT INTO facturaciones (id_facturacion, razon, rfc, calle, exterior, interior, colonia, municipio, estado, codigo) VALUES ('$id_rfc', '$razon', '$rfc', '$calle', '$num_ext', '$num_int', '$colonia', '$municipio', '$select', '$postal')";
			  $nresult = mysql_query($nsql);
		 }
	}

	//Si hay deposito
	if ($monto != '') {
		 $rrsql="SELECT * FROM depositos WHERE id_deposito ='".$id_deposito."'";
		 $rrresult = mysql_query($rrsql);
		 if (!mysql_fetch_array($rrresult)) {
			list($d,$m,$a) = split("/",$fecha_dep);
			$fecha_dep = $a."-".$m."-".$d;
			$hora_dep = $hora_dep.":00";
			$nrsql="INSERT INTO depositos (id_deposito, ciudad, sucursal, fecha, hora, referencia, monto) VALUES ('$id_deposito', '$ciudad_dep', '$sucursal_dep', '$fecha_dep', '$hora_dep', '$referencia_dep','$monto')";
			$nrresult = mysql_query($nrsql);
		 }
	}

	//Si hay grupo
	if ($grupo=='1') {
		$total_participantes = $_POST['total_participantes'];
		for ($i=1; $i<=$total_participantes; $i++){				  		
			if ($_POST['nombre'.$i] != ""){						
				if($i<10){ $idd = $id."00".$i; }
				else {if($i<100){ $idd = $id."0".$i; }
					else {$idd = $id.$i;}
				}
				$gsql = "INSERT INTO usuarios (nombre, apellido,id_institucion, institucion, dependencia, estado, correo, telefono, titulo, lada, extension, tipo, rfc, id_asistente, cargo, grupo, carrera, facturacion,padre,genero) VALUES ('".$_POST['nombre'.$i]."', '".$_POST['apellido'.$i]."','".$iidinstitucion."', '".$institucion."', '".$facultad."', '".$estado."', '', '".$telefono."', '', '".$lada."', '".$extension."', '1', '', '".$idd."','1', '2', '".$carrera."','','".$id."','')";
				$gresult = mysql_query($gsql);
			}
		}
	}

	mysql_query("COMMIT;");    
	mysql_close($conn);
    
	$men=fopen("correo.txt", "r");
	$mensaje= strval(fread($men,200));
	fclose($men);
	mail($correo, "Congreso ANIEI - Preinscripción\n",$mensaje."\nTu clave de preinscripción es: ".$id."\nGuárdala para cualquier aclaración.\n", "From: Congreso ANIEI <congreso@aniei.org.mx>");
	header("Location: aceptado.php");
?>
<?php
	session_start();
	if(!isset($_SESSION['logginuser']) || $_SESSION['logginuser'] != 1){
		header("Location: index.php");
	}
	
	include("../funciones/funciones.php");
	include("../funciones/basedatos.php");
	
	extract($_POST, EXTR_OVERWRITE);
	
	$conn = Conectar();
	mysql_Query("BEGIN;");
	$cambio = "";
		
	if(isset($_POST['titular']) && $_POST['grupo_user'] != "1"){
		if($_POST['grupo_user'] == "0") $cambio = ", grupo=2, padre='".$_POST['titular']."'";
		if($_POST['grupo_user'] == "2") $cambio = ", grupo=0, padre='' ";
	}
	
	if ($tipins) {
			    $institucion="";
			}
			else{
			    $iidinstitucion=0;
			}
			
			if ($monto != '') {  // si realizo deposito el total será el deposito que hizo.
			    $id_deposito = $id; 
				$costototal = $monto;
		    }
			else{
			if( ! isset($grupocosto) ) {
			
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
					
	
	$sql="UPDATE usuarios 
		SET nombre='".$nombre."', 
			apellido='".$apellido."', 
			id_institucion='".$iidinstitucion."',
			institucion='".$institucion."', 
			dependencia='".$facultad."', 
			estado='".$estado."', 
			correo='".$correo."', 
			telefono='".$telefono."', 
			titulo='".$titulo."', 
			lada='".$lada."',                         
			extension='".$extension."', 
			tipo='".$tipo."',
			rfc='".$id_rfc."', 
			cargo='".$cargo."', 
			carrera='".$carrera."', 
			facturacion='".$facturacion."',
			genero='".$genero."',
			costoins='".$costototal."'  
		WHERE id_asistente='".$id."'";
		$result = mysql_query($sql);
		
            if(($_POST['grupo_user'] == "1") || isset($_POST['grupo'])){
               $strSQL = "UPDATE usuarios SET id_institucion ='".$iidinstitucion."',institucion='".$institucion."', dependencia='".$facultad."',  estado='".$estado."' WHERE padre='".$id."' AND grupo='2'";
              mysql_query($strSQL);
             }



	//Si hay factura
	if ($rfc != '') {
	  $nsql = "SELECT * FROM facturaciones WHERE id_facturacion='".$id."'";
	  $r = mysql_query($nsql);
	  if (mysql_num_rows($r)>0){
		  $nsql="UPDATE facturaciones 
			SET razon='".$razon."',
				rfc='".$rfc."', 
				calle='".$calle."', 
				exterior='".$num_ext."', 
				interior='".$num_int."', 
				colonia='".$colonia."', 
				municipio='".$municipio."', 
				estado='".$select."', 
				codigo='".$postal."' 
			WHERE id_facturacion='".$id."'";
	   } else {
	   	$nsql="INSERT INTO facturaciones (id_facturacion, razon, rfc, calle, exterior, interior, colonia, municipio, estado, codigo) VALUES ('".$id."', '".$razon."', '".$rfc."', '".$calle."', '".$num_ext."', '".$num_int."', '".$colonia."', '".$municipio."', '".$select."', '".$postal."')";	   	
	   }
	  $nresult = mysql_query($nsql);
	  //echo $nsql."<br>";
	}

	//Si hay deposito
	if ($monto != '') {
                if (substr($fecha_dep,0,5) != "2007-"){
		   list($d,$m,$a) = split("/",$fecha_dep);
                   $fecha_dep = $a."-".$m."-".$d;
                  }

		
		if($hora_dep=="") $hora_dep="00:00:00"; else $hora_dep.":00";
		$nsql = "SELECT * FROM depositos WHERE id_deposito='".$id."'";
	 	$r = mysql_query($nsql);
		if (mysql_num_rows($r)>0){
		$nrsql="UPDATE depositos 
			SET ciudad='".$ciudad_dep."', 
			sucursal='".$sucursal_dep."', 
			fecha='".$fecha_dep."', 
			hora='".$hora_dep."', 
			referencia='".$referencia_dep."',
			monto='".$monto."' 
			WHERE id_deposito='".$id."'";
		} else {
			$nrsql="INSERT INTO depositos (id_deposito, ciudad, sucursal, fecha, hora, referencia, monto) VALUES ('".$id."', '".$ciudad_dep."', '".$sucursal_dep."', '".$fecha_dep."', '".$hora_dep."', '".$referencia_dep."','".$monto."')";
		}
		$nrresult = mysql_query($nrsql);
		//echo $nrsql;
	}

	//Si hay grupo
	
	if ($grupo=='1') {
		$total_participantes = $_POST['total_participantes'];
		$total_a_actualizar = $_POST['total_a_actualizar'];		
				
		if ( $total_a_actualizar > 0 ){
		
		    for($i=1; $i<=$total_a_actualizar; $i++){
			    $id_aux = $_POST['n'.$i];
			   if ($_POST['nombre'.$i] != ""){
				  $gsql = "UPDATE usuarios SET nombre='".$_POST['nombre'.$i]."', apellido='".$_POST['apellido'.$i]."' ,  id_institucion ='".$iidinstitucion."', institucion ='".$institucion."' , dependencia='".$facultad."' WHERE id_asistente='".$_POST['n'.$i]."'";
				  $gresult = mysql_query($gsql);
				//echo $gsql."<br>";
			  }
   		    }
		}	
             
       $maximo=0;
		for ($i=$total_a_actualizar+1; $i<=$total_participantes; $i++){
		
			if ($_POST['nombre'.$i] != ""){
                                // no tenia inicializada la variable :p
	           
               $gresult=false;			   
			   while($gresult==false){
					$maximo++;
					if($maximo<10){ $idd = $id."00".$maximo; }
					else {
                         if($maximo<100){ $idd = $id."0".$maximo; }
				         else {$idd = $id.$maximo;}
					}
					$gsql = "select id_asistente from usuarios where id_asistente = '".$idd."'";
					//echo $gsql." <br>";
					$gresult = mysql_query($gsql);
					if (mysql_num_rows($gresult) >0){
					    $gresult = false;
					} 
					else{
   					  $gresult = true;
					}
				}

					$gsql = "INSERT INTO usuarios (nombre, apellido,id_institucion, institucion, dependencia, estado, correo, telefono, titulo, lada, extension, tipo, rfc, id_asistente, cargo, grupo, carrera, facturacion,padre,genero) VALUES ('".$_POST['nombre'.$i]."', '".$_POST['apellido'.$i]."','".$iidinstitucion."', '".$institucion."', '".$facultad."', '".$estado."', '', '".$telefono."', '', '".$lada."', '".$extension."', '1', '', '".$idd."','1', '2', '".$carrera."','','".$id."','')";
					$gresult = mysql_query($gsql);
					//echo $gsql."<br>";
				
			}
		}
		$grupo = "_grupo";
	}
	mysql_query("COMMIT;");
	mysql_close($conn);
	if($grupo=="0") $grupo = "";
	header("Location: actualizado".$grupo.".php");
?>
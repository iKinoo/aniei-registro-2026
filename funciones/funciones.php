<?php

	// Esta función regresa el valor en días de dos fechas dadas
	// Si diferencia > 0 entonces Fecha1 > Fecha2   Faltan N días para llegar a la Fecha2
	// Si diferencia < 0 entonces Fecha1 < Fecha2   Ya pasaron N días después de la Fecha2
	// Si diferencia = 0 entonces Fecha1 = Fecha2
	function DiferenciaFechas($fecha1, $fecha2){
		list($anio, $mes, $dia) = split("-", $fecha1);
		$fecha1 = mktime(0,0,0, $mes, $dia, $anio);
		list($anio, $mes, $dia) = split("-", $fecha2);
		$fecha2 = mktime(0,0,0, $mes, $dia, $anio);
		$diferencia = ($fecha1-$fecha2) / 86400; // 86400 = 60seg * 60min * 24 hrs = Cantidad de segundos que transcurre en un día.
		return $diferencia;		
	}
	
	// Esta función regresa el nombre del mes
	function Meses($m){
		$meses = array("", "Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre");
		return $meses[$m];
	}
	
	// Esta función regresa el nombre del día de la semana Domingo = 0, Lunes = 1, ..., Sábado = 6
	function Dias($d){
		$dias = array("Domingo","Lunes","Martes","Miércoles","Jueves","Viernes","Sábado");
		return $dias[$d];
	}
	
	// Convierte el formato de Fecha de MYSQL a una frase. Ejemplo: 2007-25-05  ==>  25/05/2007
	function FormatoFechaFrase($f){
		list($fecha, $hora) = split(" ", $f);
		list($anio, $mes, $dia) = split("-", $fecha);
		//$ff = $dia." de ".Meses((int) $mes)." del ".$anio;
		$ff = $dia."/".$mes."/".$anio;
		return $ff;
	}
	
	// Convierte el formato de Fecha de MYSQL a una frase. Ejemplo: 2007-25-05  ==>  05 de Mayo del 2007
	function FormatoFechaFrase2($f){
		list($fecha, $hora) = split(" ", $f);
		list($anio, $mes, $dia) = split("-", $fecha);
		$ff = $dia." de ".Meses((int) $mes)." del ".$anio;
		return $ff;
	}
	
	// Devuelve la cadena PM o AM, dependiendo de la hora que sea
	function FormatoHora($h){
		list($hora, $min, $seg) = split(":", $h);
		if($hora >=12) {
			$texto = "pm";
		} else {
			$texto = "am";
		}
		$hh = $hora.":".$min.$texto;
		return $hh;
	}
	
	// Convierte el formato de Fecha-Hora de MYSQL a una frase. Ejemplo: 2007-25-05 12:30:25  ==>  05 de Mayo del 2007 a las 12:30:25
	function FormatoFechaHoraFrase($f){
		list($fecha, $hora) = split(" ", $f);
		list($anio, $mes, $dia) = split("-", $fecha);
		$ff = $dia." de ".Meses((int) $mes)." del ".$anio." a las ".FormatoHora($hora);
		return $ff;
	}
	
	// Convierte el formato de Fecha-Hora de MYSQL a una frase. Ejemplo: 2007-25-05 12:30:25  ==>  05 de Mayo del 2007 <br> 12:30:25
	function FormatoFechaHoraFrase2($f){
		list($fecha, $hora) = split(" ", $f);
		list($anio, $mes, $dia) = split("-", $fecha);
		$ff = $dia." de ".Meses((int) $mes)." del ".$anio."<br>".FormatoHora($hora);
		return $ff;
	}
	
	// Regresa una frase de la fecha actual. Ejemplo:  06-23-06-2007  ==>  23 de Junio del 2007
	function FechaActual(){
		list($NombreDia, $dia, $mes, $anio) = split("-",date("w-d-n-Y"));
		$fecha = $dia." de ".Meses($mes)." del ".$anio;
		return $fecha;
	}
	
	function FormatoFecha($f){
		list($fecha, $hora) = split(" ", $f);
		list($anio, $mes, $dia) = split("-", $fecha);
		$ff = $dia."/".Meses((int)$mes)."/".$anio;
		return $ff;
	}
	
	function FormatoFecha2($f){
		list($fecha, $hora) = split(" ", $f);
		list($anio, $mes, $dia) = split("-", $fecha);
		list($hh, $mm, $ss) = split(":", $hora);
		$ff = $dia."/".Meses((int)$mes)."/".$anio."<br>".$hh.":".$mm;
		return $ff;
	}
	
	function FechaNoticia($f){
		list($fecha, $hora) = split(" ", $f);
		list($anio, $mes, $dia) = split("-", $fecha);
		list($hh, $mm, $ss) = split(":", $hora);
		$ff = $dia." de ".Meses((int) $mes);
		return $ff;
	}

	// Esta función convierte caracteres especiales a su código en HTML
	function HTML($cadena){
		$acentos = array("á","é","í","ó","ú","ñ","ü","Á","É","Í","Ó","Ú","Ñ","Ü","¿","\n","\r");
		$acentosHTML = array("&aacute;","&eacute;","&iacute;","&oacute;","&uacute;","&ntilde;","&uuml;","&Aacute;","&Eacute;","&Iacute;","&Oacute;","&Uacute;","&Ntilde;","&Uuml;","&iquest;","<p>","</p>");
	
		for($i=0;$i<count($acentos);$i++){
			$cadena = str_replace($acentos[$i],$acentosHTML[$i],$cadena);
		}
		return $cadena;
	}
	
	// Esta funcion convierte el tamaño en bytes a una aproximacion mayor en KB, MB, etc.
	function FormatoBytes($a) {
		$unim = array("B","KB","MB","GB","TB","PB");
		$c = 0;
		while ($a>=1024) {
			$c++;
			$a = $a/1024;
		}
		return number_format($a,($c ? 2 : 0),",",".")." ".$unim[$c];
	}
	
	function MimeType($tipo){
		switch($tipo){
			case "image/jpeg"  : 
			case "image/pjpeg" : $ext = "jpg"; break;
			case "image/gif"   : $ext = "gif"; break;
			case "image/png"   : 
			case "image/x-png" : $ext = "png"; break;
			case "application/x-shockwave-flash": $ext = "swf"; break;
			case "image/psd" : $ext = "psd"; break;
			case "image/bmp" : $ext = "bmp"; break;
			case "image/tiff" : $ext = "tiff"; break;
			case "image/jp2" : $ext = "jpg2"; break;
			case "image/iff" : $ext = "iff"; break;
		}
		return $ext;
	}
	
	function FileExtension($archivo){
		$d = explode(".",$archivo);
		$ultimo = count($d);
		return strtolower($d[$ultimo-1]);
	}
	
	function Thumbnail($path, $archivo, $ancho, $alto, $output_filename = ""){
		include_once("phpThumbs/phpthumb.class.php");
		$imagen = new phpthumb();
		$imagen->setParameter("w", $ancho);
		$imagen->setParameter("h", $alto);
		$imagen->setParameter("src", $path."/".$archivo);
		if($output_filename == ""){ $output_filename = $path."/".$archivo; }
		if ($imagen->GenerateThumbnail()) { // this line is VERY important, do not remove it!
			if ($imagen->RenderToFile($output_filename)) {
				return true;
			}
		}
		return false;
	}
	
	function ThumbnailCrop($path, $archivo, $top, $left, $ancho, $alto, $output_filename = ""){
		include_once("phpThumbs/phpthumb.class.php");
		$imagen = new phpthumb();
		$imagen->setParameter("sw", $ancho);
		$imagen->setParameter("sh", $alto);
		$imagen->setParameter("sx", $left);
		$imagen->setParameter("sy", $top);
		$imagen->setParameter("src",$path."/".$archivo);
		if($output_filename == "") { $output_filename = $path."/tn_".$archivo; }
		if ($imagen->GenerateThumbnail()) { // this line is VERY important, do not remove it!
			if ($imagen->RenderToFile($output_filename)) {
				return true;
			}
		}
		return false;
	}
	
	function EnviarMail($nombre_destino, $correo_destino, $nombre_fuente, $correo_fuente, $txt, $html, $asunto){
		
		# -=-=-=- MIME BOUNDARY
		
		$mime_boundary = "----ANIEI----".md5(time());
		
		# -=-=-=- MAIL HEADERS
		
		if(trim($asunto) == ""){
			$subject = "ANIEI ".date("Y");
		} else {
			$subject = $asunto;
		}
		
		$headers = "From: ".$nombre_fuente." <".$correo_fuente."> \n";
		$headers .= "Reply-To: ".$nombre_fuente." <".$correo_fuente."> \n";
		$headers .= "To: ".$nombre_destino." <".$correo_destino."> \n";
		$headers .= "MIME-Version: 1.0\n";
		$headers .= "Content-Type: multipart/alternative; boundary=\"$mime_boundary\"\n";
		
		# -=-=-=- TEXT EMAIL PART
		
		$message = "--$mime_boundary\n";
		$message .= "Content-Type: text/plain; charset=UTF-8\n";
		$message .= "Content-Transfer-Encoding: 8bit\n\n";
		$message .= $txt."\n\n";
		
		# -=-=-=- HTML EMAIL PART
		 
		$message .= "--$mime_boundary\n";
		$message .= "Content-Type: text/html; charset=UTF-8\n";
		$message .= "Content-Transfer-Encoding: 8bit\n\n";
		
		$message .= "<html>\n";
		$message .= "<body style=\"font-family:Verdana, Verdana, Geneva, sans-serif; font-size:14px; color:#666666;\">\n"; 
		$message .= $html."<br>\n";
		$message .= "<br>\n";
		$message .= "</body>\n";
		$message .= "</html>\n";
		
		# -=-=-=- FINAL BOUNDARY
		
		$message .= "--".$mime_boundary."--\n\n";
		
		# -=-=-=- SEND MAIL
		
		$mail_sent = @mail($destino, $subject, $message, $headers);
		return $mail_sent;
	}
	
	function GeneraPassword(){
		$str = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890";
		$cad = "";
		for($i=0;$i<12;$i++) {
			$cad .= substr($str,rand(0,62),1);
		}
		return $cad;
	}
	
	function AscDescImg($TipoOrden){
		if($TipoOrden == "ASC"){
			echo "<img src='imagenes/flecha_abajo.gif' title='Orden ascendente'>";
		}
		
		if($TipoOrden == "DESC"){
			echo "<img src='imagenes/flecha_arriba.gif' title='Orden descendente'>";
		}
	}

	function costoregistro ( $sociof, $tipousuariof ) {
         if( $sociof ){  // determinar si es socio de la ANIEI
		    switch ($tipousuariof) {
			        case 1:
					$clavef = 1;
					break;
					case 2:
					$clavef = 2;
					break;
					case 3:
					$clavef = 2;
					break;
					case 4:
					$clavef = 2;
					break;
					case 5:
					$clavef = 3;
					break;
					case 6:
					$clavef = 1;
					break;
					default:
					$clavef = 1;				
			}		 
		 }
		 else{
		 	switch ($tipousuariof) {
			        case 1:
					$clavef = 5;
					break;
					case 2:
					$clavef = 6;
					break;
					case 3:
					$clavef = 6;
					break;
					case 4:
					$clavef = 6;
					break;
					case 5:
					$clavef = 7;
					break;
					case 6:
					$clavef = 5;
					break;
					default:
					$clavef = 5;				
			}		 
		 }
  
   return $clavef;

}


	function cantidadletra ($numero) {  
		// Primero tomamos el numero y le quitamos los caracteres especiales y extras  
		// Dejando solamente el punto "." que separa los decimales  
		// Si encuentra mas de un punto, devuelve error.  
		// NOTA: Para los paises en que el punto y la coma se usan de forma  
		// inversa, solo hay que cambiar la coma por punto en el array de "extras"  
		// y el punto por coma en el explode de $partes  
		  
		$extras= array("/[\$]/","/ /","/,/","/-/");  
		$limpio=preg_replace($extras,"",$numero);  
		$partes=explode(".",$limpio);  
		if (count($partes)>2) {  
			return "Error, el n&uacute;mero no es correcto";  
			exit();  
		}  
		  
		// Ahora explotamos la parte del numero en elementos de un array que  
		// llamaremos $digitos, y contamos los grupos de tres digitos  
		// resultantes  
		  
		$digitos_piezas=chunk_split ($partes[0],1,"#");  
		$digitos_piezas=substr($digitos_piezas,0,strlen($digitos_piezas)-1);  
		$digitos=explode("#",$digitos_piezas);  
		$todos=count($digitos);  
		$grupos=ceil (count($digitos)/3);  
		  
		// comenzamos a dar formato a cada grupo  
		  
		$unidad = array   ('un','dos','tres','cuatro','cinco','seis','siete','ocho','nueve');  
		$decenas = array ('diez','once','doce', 'trece','catorce','quince');  
		$decena = array   ('dieci','veinti','treinta','cuarenta','cincuenta','sesenta','setenta','ochenta','noventa');  
		$centena = array   ('ciento','doscientos','trescientos','cuatrocientos','quinientos','seiscientos','setecientos','ochocientos','novecientos');  
		$resto=$todos;  
		  
		for ($i=1; $i<=$grupos; $i++) {  
			  
			// Hacemos el grupo  
			if ($resto>=3) {  
				$corte=3; } else {  
				$corte=$resto;  
			}  
				$offset=(($i*3)-3)+$corte;  
				$offset=$offset*(-1);  
			  
			// la siguiente seccion es una adaptacion de la contribucion de cofyman y JavierB  
			  
			$num=implode("",array_slice ($digitos,$offset,$corte));  
			$resultado[$i] = "";  
			$cen = (int) ($num / 100);              //Cifra de las centenas  
			$doble = $num - ($cen*100);             //Cifras de las decenas y unidades  
			$dec = (int)($num / 10) - ($cen*10);    //Cifra de las decenas  
			$uni = $num - ($dec*10) - ($cen*100);   //Cifra de las unidades  
			if ($cen > 0) {  
			   if ($num == 100) $resultado[$i] = "cien";  
			   else $resultado[$i] = $centena[$cen-1].' ';  
			}//end if  
			if ($doble>0) {  
			   if ($doble == 20) {  
				  $resultado[$i] .= " veinte";  
			   }elseif (($doble < 16) and ($doble>9)) {  
				  $resultado[$i] .= $decenas[$doble-10];  
			   }else {  
				  $resultado[$i] .=' '. $decena[$dec-1];  
			   }//end if  
			   if ($dec>2 and $uni<>0) $resultado[$i] .=' y ';  
			   if (($uni>0) and ($doble>15) or ($dec==0)) {  
				  if ($i==1 && $uni == 1) $resultado[$i].="un";  
				  elseif ($i==2 && $num == 1) $resultado[$i].="";  
				  else $resultado[$i].=$unidad[$uni-1];  
			   }  
			}  
	
			// Le agregamos la terminacion del grupo  
			switch ($i) {  
				case 2:  
				$resultado[$i].= ($resultado[$i]=="") ? "" : " mil ";  
				break;  
				case 3:  
				$resultado[$i].= ($num==1) ? " mill&oacute;n " : " millones ";  
				break;  
			}  
			$resto-=$corte;  
		}  
		  
		// Sacamos el resultado (primero invertimos el array)  
		$resultado_inv= array_reverse($resultado, TRUE);  
		$final="";  
		foreach ($resultado_inv as $parte){  
			$final.=$parte;  
		}  
		return $final;  
	}  
?>
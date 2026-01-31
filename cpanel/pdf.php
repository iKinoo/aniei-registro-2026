<?php
define('FPDF_FONTPATH','font/');
require('../funciones/fpdf/fpdf.php');
require('../funciones/basedatos.php');
require('../funciones/funciones.php');
//include('../funciones/numeros_a_letras.php');

// Nos conectamos a la Base de Datos y luego generamos el Query.
$conn = Conectar();

class PDF extends FPDF{
	//Cabecera de página
	function Header(){
	    //Logo
		if(intval($_POST['opcion']) < 3){
		    $this->Image('reconocimiento.jpg', 0, 0, 280);
		}
	    //Arial bold 15
	    //$this->SetFont('Arial','B',15);
	    //Título
	    /*$this->Cell(0,0,'UNIVERSIDAD AUTÓNOMA DE YUCATÁN',0,1,'C');
	    $this->Cell(0,10,'FACULTAD DE MATEMÁTICAS',0,1,'C');
	    $this->Cell(0,15,'Lista de Examen Ordinario',0,1,'C');
	    $this->Ln(5);*/
	 }

	//Pie de página
	/*function Footer(){
	    //Posición: a 1,5 cm del final
	    $this->SetY(-50);
	    //Arial italic 8
	    $this->SetFont('Times','',10);
	    $this->Cell(0,1,'Cantidad en letras:',0,1,'');
	    $this->SetX(10);
	    $this->Cell(95,3,"Son mil doscietos pesos.",0,0,'C');
	    $this->Ln();
	    $this->Cell(0,4,'Página '.$this->PageNo().'/{nb}',0,0,'C');
	}*/
}

	//Creación del objeto de la clase heredada
	if(intval($_POST['opcion']) < 3){
		$pdf = new PDF('L','mm','Letter'); //Horizontal
	} else {
		$pdf = new PDF('P','mm','Letter'); // Vertical
	}
	// Define un alias para el número total de páginas. Se sustituira en el momento que el documento se cierre. 
	$pdf->AliasNbPages();
	// Salto automático (Distancia desde la parte inferior de la página [20mm = 2cm])
	$pdf->SetAutoPageBreak(true,'20');
	if($_POST['opcion'] != "2") { $pdf->AddPage(); }
	$pdf->SetFont('Times','',8);
	switch($_POST['opcion']){
		case "1" : $strSQL = "SELECT u.nombre, u.apellido, a.nombre AS 'actividad' 
								FROM usuarios u
								INNER JOIN actividades a ON a.id_actividad = '".$_POST['id_actividadUsuario']."'
								WHERE u.id_usuario = '".$_POST['id_usuario']."'";
				   $reg = mysql_query($strSQL);
				   $r = mysql_fetch_array($reg, MYSQL_ASSOC);
				   $pdf->SetFont('Arial', '',30);
				   $pdf->SetY(110);
				   $pdf->Cell(0, 20, trim($r['titulo'])." ".trim($r['nombre'])." ".trim($r['apellido']), 0, 0, 'C');
				   $pdf->SetFont('Arial', '',12);
				   $pdf->SetXY(70, 130);
				   $texto = "Por haber participado en el taller de ".trim($r['actividad'])." impartido en el Congreso de ANIEI 2008";
				   $pdf->MultiCell(140, 8, $texto, 0, 'C');
				   $archivo = "Constancia de ".trim($r['nombre'])." ".trim($r['apellido'])." de ".$r['actividad'];
				   break;
				   
		case "2" : $strSQL = "SELECT i.id_actividad, a.nombre AS 'actividad', i.id_usuario, u.titulo, u.nombre, u.apellido 
								FROM inscripciones i
								INNER JOIN actividades a ON a.id_actividad = '".$_POST['id_actividad']."' 
								INNER JOIN usuarios u ON u.id_usuario = i.id_usuario
								ORDER BY u.apellido ASC";
					$reg = mysql_query($strSQL);
					while($r = mysql_fetch_array($reg)){
						$pdf->AddPage();
						$pdf->SetY(110);
						$pdf->SetFont('Arial', '',30);
						$pdf->Cell(0, 20, trim($r['titulo'])." ".trim($r['nombre'])." ".trim($r['apellido']),0,0,'C');
						$pdf->SetFont('Arial', '',12);
					    $pdf->SetXY(70, 130);
					    $texto = "Por haber participado en el taller de ".trim($r['actividad'])." impartido en el Congreso de ANIEI 2008";
					    $pdf->MultiCell(140, 8, $texto, 0, 'C');
						$actividad = $r['actividad'];
					}
					$archivo = "Constancias de ".$actividad;
					break;
		case "3" :	$strSQL = "SELECT count( a.id_actividad ) AS 'cont', a.nombre 
										FROM inscripciones i
										INNER JOIN usuarios u ON u.id_usuario = i.id_usuario
										INNER JOIN actividades a ON a.id_actividad = i.id_actividad
										GROUP BY a.id_actividad";
					$reg = mysql_query($strSQL);
					$pdf->SetY(20);
					while($r = mysql_fetch_array($reg, MYSQL_ASSOC)){
						$pdf->Cell(20, 5, $r['cont'], 0, 0, 'C');
						$pdf->Cell(100, 5, trim($r['nombre']), 0, 1, 'L');
					}
					$archivo = "ParticipantesPorActividad";
					break;
		case "4" :  /*$strSQL = "SELECT count( a.id_actividad ) AS 'cont', a.nombre 
										FROM inscripciones i
										INNER JOIN usuarios u ON u.id_usuario = i.id_usuario
										INNER JOIN actividades a ON a.id_actividad = i.id_actividad
										GROUP BY a.id_actividad";
					$reg = mysql_query($strSQL);
					while($r = mysql_fetch_array($reg, MYSQL_ASSOC)){
						$pdf->SetXY(20,20);
						$pdf->Cell(20, 10, $r['cont'], 0, 0, 'C');
						$pdf->Cell(100, 10, trim($r['nombre']), 0, 1, 'L');
					}
					$archivo = "ParticipantesPorDia";*/
					break;
		case "5" :  $strSQL = "SELECT count( u.id_entidadfederativa ) AS 'cont', e.nombre
								FROM usuarios u
								LEFT JOIN estados e ON e.id_entidadfederativa = u.id_entidadfederativa
								GROUP BY e.nombre
								ORDER BY e.id_entidadfederativa ASC";
					$reg = mysql_query($strSQL);
					$pdf->SetY(20);
					$pdf->SetFont('Arial', '',12);
					while($r = mysql_fetch_array($reg, MYSQL_ASSOC)){
						$pdf->Cell(20, 5, $r['cont'], 1, 0, 'C');
						if($r['nombre'] != ""){
							$pdf->Cell(100, 5, trim($r['nombre']), 1, 1, 'L');
						} else {
							$pdf->Cell(100, 5, "No especificaron su estado", 1, 1, 'L');
						}
					}
					$archivo = "ParticipantesPorEstado";
		case "6" : break;
		case "7" :  $strSQL = "SELECT count(genero) AS 'cont', genero FROM usuarios GROUP BY genero ORDER BY genero ASC";
					$reg = mysql_query($strSQL);
					$pdf->SetY(20);
					$pdf->SetFont('Arial', '',12);
					$sexos["F"] = "Femenino";
					$sexos["M"] = "Masculino";
					$sexos[""]  = "Sin especificar";
					while($r = mysql_fetch_array($reg, MYSQL_ASSOC)){
						$pdf->Cell(20, 5, $r['cont'], 1, 0, 'C');
						$pdf->Cell(50, 5, $sexos[$r['genero']], 1, 1, 'L');
					}
					$archivo = "ParticipantesPorGenero";
		case "8" : break;
		
	}
	$archivo = $archivo.".pdf";
	$pdf->Output($archivo,'D');
?>  
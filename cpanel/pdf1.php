<?php
define('FPDF_FONTPATH','font/');
require('../funciones/fpdf/fpdf.php');
require('../funciones/basedatos.php');
include('../funciones/numeros_a_letras.php');

// Nos conectamos a la Base de Datos y luego generamos el Query.
$conn = ConectarDB();

// Recibimos la variables por el metodo GET
$cidasignatura = $_GET["cidasignatura"];
$ianiocivil = $_GET["ianiocivil"];
$iperiodocivil = $_GET["iperiodocivil"];
$cidgrupo = $_GET["cidgrupo"];
$PlanDeEstudios = $_GET['plan'];
$Materia = $_GET['nomasig'];
class PDF extends FPDF{
	//Cabecera de página
	function Header(){
	    //Logo
	    $this->Image('imagenes/uady_png.png',12,8);
	    //Arial bold 15
	    $this->SetFont('Arial','B',14);
	    //Título
	    $this->Cell(0,0,'UNIVERSIDAD AUTÓNOMA DE YUCATÁN',0,1,'C');
	    $this->Cell(0,10,'FACULTAD DE MATEMÁTICAS',0,1,'C');
	    $this->Cell(0,15,'Lista de Examen Ordinario',0,1,'C');
	    //Logo
	    //$this->Image('imagenes/fmat_png.png',162,8);
	    $this->SetFont('Arial','',10);
	    $this->Ln(10);
	    $this->Cell(0,0,'Folio: ________    Libro: ________',0,1,'R');
	    $this->Ln(10);
	    $strSQL = "SELECT cnombre,cnombrel, iperiodo FROM asignatura WHERE cidasignatura LIKE '".$_GET['cidasignatura']."' AND cidplandeestudio = '".$_GET['plan']."'";
	    $result = mysql_query($strSQL);
	    $resultado = mysql_fetch_row($result);
	    //$Materia = $resultado[0];
	    $Periodo = $resultado[2];
		//$Materia = $_GET['nomasig'];
		$strSQL = "SELECT dtfechaexamen FROM gropo WHERE ianiocivil='".$_GET['ianiocivil']."' AND iperiodocivil='".$_GET['iperiodocivil']."' AND cidgrupo='".$_GET['cidgrupo']."'";
		$result = mysql_query($strSQL);
		$fecha = mysql_fetch_row($result);
		list($fecha1,$hora) = split(" ",$fecha[0]);
		list($anio, $mes,$dia) = split("-",$fecha1);
		$SELECT = "SELECT ga.iperiodo, g.csimbolo, a.cnombre";
		$strSQL = "FROM gropo g, profesor p, grupoprofesor gp, gropoasignatura ga, asignatura a 
					WHERE p.cidprofesor = gp.cidprofesor 
					AND gp.ianiocivil = ga.ianiocivil 
					AND gp.iperiodocivil = ga.iperiodocivil 
					AND gp.cidgrupo = ga.cidgrupo 
					AND ga.cidasignatura = a.cidasignatura 
					AND ga.cidplandeestudio = a.cidplandeestudio 
					AND ga.cidversion = a.cidversion 
					AND g.ianiocivil = gp.ianiocivil 
					AND g.iperiodocivil = gp.iperiodocivil 
					AND g.cidgrupo = gp.cidgrupo 
					AND g.ianiocivil = '".$_GET['ianiocivil']."' 
					AND g.iperiodocivil = '".$_GET['iperiodocivil']."' 
					AND g.cidgrupo = '".$_GET['cidgrupo']."' 
					AND a.cidasignatura = '".$_GET['cidasignatura']."'";
		$registros = mysql_query($SELECT." ".$strSQL);
		$registro = mysql_fetch_assoc($registros);
		$semestre = $registro['iperiodo'];		
		$Materia = $registro['cnombre'];
		$strGrupo="";
		if( $registro["csimbolo"] <> "")
  			$strGrupo = " (Grupo ".$registro["csimbolo"].$strGrupo.")";
		$strSQL = "SELECT ga.iperiodo, ga.cidplandeestudio ".$strSQL." GROUP BY ga.cidplandeestudio";
		$registro2 = mysql_query($strSQL);
		$cadena = "";
		while($rr = mysql_fetch_array($registro2,MYSQL_ASSOC)){
			$periodo = $rr['iperiodo'];
			$strSQL = "SELECT csiglas FROM plandeestudio WHERE cidplandeestudio = '".$rr['cidplandeestudio']."'";
			$temporal = mysql_query($strSQL);
			$temp_plan = mysql_fetch_row($temporal);
			$cadena = $cadena.$temp_plan[0]." (".$periodo."º semestre), ";
		}
		$fecha1 = $dia."/".$mes."/".$anio;
	    $this->Cell(0,0,'Asignatura: '.$Materia.$strGrupo,0,1,'L');
	    $this->Cell(180,0,'Fecha: '.$fecha1,0,1,'R');
	    $this->Ln(5);
		$cadena = substr($cadena, 0,strlen($cadena)-2);
	    $strSQL = "SELECT cnombre, csiglas FROM plandeestudio WHERE cidplandeestudio LIKE '".$_GET['plan']."'";
	    $result = mysql_query($strSQL);
	    $resultado = mysql_fetch_row($result);
	    $Plan = $resultado[0];
	    $this->Cell(0,0,'Programa: '.$cadena,0,1,'L');
	    $this->Ln(5);
	    $strSQL = "SELECT cgradoacademico, cnombre, capellidopaterno, capellidomaterno FROM profesor WHERE cidprofesor LIKE '".$_GET['prof']."'";
	    $result = mysql_query($strSQL);
	    $resultado = mysql_fetch_row($result);
	    $Profesor = $resultado[0].' '.$resultado[1].' '.$resultado[2].' ' .$resultado[3];
	    $this->Cell(0,0,'Profesor: '.$Profesor,0,1,'L');
		$this->ln(7);
	}

	//Pie de página
	function Footer(){
	    //Posición: a 1,5 cm del final
	    $this->SetY(-55);
	    //Arial italic 8
	    $this->SetFont('Times','',10);
	    $this->Cell(0,1,'Correcciones:',0,1,'');
	    $this->Ln();
	    //Cabecera
	    for($fila=0;$fila<5;$fila++){
	    	$this->Cell(6,4,'',1,0,'C');
			$this->Cell(90,4,'',1,0,'C');
			$this->Cell(32,4,'',1,0,'C');
			$this->Cell(10,4,'',1,0,'C');
			$this->Cell(43,4,'',1,0,'C');
			$this->Cell(15,4,'',1,1,'C');
	    }
	    $this->Ln(10);
	    $this->SetX(10);
	    $this->Cell(95,3,"_________________________________________",0,0,'C');
	    $this->Cell(95,3,"_________________________________________",0,1,'C');
	    $this->SetX(10);
	    $strSQL = "SELECT cgradoacademico, cnombre, capellidopaterno, capellidomaterno FROM profesor WHERE cidprofesor LIKE '".$_GET['prof']."'";
	    $result = mysql_query($strSQL);
	    $resultado = mysql_fetch_row($result);
	    $Profesor = $resultado[0].' '.$resultado[1].' '.$resultado[2].' ' .$resultado[3];
	    $this->Cell(95,4,$Profesor,0,0,'C');
	    $this->Cell(95,4,"M. EN C. CARLOS H. HERRERA HOYOS",0,1,'C');
	    $this->SetX(10);
	    $this->Cell(95,5,'Responsable de la Asignatura',0,0,'C');
	    $this->Cell(95,5,'Secretario Administrativo',0,0,'C');
	    $this->Ln();
	    $this->Cell(0,4,'Página '.$this->PageNo().'/{nb}',0,0,'C');
	}
}

	//Creación del objeto de la clase heredada
	$pdf=new PDF('P','mm','Letter');
	$pdf->AliasNbPages();
	$pdf->SetAutoPageBreak(true,'60');
	$pdf->AddPage();
	$pdf->SetFont('Times','',8);
	
	$strSQL = "SELECT c.lderecho, c.cidmatricula, c.icalificacion, c.lasisitio, gen.cnombre, gen.capellidopaterno, gen.capellidomaterno, c.iperiodocivil, c.cidgrupo , gen.cidplandeestudio, gen.cidversion
				FROM calificacion c, general gen 
				WHERE c.ianiocivil = ".$ianiocivil."
				AND c.iperiodocivil = ".$iperiodocivil."
				AND c.cidgrupo = '".$cidgrupo."'
				AND gen.cidplandeestudio = c.cidplandeestudio 			
				AND gen.cidversion = c.cidversion 
				AND gen.cidmatricula = c.cidmatricula 
				ORDER BY gen.capellidopaterno";
		
	$registros = mysql_query($strSQL);
	$i = 1;
	$pdf->SetFont('Times','B',9);
	$pdf->Cell(6,6,'No.',1,0,'C');
	$pdf->Cell(90,6,'Nombre',1,0,'C');
	$pdf->Cell(32,6,'Matrícula',1,0,'C');
	$pdf->Cell(10,6,'Calif.',1,0,'C');
	$pdf->Cell(43,6,'Letra',1,0,'C');
	$pdf->Cell(15,6,'Obs.',1,1,'C');
	$pdf->SetFont('Courier','',11);
	
	while ($registro = mysql_fetch_array($registros, MYSQL_ASSOC)) {
		$PlanDeEstudios = $registro['cidplandeestudio'];
		$Matricula = $registro["cidmatricula"];
		$NombreAlumno = $registro["cnombre"];
		$ApellidoPaternoAlumno = $registro["capellidopaterno"];
		$ApellidoMaternoAlumno = $registro["capellidomaterno"];
		$NombreCompletoAlumno = $ApellidoPaternoAlumno." ".$ApellidoMaternoAlumno." ".$NombreAlumno;
		$Calificacion = $registro["icalificacion"];
		$Deserto = $registro["lasisitio"];
		$Derecho = $registro["lderecho"];	
		$pdf->Cell(6,6,$i,1,0,'C');
		$pdf->Cell(90,6,$NombreCompletoAlumno,1,0,'L');
		$pdf->Cell(32,6,$PlanDeEstudios.$Matricula,1,0,'C');
		$pdf->Cell(10,6,$Calificacion,1,0,'C');
		$letras = num2letras($Calificacion);
		$pdf->Cell(43,6,$letras,1,0,'C');
		$pdf->Cell(15,6,'',1,1,'C');
		$i++;
	}
	$pdf->Output('ListaDeCalificaciones.pdf','D');
?>  
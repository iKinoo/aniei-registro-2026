<?php
define('FPDF_FONTPATH','font/');
require('../funciones/fpdf/fpdf.php');
require('../funciones/funciones.php');
require('../funciones/basedatos.php');

// Nos conectamos a la Base de Datos y luego generamos el Query.
$conn = Conectar();
mysql_query("BEGIN;");

// Recibimos la variables por el metodo GET
$folio = $_GET["folio"];

class PDF extends FPDF{
    Function ImprimeDatos($datos, $foliorecibo){
		 $this->SetFont('arial','B',10);
		 $this->setXY(53,55);
		 $this->MultiCell(97,4,strtoupper($datos['nombre']." ".$datos['apellido']),0,0,'L');
		 $this->setXY(53,71);
		 if( $datos['id_institucion'] == 0){ $nom_ins_ = $datos['institucion'];}
		 else{ $nom_ins_ = $datos['nombre_institucion'];}					      
		 $this->MultiCell(100,4,$nom_ins_ ,0,1,'J');
		 $this->setXY(53,105);			 
		 $nom_ins_ = cantidadletra($datos['costo'] );		  
		 $this->MultiCell(100,4,strtoupper("Son: ".trim($nom_ins_)." pesos 00/100 M.N."),0,0,'L');
		 $this->Text(172,63,date('d-m-Y'));	
			
		
		 $this->setXY(53,196);
		 $this->MultiCell(97,4,strtoupper($datos['nombre']." ".$datos['apellido']),0,0,'L');
		 $this->setXY(53,212);
		 if( $datos['id_institucion'] == 0){ $nom_ins_ = $datos['institucion'];}
		 else{ $nom_ins_ = $datos['nombre_institucion'];}					      
		 $this->MultiCell(100,4,$nom_ins_ ,0,1,'J');
		 $this->setXY(53,246);			 
		 $nom_ins_ = cantidadletra($datos['costo'] );		  
		 $this->MultiCell(100,4,strtoupper("Son: ".trim($nom_ins_)." pesos 00/100 M.N."),0,0,'L');
		 $this->Text(172,205,date('d-m-Y'));	 
	}
}
    // informacion General + Institucion + Deposito
    $strSQL = "SELECT u.nombre, u.apellido, u.id_usuario, u.id_cargo, u.id_tipo, u.id_institucion, u.institucion, i.nombre as 'nombre_institucion', d.monto as 'costo'
				FROM usuarios u
				LEFT JOIN instituciones i ON u.id_institucion = i.id_institucion
				LEFT JOIN depositos d ON d.id_usuario = u.id_usuario
				WHERE folio_recibo = '".$folio."'";
    $reg = mysql_query($strSQL);
    $r = mysql_fetch_array($reg, MYSQL_ASSOC);
    
	// Deposito
    $strSQL = "SELECT d.fecha,d.referencia,d.monto FROM depositos d WHERE d.id_deposito ='".$r['id_usuario']."'"; 
    //$registros = mysql_query($strSQL);
	
    $pdf=new PDF('P','mm','Letter');
	$pdf->AliasNbPages();
	$pdf->AddPage();
    $pdf->ImprimeDatos($r, $folio);
	$pdf->Output('reciboInscripcion_ANIEI_'.date("Y").'.pdf','D');
    mysql_close($conn);
?>  
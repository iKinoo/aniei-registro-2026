<?php
define('FPDF_FONTPATH','font/');
require('../funciones/fpdf/fpdf.php');
require('../funciones/funciones.php');
require('../funciones/basedatos.php');

// Nos conectamos a la Base de Datos y luego generamos el Query.
$conn = Conectar();
mysql_Query("BEGIN;");


// Recibimos la variables por el metodo GET
$FolioRecibo = $_GET["xkyyx"];

class PDF extends FPDF{


	Function ImprimeDatos( $general_, $foliorecibo){
	    
	    //Arial bold 15
	    $this->SetFont('arial','B',16);
		$this->Cell(0,0, '' ,0,0,'C');
		$this->ln(12);
	    $this->Cell(60);
		$this->SetFont('arial','B',11);
		$this->Cell(135,0,'',0,0,"R");
		$this->ln(13);
		$this->Cell(50);
		$this->SetFont('arial','B',9);
        $this->Cell(150,0,'',0,0,'L');
		$this->ln(4);
		$this->Cell(50);
        $this->Cell(150,0,'',0,1,'L');
		
        //Logo
	    $this->Image('img/anieirecibo.png',10,15,40,15);
		$this->Image('img/leyendarecibo.png',9,30,40,15);
		$this->SetLineWidth(0.5);
		$this->Line(8,14,210,14);
		$this->Line(8,31,210,31);
		$this->ln(10); // 7
		$this->SetFont('arial','',10);
		$this->Cell(45,10,'Nombre del Participante',0,0,'R');
        $this->Cell(3);
		$this->SetFont('arial','B',10);
		$this->Cell(97,10,$general_[0]." ".$general_[1],0,0,'L');
		$this->SetFont('arial','',10);
		$this->Cell(13,8,'Folio',0,0,'R');		
		$this->Cell(3);
        $this->Cell(20,7,$foliorecibo,'B',2,'C'); 		
		$this->Cell(-3,8,'Fecha',0,0,'R');
		$this->Cell(3);
        $this->Cell(20,7,date('d-m-y'),'B',1,'C'); 
        $this->ln(4);
		$this->Cell(45,10,'Institución',0,0,'R');
		 if( $general_[5] == 0){ $nom_ins_ = $general_[6];}
		 else{ $nom_ins_ = $general_[7];}
		 $this->SetFont('arial','B',10);
		 $this->ln(-5);
		 $this->Cell(47);
		$this->MultiCell(100,20,$nom_ins_,0,"J");		
		$this->SetFont('arial','',10);
		$this->ln(3);
		$this->Cell(45,10,'Concepto',0,0,'R',0);
        $this->SetFont('arial','B',10);
		$this->Cell(90,10,'INSCRIPCION AL XXI CONGRESO DE ANIEI',0,1,'L');
	    $this->SetFont('arial','',10);
		$this->ln(10);
		$this->Cell(45,10,'Cantidad',0,0,'R');
		$this->ln(-5);
		$this->Cell(45);
		$nom_ins_ = cantidadletra($general_[8] );
		$this->SetFont('arial','B',10);
		$this->MultiCell(100,20,"Son: ".$nom_ins_." pesos 00/100 M.N.",0,"J");		
		$this->SetFont('arial','',10);
		$this->ln(7);		
		$this->SetFont('arial','B',12);
		$this->Cell(50,10,'ORIGINAL CLIENTE',0,0,'R');	
		$this->SetLineWidth(0.2);
		$this->Rect(8,45,203,80);
		$this->Rect(158,70,48,38);
		$this->Rect(6,5,208,128);
		$this->Text(177,112,"Sello");
	}

    
}
    // informacion general + institucion    
    $strSQL = "SELECT u.nombre,u.apellido,u.id_asistente, u.cargo, u.tipo, u.id_institucion,u.institucion, i.nombre, u.costoins, u.codigo_barras FROM usuarios u  left join instituciones i on u.id_institucion = i.id_institucion where iFolioRecibo = ".$FolioRecibo;	
	
    $registros = mysql_query($strSQL);
    $general = mysql_fetch_row($registros);
    // Deposito
	
    $strSQL = "SELECT d.fecha,d.referencia,d.monto FROM depositos d where d.id_deposito ='".$general[2]."'"; 
    $registros = mysql_query($strSQL);
	$deposito = false;
	if (mysql_num_rows($registros) >0) {
       //$deposito = mysql_fetch_row($registros);
	   //$CostoInscripcion = $deposito[2];
	   $deposito = true;
	}
	  
	  
	  $sql = " Select iFolio from recibos where idFolioAsistente = ".$FolioRecibo;
	  $result = mysql_query($sql);
	  
	  if( mysql_num_rows($result) >0 ){
	  
	      $recibo = mysql_fetch_row($result);
	      // verificar si ya tiene asignado código y unicamente se requiere imprimir..
		  $FolioReal = $recibo[0];
	      if( $general[9] == ""){
		     // si no ha pagado puede ser que haya actualizado sus datos...
		     $sql="update  recibos set dtotal = '".$general[8]."',  dtfecha = '".date("y-m-d")."', cHora ='".date("h:i:s")."' where iFolio = ".$FolioReal;
		   $result = mysql_query($sql);		   
		 }	     
	  }
	  else
	  {
  	  	$sql="INSERT INTO recibos ( dtotal, id_asistente, idFolioAsistente,dtfecha ,cHora) VALUES ('$general[8]','$general[2]', '$FolioRecibo','".date("y-m-d")."','".date("h:i:s")."')";
		
		$result = mysql_query($sql);
	  $FolioReal = mysql_insert_id($conn );
		
		}
	 
	 
	
    $pdf=new PDF('P','mm','Letter');
	$pdf->AliasNbPages();
	$pdf->AddPage();
   
    
    $pdf->ImprimeDatos( $general,str_pad( $FolioReal, 5,"0", STR_PAD_LEFT));
   
	$pdf->Output('ReciboInscripcion.pdf','D');
    mysql_close($conn);
?>  
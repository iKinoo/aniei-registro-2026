<?
	session_start();
	header("Expires: Mon, 26 Jul 1997 05:00:00 GMT");
	header("Last-Modified: " . gmdate("D, d M Y H:i:s") . " GMT");
	header("Cache-Control: no-store, no-cache, must-revalidate");
	header("Cache-Control: post-check=0, pre-check=0", false);
	header("Pragma: no-cache");
	include("../funciones/basedatos.php");
	include("../funciones/funciones.php");
	$conn = Conectar();
	
	if(!$conn) { echo "<li>Error al conectarse a la base de datos</li>"; }
	
	if(isset($_POST['queryString'])){
		$queryString = $_POST['queryString'];
		if(strlen($queryString)>0){
			$strSQL = "SELECT u.id_usuario, u.folio_recibo, u.nombre, u.apellido, u.codigo_barras, r.ifolio as recibo  
					FROM usuarios u 
					LEFT JOIN recibos r ON u.folio_recibo = r.idFolioAsistente		
					WHERE (u.folio_recibo LIKE '%".$queryString."%' OR u.nombre LIKE '".$queryString."%') ORDER BY u.apellido, u.nombre";
			$reg = mysql_query($strSQL);
			if($reg){
				while($r = mysql_fetch_array($reg, MYSQL_ASSOC)){
					echo '<li onclick="fill(\''.$r['id_usuario'].'---'.HTML($r['nombre']).'---'.$r['apellido'].'---'.$r['codigo_barras'].'---'.HTML($r['folio_recibo']).'\')">'."[".$r['folio_recibo']."] ".HTML($r['apellido']." ".$r['nombre']).'</li>';
				}
			} else {
				echo "Error con el query";
			}
			mysql_free_result($reg);
		}
		Desconectar($conn);
	}
?>
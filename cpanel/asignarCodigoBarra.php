<?php
	session_start();
	if(!isset($_SESSION['logginuser'])){
		header("Location: index.php");
	}
	
	include ("../funciones/basedatos.php");
	$save = false;
	
	if($_SERVER['REQUEST_METHOD'] == "POST"){
		$conn = Conectar();
		mysql_query("BEGIN;");
		$strSQL = "UPDATE usuarios SET codigo_barras = '".$_POST['codigobarra']."' where id_usuario = '".$_POST['id_usuario']."'";
		mysql_query($strSQL);
		mysql_query("COMMIT;"); 	
		Desconectar($conn);
		$save = true;
	}
	
?>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd"><html><!-- InstanceBegin template="/Templates/aniei.dwt.php" codeOutsideHTMLIsLocked="false" -->
<head>
<title>:: ANIEI <? echo date("Y"); ?>::</title>
<meta http-equiv="Content-Type" content="text/html; charset=iso-8859-1" />
<link rel="stylesheet" type="text/css" href="../css/body.css">
<link rel="stylesheet" type="text/css" href="../css/exclusivo.css">
<!-- InstanceBeginEditable name="head" -->
<script language="javascript" type="text/javascript" src="../jquery/jquery-1.2.6.js"></script>
<link rel="stylesheet" type="text/css" href="../css/formulario.css">
<style type="text/css">
	.Estilo { color:#999999; font-family: Tahoma; font-size: 8pt; }
</style>

<script language="JavaScript" type="text/javascript">
<? if($save === false){ ?>
$(document).ready(function(){
	crearInputText();
});

function crearInputText(){
	var input = document.createElement("input");
	input.type = "text";
	input.name = "nombre";
	input.className = "width";
	input.id = "nombre_sitio*";
	input.onkeyup = function(){ lookup(input.value); }
	input.value = "<? echo $r['nombre_sitio'];?>";
	<? if ($_GET['accion'] == "modificar" || $_GET['accion'] == "ver"){ ?>input.disabled = true; <? } ?>
	input.onblur = function(){ DesaparecerLista(); }
	document.getElementById("temporalParraph").appendChild(input);
<? if($_GET['accion'] == "agregar"){?>
	$(input).keydown( function(e) {
		switch( e.keyCode ) {
			case 38: // up
				if( $(".suggestionList li.hover").size() == 0 ) {
					$(".suggestionList").find('LI:last').addClass('hover');
				} else {
					$(".suggestionList").find('LI.hover').removeClass('hover').prevAll('LI:not(.disabled)').eq(0).addClass('hover');
					if( $(".suggestionList").find('LI.hover').size() == 0 ) $(".suggestionList").find('LI:last').addClass('hover');
				}
			break;
			case 40: // down
				if( $(".suggestionList li.hover").size() == 0 ) {
					$(".suggestionList li").eq(0).addClass('hover');
				} else {
					$(".suggestionList").find('LI.hover').removeClass('hover').nextAll('LI:not(.disabled)').eq(0).addClass('hover');
					if( $(".suggestionList").find('LI.hover').size() == 0 ) $(".suggestionList").find('LI:first').addClass('hover');
				}
			break;
			case 13: // enter
				$(".suggestionList").find('LI.hover').trigger('click');
				e.keyCode = 0;
				return false;
			break;
		}
	});

	input.select();
	input.focus();
<? } ?>
}
<? } ?>
<? if($_GET['accion'] == "agregar" && $save === false){ ?>
function lookup(inputString){
	
	switch( window.event.keyCode ) {
		case 37:
		case 38: // up
		case 39:
		case 40: window.event.keyCode = 0; return false; break; // down
		break;
	}
	
	if(inputString.length == 0){
		$("#suggestions").fadeOut('slow');
	} else {
		$.post("autocompleteCodigoBarra.php", { queryString: ""+inputString+"" }, function (data){
			if(data.length > 0){
				$("#suggestions").fadeIn('slow');
				$("#autoSuggestionList").html(data);
			}
		});
	}
} // lookup

function(obj){
	if(obj.checked == true){
		$("input[name=torre]").each(function(){
			this.disabled = true;
		});
	}
}

function fill(thisValue){
	var a = thisValue.split("---");
	$("#nombre_sitio*").val(a[1]+a[2]);
	$("#id_usurio*").val(a[0]);
	// a[2] = nemonico
	$("#fase").html(a[3]);
	$("#id_entidadfederativa").html(a[4]);
	DesaparecerLista();
	$("#rowInformation").fadeIn('slow');
}

function DesaparecerLista(){ $("#suggestions").fadeOut('slow'); }
<? } ?>
	function ValidaForma(forma){
		if(forma.id_usuario.value == ""){
			alert("Debes seleccionar un usuario.");
			forma.nombre.focus();
			return false;
		}
		if(forma.codigobarra.value == ""){
			alert("Debes capturar el código de barras.");
			forma.codigobarra.focus();
			return false;
		}
	}
	
	function Ventana(){
		// Propiedades para que la ventana se centre y ocupe el 50% del área de la pantalla
		var alto = screen.height/2;
		var ancho = screen.width/2;
		var top = (screen.height - alto)/2;
		var left = (screen.width - ancho)/2;
		
		var cosas = 'fullscreen=no, top='+top+', left='+left+', toolbar=no, menubar=no, status=yes, scrollbars=yes, resizable=yes, height='+alto+', width='+ancho;
		var url = 'buscar_usuario.php?t='+document.getElementById("nombre").value;
		var oy=window.open(url,'Buscar',cosas);
	}
</script>
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
<? if($_SERVER['REQUEST_METHOD'] == "POST"){ ?>
<p class="centrar">&nbsp;</p>
<h3 align="center" class="centrar"><b>Se ha registrado correctamente el c&oacute;digo de barra.</b></h3>
<p class="centrar">&nbsp;</p>
<p class="centrar"><a href="asignarCodigoBarra.php">Registrar otro C&oacute;digo</a> | <a href="panel_control.php">Inicio</a> </p>
<p class="centrar">&nbsp;</p>
<? } else { ?>
<p align="center"><b>Registro del C&oacute;digo de Barras</b></p>
<form action="<? echo $_SERVER['PHP_SELF']; ?>" method="post" name="form1" id="form1" onSubmit="return ValidaForma(document.form1);"> 
  <table border="0" align="center" cellpadding="10" cellspacing="0"> 
    <tr>
      <td colspan="3" bgcolor="#F3F3F3"><p class="centrar"><b>Los campos indicados con asterisco (*) son obligatorios.<br>
      	Llene el formato utilizando may&uacute;sculas y min&uacute;sculas.</b><br>
      	<b>El d&iacute;a del evento deber&aacute; traer la copia del dep&oacute;sito bancario. </b></p></td>
    </tr>
    <tr> 
      <td colspan="3"><b></b></td> 
    </tr> 
    <tr> 
      <td align="right"><p>Participante*</p></td>
	  <td>&nbsp;</td>
      <td><div class="suggestionBox" id="suggestions" style="display:none;"><div class="suggestionList" id="autoSuggestionList"></div></div>
	    <p id="temporalParraph"><input name="id_usuario*" type="hidden" id="id_usuario*" value="<? echo $r['id_sitio']; ?>" >
	    </p></td>
    </tr> 
	<tr> 
      <td align="right"><p>Código de Barra *</p></td> 
      <td>&nbsp;</td>	  
      <td>
      	<input name="codigobarra" type="text" id="codigobarra" value="" size="30" maxlength="30" />	 </td>
    </tr> 
  </table> 
  <p align="center" class="centrar">
  	<input name="id_usuario" type="hidden" id="id_usuario" value="<?php echo $_GET['id_usuario']; ?>">
	<input name="Enviar" type="submit" value="Registrar" /></p>
  <p align="center" class="centrar"><a href="#" onClick="window.location='index.php'">Panel de Control</a> </p>
</form> 
<? } ?>
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
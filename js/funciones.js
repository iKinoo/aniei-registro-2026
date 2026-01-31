function VentanaCalculadora(id){
	var ventana = window.open ("calendario.php?id="+id,"Calendario","dependent=yes toolbar=no location=no directories=no menubar=no status=yes scrollbars=no resizable=no width=200 height=200");
	ventana.focus();
}
	
function DevuelveFecha(id,fecha){
	window.opener.document.getElementById(id).value = fecha;
	window.close();
}

function verificaSocio( valor ){  
  if(valor){
      
      document.getElementById("capaaniei").style.visibility="visible"; 
      document.getElementById("capaotra").style.visibility="hidden"; 
  }
  else { 
       document.getElementById("capaaniei").style.visibility="hidden"; 
      document.getElementById("capaotra").style.visibility="visible"; 
  }
}


function BotonDerecho(e){
	var msg = "Osos Yucatecos - Copyright© 2008";
	if ((navigator.appName == 'Netscape' && e.which == 3) || (navigator.appName == 'Microsoft Internet Explorer' && event.button==2)){
		alert(msg);
	}
	return false;
}

//document.onmousedown = BotonDerecho;
//document.oncontextmenu = BotonDerecho;

function setClassName(objId, className2) {
	document.getElementById(objId).className = className2;
}

function CambiaColor(ncolor, id){
	document.getElementById(id).style.background = "#"+ncolor;
}

function Ventana(URL, target, x, y) {
	if (x || y) {
		LeftPos = (screen.width) ? (screen.width - x) / 2 : 0;
		TopPos = (screen.height) ? (screen.height - y) / 2 : 0;
	} else {
		LeftPos = (screen.width) ? (screen.width - x) / 2 : 0;
		TopPos = (screen.height) ? (screen.height - y) / 2 : 0;
	}
	//window.onerror=BIMpopERROR; 
	BIM=window.open(URL , target, "height=" + y + ",width=" + x + ",toolbar=no,location=no,status=no,directories=no,scrollbars=no,resizable=no,left=" + LeftPos + ",top=" + TopPos); 
	//var BIM=window.showModalDialog(URL,target,"dialogHeight: "+y+"px; dialogWidth: "+x+"px; dialogTop: px; dialogLeft: px; center: Yes; resizable: No; status: No;");
	BIM.focus();
	//TerremotoXY(BIM,5);
	return false;
}

function BIMpopERROR() {
	if (!BIM) if (confirm("Probablemente tienes un programa que bloquea los POPUPs. Por favor intentalo de nuevo dando clic y presionando la tecla CTRL")); 
}

function ValidaDelete(url){
	if(confirm("¿Está seguro que desea borrar este elemento?")){
		window.location = url;	
	}
}

function ValidaDeleteUsuario(url){
	if(confirm("¿Está seguro que desea borrar este elemento?\n\rNOTA: Se eliminarán todos los datos asociados, así como su información de depósitos y facturaciones.")){
		window.location = url;	
	}
}

function addLoadEvent(func) {
    var oldonload = window.onload;
    if (typeof window.onload != 'function') {
        window.onload = func;
    } else {
        window.onload = function() {
            oldonload();
            func();
        }
    }
}

var arVersion = navigator.appVersion.split("MSIE")
var version = parseFloat(arVersion[1])

function FixPNG(){
	if ((version >= 5.5) && (document.body.filters)){
	   for(var i=0; i<document.images.length; i++)   {
		  var img = document.images[i]
		  var imgName = img.src.toUpperCase()
		  if (imgName.substring(imgName.length-3, imgName.length) == "PNG"){
			 var imgID = (img.id) ? "id='" + img.id + "' " : ""
			 var imgClass = (img.className) ? "class='" + img.className + "' " : ""
			 var imgTitle = (img.title) ? "title='" + img.title + "' " : "title='" + img.alt + "' "
			 var imgStyle = "display:inline-block;" + img.style.cssText
			 if (img.align == "left") imgStyle = "float:left;" + imgStyle
			 if (img.align == "right") imgStyle = "float:right;" + imgStyle
			 if (img.parentElement.href) imgStyle = "cursor:hand;" + imgStyle
			 var strNewHTML = "<span " + imgID + imgClass + imgTitle
			 + " style=\"" + "width:" + img.width + "px; height:" + img.height + "px;" + imgStyle + ";"
			 + "filter:progid:DXImageTransform.Microsoft.AlphaImageLoader"
			 + "(src='" + img.src + "', sizingMethod='scale');\"></span>"
			 img.outerHTML = strNewHTML
			 i = i-1
		  }
	   }
	}
}

addLoadEvent(FixPNG);

// Para que una caja de texto solo admita números enteros o flotantes
// <input name="txtQty" TYPE="text" size="6" onkeypress="onlyDigits(event,'noDec');">  noDec = no decimales
// <input name="txtPrice" TYPE="text" size="6" onkeypress="onlyDigits(event,'decOK');">  devOK = acepta decimales

var isIE = document.all?true:false;
var isNS = document.layers?true:false;
function onlyDigits(e,decReq) {
	var key = (isIE) ? window.event.keyCode : e.which;
	var obj = (isIE) ? event.srcElement : e.target;
	var isNum = (key > 47 && key < 58) ? true:false;
	var dotOK = (key==46 && decReq=='decOK' && (obj.value.indexOf(".")<0 || obj.value.length==0)) ? true:false;
	window.event.keyCode = (!isNum && !dotOK && isIE) ? 0:key;
	e.which = (!isNum && !dotOK && isNS) ? 0:key;
	return (isNum || dotOK);
}

function Disponibilidad(username){
	username = trim(username);
	if(username != ""){
		if(!isUsername(username)){ alert("Nombre de usuario incorrecto"); return false; }
		document.getElementById("btnDisponibilidad").disabled = true;
		setClassName("disponibilidad", "poner");
		setClassName("verificando", "poner");
		setClassName("disponible", "quitar");
		setClassName("no_disponible", "quitar");
		var url = "funciones/disponibilidad.php?username=" + username;
		setClassName("verificando", "quitar");
		var resultado = procesar(url);
		if( resultado == "0" ){
			// Si regresa CERO indica que el nombre de usuario esta disponible
			document.getElementById("nombre_usuario_disponible").innerText = username;
			setClassName("disponible", "poner");
			setClassName("no_disponible", "quitar");
		} else {
			// Si regresa UNO indica que el nombre de usuario no esta disponible
			document.getElementById("nombre_usuario_no_disponible").innerText = username;
			setClassName("disponible", "quitar");
			setClassName("no_disponible", "poner");
		}
		document.getElementById("btnDisponibilidad").disabled = false;
	}
}

function setClassName(objId, className2) {
	document.getElementById(objId).className = className2;
}

function toggleAceptButton() {
	document.getElementById("acepto").disabled = !document.getElementById("termino").checked;
}

function isUsername(username) {
	var expr = new RegExp("(^[a-zA-Z])[a-zA-z0-9_]{4,50}$", "gi");
	return expr.test(username);
	/********************
	flags	Significado 
	 g 		  Explorar la cadena completa 
	 i 		  No distinguir mayúsuculas de minúsuculas 
	 m 		  Permite usar varios ^y $ en el patrón 
	 s 		  Incluye el salto de línea en el comodín punto .  
	 x 		  Ignora los espacios en el patrón 
	 ********************/
}